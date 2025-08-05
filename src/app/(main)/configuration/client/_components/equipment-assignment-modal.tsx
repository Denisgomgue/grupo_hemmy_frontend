"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Search,
    Plus,
    Minus,
    Router,
    Wifi,
    Network,
    Filter,
    X,
    CheckCircle2,
    AlertCircle,
    Zap,
    Settings,
    Check,
    Clock,
    Unlink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import api from "@/lib/axios"
import { DevicesAPI } from "@/services/devices-api"
import type { Client } from "@/types/clients/client"
import { DeviceStatus, DeviceUseType, DeviceType } from "@/types/devices/device"

interface Device {
    id: number
    serialNumber?: string
    macAddress?: string
    type: DeviceType
    brand?: string
    model?: string
    status: DeviceStatus
    useType: DeviceUseType
    assignedClientId?: number
    assignedDate?: string
    notes?: string
    created_at: string
    updated_at: string
}

interface EquipmentAssignmentModalProps {
    client: Client | null
    isOpen: boolean
    onClose: () => void
}

const deviceTypeConfig = [
    { value: "all", label: "Todos los tipos", icon: Network },
    { value: DeviceType.ROUTER, label: "Routers", icon: Router },
    { value: DeviceType.DECO, label: "Mesh/Deco", icon: Wifi },
    { value: DeviceType.SWITCH, label: "Switches", icon: Network },
    { value: DeviceType.ONT, label: "ONT", icon: Zap },
    { value: DeviceType.ANTENA, label: "Antenas", icon: Wifi },
]

const getDeviceIcon = (type: DeviceType) => {
    const iconMap = {
        [ DeviceType.ROUTER ]: Router,
        [ DeviceType.DECO ]: Wifi,
        [ DeviceType.SWITCH ]: Network,
        [ DeviceType.ONT ]: Zap,
        [ DeviceType.ANTENA ]: Wifi,
        [ DeviceType.LAPTOP ]: Zap,
        [ DeviceType.CRIMPADORA ]: Settings,
        [ DeviceType.TESTER ]: Settings,
        [ DeviceType.FIBRA ]: Settings,
        [ DeviceType.CONECTOR ]: Settings,
        [ DeviceType.OTRO ]: Settings,
    }
    const IconComponent = iconMap[ type ] || Router
    return <IconComponent className="w-4 h-4" />
}

export const EquipmentAssignmentModal: React.FC<EquipmentAssignmentModalProps> = ({
    client,
    isOpen,
    onClose,
}) => {
    const [ searchTerm, setSearchTerm ] = useState("")
    const [ devices, setDevices ] = useState<Device[]>([])
    const [ selectedDevices, setSelectedDevices ] = useState<Device[]>([])
    const [ assignedDevices, setAssignedDevices ] = useState<Device[]>([])
    const [ clientInstallation, setClientInstallation ] = useState<{ id: number } | null>(null)
    const [ loading, setLoading ] = useState(false)
    const [ isSubmitting, setIsSubmitting ] = useState(false)
    const [ typeFilter, setTypeFilter ] = useState("all")
    const [ showFilters, setShowFilters ] = useState(false)

    // Cargar equipos disponibles al abrir el modal
    useEffect(() => {
        if (isOpen && client) {
            loadAvailableDevices()
            loadAssignedDevices()
            loadClientInstallation()
        }
    }, [ isOpen, client ])

    // Limpiar estado al cerrar
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm("")
            setTypeFilter("all")
            setShowFilters(false)
            setSelectedDevices([])
        }
    }, [ isOpen ])

    // Debug: Log cuando cambie el estado de assignedDevices (solo para debugging crítico)
    // useEffect(() => {
    //     // Solo log si hay cambios significativos (más de 0 equipos)
    //     if (assignedDevices.length > 0) {
    //         console.log('📊 assignedDevices actualizado:', assignedDevices.length, 'equipos')
    //     }
    // }, [ assignedDevices ])

    const loadAvailableDevices = async () => {
        setLoading(true)
        try {
            const response = await api.get("/devices/filter", {
                params: {
                    status: DeviceStatus.STOCK,
                    useType: DeviceUseType.CLIENT,
                },
            })
            setDevices(response.data)
        } catch (error) {
            console.error("Error loading devices:", error)
            toast.error("Error al cargar los equipos disponibles")
        } finally {
            setLoading(false)
        }
    }

    const loadAssignedDevices = async () => {
        if (!client) return

        try {
            const response = await api.get(`/devices/client/${client.id}`)
            // if (response.data.length > 0) {
            //     console.log('📊 Equipos asignados cargados:', response.data.length, 'equipos')
            // }
            setAssignedDevices(response.data)
        } catch (error) {
            console.error("Error loading assigned devices:", error)
            // Si no hay equipos asignados, establecer array vacío
            setAssignedDevices([])
        }
    }

    const loadClientInstallation = async () => {
        if (!client) return

        try {
            // Primero intentar con el filtro
            try {
                const response = await api.get(`/installations`, {
                    params: {
                        clientId: client.id,
                        limit: 1
                    }
                })

                if (response.data && response.data.length > 0) {
                    const installation = response.data[ 0 ]
                    // console.log('✅ Instalación encontrada para cliente:', client.id, 'ID:', installation.id)
                    setClientInstallation(installation)
                    return
                }
            } catch (filterError: any) {
                // console.log('⚠️ Error con filtro, intentando sin filtro:', filterError.message)
            }

            // Si no funciona con filtro, obtener todas y filtrar en frontend
            const allResponse = await api.get(`/installations`)
            const clientInstallation = allResponse.data.find((inst: any) => inst.client?.id === client.id)

            if (clientInstallation) {
                // console.log('✅ Instalación encontrada sin filtro para cliente:', client.id, 'ID:', clientInstallation.id)
                setClientInstallation(clientInstallation)
            } else {
                // console.log('❌ No se encontró instalación para el cliente:', client.id)
                setClientInstallation(null)
            }
        } catch (error: any) {
            console.error("Error loading client installation:", error)
            setClientInstallation(null)
        }
    }

    // Filtrar equipos
    const filteredDevices = devices.filter((device) => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
            device.brand?.toLowerCase().includes(searchLower) ||
            device.model?.toLowerCase().includes(searchLower) ||
            device.serialNumber?.toLowerCase().includes(searchLower)

        const matchesType = typeFilter === "all" || device.type === typeFilter

        return matchesSearch && matchesType
    })

    const availableDevices = filteredDevices.filter(
        (device) => !selectedDevices.find((selected) => selected.id === device.id)
    )

    // Combinar equipos asignados y recién seleccionados
    const allSelectedDevices = [ ...assignedDevices, ...selectedDevices ]

    // Debug: Log del estado actual (solo cuando hay equipos)
    // if (assignedDevices.length > 0 || selectedDevices.length > 0) {
    //     console.log('📊 Estado del modal:', {
    //         assigned: assignedDevices.length,
    //         selected: selectedDevices.length,
    //         total: allSelectedDevices.length
    //     })
    // }

    // Estadísticas
    const stats = {
        total: devices.length,
        available: devices.filter((device) => device.status === DeviceStatus.STOCK).length,
        selected: selectedDevices.length,
        assigned: assignedDevices.length,
        byType: deviceTypeConfig.slice(1).map((type) => ({
            ...type,
            count: devices.filter((device) => device.type === type.value).length,
        })),
    }

    const handleSelectDevice = (device: Device) => {
        setSelectedDevices((prev) => [ ...prev, device ])
    }

    const handleRemoveDevice = (deviceId: number) => {
        setSelectedDevices((prev) => prev.filter((device) => device.id !== deviceId))
    }

    const handleSelectAll = () => {
        setSelectedDevices((prev) => [ ...prev, ...availableDevices ])
    }

    const handleClearAll = () => {
        setSelectedDevices([])
    }

    const handleAssignEquipment = async () => {
        if (!client || selectedDevices.length === 0) return

        // Verificar que el cliente tenga una instalación
        if (!clientInstallation) {
            toast.error(`El cliente ${client.name} (ID: ${client.id}) debe tener una instalación para asignar equipos. Por favor, cree una instalación primero.`)
            // console.error('Cliente sin instalación:', {
            //     clientId: client.id,
            //     clientName: client.name,
            //     clientDni: client.dni,
            //     clientInstallation: clientInstallation
            // })
            return
        }

        setIsSubmitting(true)
        try {
            const currentDate = new Date().toISOString().split('T')[ 0 ] // Formato YYYY-MM-DD

            // console.log('🔧 Asignando', selectedDevices.length, 'equipos al cliente:', client.id, 'instalación:', clientInstallation.id)

            // Asignar equipos con todos los campos necesarios
            const updatePromises = selectedDevices.map((device) =>
                api.patch(`/devices/${device.id}`, {
                    assignedClientId: client.id,
                    assignedInstallationId: clientInstallation.id,
                    status: DeviceStatus.ASSIGNED,
                    assignedDate: currentDate,
                })
            )

            await Promise.all(updatePromises)

            toast.success(`${selectedDevices.length} equipo(s) asignado(s) exitosamente`)
            setSelectedDevices([])

            // Recargar la lista de equipos disponibles y asignados
            await Promise.all([ loadAvailableDevices(), loadAssignedDevices() ])

            // Cerrar el modal después de asignar exitosamente
            onClose()
        } catch (error) {
            console.error("Error assigning devices:", error)
            toast.error("Error al asignar los equipos")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUnassignDevice = async (device: Device) => {
        try {
            // console.log('🔧 Desasignando equipo:', device.id, 'del cliente:', client?.id)

            // Desasignar completamente el equipo
            const response = await api.patch(`/devices/${device.id}`, {
                status: DeviceStatus.MAINTENANCE,
                assignedClientId: null,
                assignedInstallationId: null,
                assignedDate: null,
            })

            toast.success(`Equipo ${device.brand} ${device.model} desasignado exitosamente`)

            // Actualizar el estado local inmediatamente
            setAssignedDevices(prev => prev.filter(d => d.id !== device.id))
            // console.log('✅ Equipo removido del estado local')

            // Recargar la lista de equipos disponibles
            await loadAvailableDevices()
        } catch (error) {
            console.error("Error unassigning device:", error)
            toast.error("Error al desasignar el equipo")
        }
    }

    const isDeviceNewlySelected = (deviceId: number) => {
        return selectedDevices.some(device => device.id === deviceId)
    }

    const isDeviceAlreadyAssigned = (deviceId: number) => {
        return assignedDevices.some(device => device.id === deviceId)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">Asignar Equipos de Red</DialogTitle>
                            <DialogDescription>
                                Busca, filtra y selecciona los equipos que deseas asignar
                                {client && ` a ${client.name} ${client.lastName}`}

                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {stats.available} disponibles
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {stats.selected} por asignar
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                {stats.assigned} asignados
                            </div>
                        </div>
                    </div>



                </DialogHeader>

                <div className="flex-1 flex flex-col gap-2">
                    {/* Controles de búsqueda y filtros */}
                    <div className="space-y-3">
                        <div className="flex gap-2 py-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Buscar por marca, modelo o número de serie..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn("gap-2", showFilters && "bg-blue-50 border-blue-200")}
                            >
                                <Filter className="w-4 h-4" />
                                Filtros
                            </Button>
                        </div>

                        {/* Panel de filtros */}
                        {showFilters && (
                            <Card className="p-4 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Tipo de equipo</label>
                                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {deviceTypeConfig.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        <div className="flex items-center gap-2">
                                                            <type.icon className="w-4 h-4" />
                                                            {type.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    <Tabs defaultValue="available" className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="available" className="gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Disponibles ({availableDevices.length})
                                </TabsTrigger>
                                <TabsTrigger value="selected" className="gap-2">
                                    <Settings className="w-4 h-4" />
                                    Seleccionados ({allSelectedDevices.length})
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex gap-2">
                                {availableDevices.length > 0 && (
                                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                        Seleccionar todos
                                    </Button>
                                )}
                                {selectedDevices.length > 0 && (
                                    <Button variant="outline" size="sm" onClick={handleClearAll}>
                                        <X className="w-4 h-4 mr-1" />
                                        Limpiar nuevos
                                    </Button>
                                )}
                            </div>
                        </div>

                        <TabsContent value="available" className="flex-1 mt-4">
                            <ScrollArea className="h-[400px]">
                                <div className="grid gap-3">
                                    {loading ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Settings className="w-8 h-8 text-gray-400 animate-spin" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando equipos...</h3>
                                        </div>
                                    ) : availableDevices.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                {searchTerm || typeFilter !== "all"
                                                    ? "No se encontraron equipos"
                                                    : "No hay equipos disponibles"}
                                            </h3>
                                            <p className="text-gray-500">
                                                {searchTerm || typeFilter !== "all"
                                                    ? "Intenta ajustar los filtros de búsqueda"
                                                    : "Todos los equipos están asignados o no disponibles"}
                                            </p>
                                        </div>
                                    ) : (
                                        availableDevices.map((device) => (
                                            <Card
                                                key={device.id}
                                                className="hover:shadow-md transition-all duration-200 hover:border-blue-200 hover:bg-purple-50"
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-4 flex-1">
                                                            <div className="p-3 bg-gray-100 rounded-xl">
                                                                {getDeviceIcon(device.type)}
                                                            </div>

                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <h4 className="font-semibold text-lg">
                                                                        {device.brand} {device.model}
                                                                    </h4>
                                                                    <Badge variant="success" className="w-max bg-green-100 text-green-800 border-green-200">
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                        Disponible
                                                                    </Badge>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                                    {device.serialNumber && (
                                                                        <div>
                                                                            <span className="font-medium">S/N:</span> {device.serialNumber}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <span className="font-medium">Tipo:</span> {device.type}
                                                                    </div>
                                                                    {device.macAddress && (
                                                                        <div>
                                                                            <span className="font-medium">MAC:</span> {device.macAddress}
                                                                        </div>
                                                                    )}
                                                                    {device.notes && (
                                                                        <div>
                                                                            <span className="font-medium">Notas:</span> {device.notes}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Button
                                                            onClick={() => handleSelectDevice(device)}
                                                            className="shrink-0"
                                                        >
                                                            <Plus className="w-4 h-4 mr-1" />
                                                            Seleccionar
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="selected" className="flex-1 mt-4">
                            <ScrollArea className="h-[400px]">
                                <div className="grid gap-3">
                                    {allSelectedDevices.map((device) => {
                                        const isNewlySelected = isDeviceNewlySelected(device.id)
                                        const isAlreadyAssigned = isDeviceAlreadyAssigned(device.id)

                                        return (
                                            <Card
                                                key={device.id}
                                                className={cn(
                                                    "transition-all duration-200",
                                                    isNewlySelected
                                                        ? "bg-purple-50 border-purple-200 hover:bg-purple-100"
                                                        : "bg-blue-50 border-blue-200"
                                                )}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className={cn(
                                                                "p-2 rounded-lg",
                                                                isNewlySelected ? "bg-purple-100" : "bg-blue-100"
                                                            )}>
                                                                {getDeviceIcon(device.type)}
                                                                {isAlreadyAssigned && (
                                                                    <Badge variant="success" className="mt-1 bg-blue-100 text-blue-800 border-blue-200 w-max">
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                        Ya asignado
                                                                    </Badge>
                                                                )}
                                                                {isNewlySelected && (
                                                                    <Badge variant="outline" className="mt-1 bg-purple-100 text-purple-800 border-purple-200">
                                                                        <Plus className="w-3 h-3 mr-1" />
                                                                        Por asignar
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex-1">
                                                                <div className={cn(
                                                                    "font-semibold",
                                                                    isNewlySelected ? "text-purple-900" : "text-blue-900"
                                                                )}>
                                                                    {device.brand} {device.model}

                                                                </div>
                                                                {device.serialNumber && (
                                                                    <div className={cn(
                                                                        "text-sm",
                                                                        isNewlySelected ? "text-purple-700" : "text-blue-700"
                                                                    )}>
                                                                        S/N: {device.serialNumber}
                                                                    </div>
                                                                )}
                                                                <div className={cn(
                                                                    "text-xs capitalize",
                                                                    isNewlySelected ? "text-purple-600" : "text-blue-600"
                                                                )}>
                                                                    {device.type}
                                                                    {device.assignedDate && (
                                                                        <span className="ml-2 flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            Asignado: {new Date(device.assignedDate).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </div>


                                                            </div>
                                                        </div>
                                                        {isNewlySelected && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleRemoveDevice(device.id)}
                                                                className="shrink-0 border-red-200 text-red-600 hover:bg-red-50"
                                                            >
                                                                <Minus className="w-4 h-4 mr-1" />
                                                                Retirar
                                                            </Button>
                                                        )}
                                                        {isAlreadyAssigned && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleUnassignDevice(device)}
                                                                className="shrink-0 border-orange-200 text-orange-600 hover:bg-orange-50"
                                                            >
                                                                <Unlink className="w-4 h-4 mr-1" />
                                                                Desasignar
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}

                                    {allSelectedDevices.length === 0 && (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Settings className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay equipos seleccionados</h3>
                                            <p className="text-gray-500">Selecciona equipos de la pestaña "Disponibles" para asignarlos</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                        {selectedDevices.length > 0 && (
                            <span>
                                {selectedDevices.length} equipo{selectedDevices.length !== 1 ? "s" : ""} por asignar
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAssignEquipment}
                            disabled={selectedDevices.length === 0 || isSubmitting || !clientInstallation}
                            className="gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Settings className="w-4 h-4 animate-spin" />
                                    Asignando...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Asignar Equipos {selectedDevices.length > 0 && `(${selectedDevices.length})`}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 