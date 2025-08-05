"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash2, Settings, MapPin, Calendar, Cpu, Wifi, WifiOff, AlertTriangle, Clock, FileText, Building2 } from "lucide-react"
import { Device } from "@/types/devices/device"
import { useDevices } from "@/hooks/use-devices"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function DeviceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { getDeviceById, deleteDevice } = useDevices()
    const [ device, setDevice ] = useState<Device | null>(null)
    const [ isLoading, setIsLoading ] = useState(true)
    const [ isDeleting, setIsDeleting ] = useState(false)

    const deviceId = Number(params.id)

    useEffect(() => {
        const fetchDevice = async () => {
            try {
                setIsLoading(true)
                const deviceData = await getDeviceById(deviceId)
                setDevice(deviceData)
            } catch (error: any) {
                toast.error(error.message || "Error al cargar el dispositivo")
                router.push("/configuration/devices")
            } finally {
                setIsLoading(false)
            }
        }

        if (deviceId) {
            fetchDevice()
        }
    }, [ deviceId, getDeviceById, router ])

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await deleteDevice(deviceId)
            toast.success("Dispositivo eliminado exitosamente")
            router.push("/configuration/devices")
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar el dispositivo")
        } finally {
            setIsDeleting(false)
        }
    }

    const getStatusIcon = (status: Device[ "status" ]) => {
        switch (status) {
            case "assigned":
                return <Wifi className="h-5 w-5 text-green-600" />
            case "stock":
                return <WifiOff className="h-5 w-5 text-blue-600" />
            case "maintenance":
                return <Settings className="h-5 w-5 text-yellow-600" />
            case "damaged":
                return <AlertTriangle className="h-5 w-5 text-red-600" />
            case "lost":
                return <WifiOff className="h-5 w-5 text-red-600" />
            default:
                return <Wifi className="h-5 w-5 text-gray-600" />
        }
    }

    const getStatusBadge = (status: Device[ "status" ]) => {
        switch (status) {
            case "assigned":
                return <Badge variant="default" className="bg-green-500">Asignado</Badge>
            case "stock":
                return <Badge variant="secondary">En Stock</Badge>
            case "maintenance":
                return <Badge variant="outline">Mantenimiento</Badge>
            case "damaged":
                return <Badge variant="destructive">Dañado</Badge>
            case "lost":
                return <Badge variant="destructive">Perdido</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getTypeLabel = (type: Device[ "type" ]) => {
        const typeLabels: Record<string, string> = {
            sensor: "Sensor",
            actuator: "Actuador",
            gateway: "Gateway",
            controller: "Controlador",
            camera: "Cámara",
            router: "Router",
            switch: "Switch",
            server: "Servidor",
            deco: "Deco",
            ont: "ONT",
            repat: "Repetidor",
            herramienta: "Herramienta",
            other: "Otro"
        }
        return typeLabels[ type ] || type
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "assigned":
                return "text-green-600"
            case "stock":
                return "text-blue-600"
            case "maintenance":
                return "text-yellow-600"
            case "damaged":
                return "text-red-600"
            case "lost":
                return "text-red-600"
            default:
                return "text-gray-600"
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Cargando dispositivo...</p>
                </div>
            </div>
        )
    }

    if (!device) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Dispositivo no encontrado</p>
                <Button onClick={() => router.push("/configuration/devices")} className="mt-4">
                    Volver a dispositivos
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/configuration/devices")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{device.name}</h1>
                        <p className="text-muted-foreground">
                            {getTypeLabel(device.type)} • {device.serial_number}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente el dispositivo
                                    "{device.name || device.serial_number}" y todos sus datos asociados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isDeleting ? "Eliminando..." : "Eliminar"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Información General */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Cpu className="h-5 w-5" />
                            <span>Información General</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Estado:</span>
                            <div className="flex items-center space-x-2">
                                {getStatusIcon(device.status)}
                                {getStatusBadge(device.status)}
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Tipo:</span>
                                <span className="text-sm font-medium">{getTypeLabel(device.type)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Modelo:</span>
                                <span className="text-sm font-medium">{device.model}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Fabricante:</span>
                                <span className="text-sm font-medium">{device.manufacturer || device.brand}</span>
                            </div>
                            {device.firmware_version && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Firmware:</span>
                                    <span className="text-sm font-medium">{device.firmware_version}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Ubicación y Red */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <MapPin className="h-5 w-5" />
                            <span>Ubicación y Red</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Ubicación:</span>
                                <span className="text-sm font-medium">{device.location}</span>
                            </div>
                            {device.ip_address && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">IP:</span>
                                    <span className="text-sm font-medium">{device.ip_address}</span>
                                </div>
                            )}
                            {device.mac_address && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">MAC:</span>
                                    <span className="text-sm font-medium">{device.mac_address}</span>
                                </div>
                            )}
                            {device.coordinates && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Coordenadas:</span>
                                    <span className="text-sm font-medium">
                                        {device.coordinates.latitude.toFixed(6)}, {device.coordinates.longitude.toFixed(6)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Fechas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5" />
                            <span>Fechas</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Instalación:</span>
                                <span className="text-sm font-medium">
                                    {device.installation_date ? format(new Date(device.installation_date), "dd/MM/yyyy", { locale: es }) : "No especificada"}
                                </span>
                            </div>
                            {device.last_maintenance_date && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Último Mantenimiento:</span>
                                    <span className="text-sm font-medium">
                                        {format(new Date(device.last_maintenance_date), "dd/MM/yyyy", { locale: es })}
                                    </span>
                                </div>
                            )}
                            {device.next_maintenance_date && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Próximo Mantenimiento:</span>
                                    <span className="text-sm font-medium">
                                        {format(new Date(device.next_maintenance_date), "dd/MM/yyyy", { locale: es })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Cliente */}
                {device.client_name && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Building2 className="h-5 w-5" />
                                <span>Cliente Asignado</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{device.client_name}</span>
                                <Badge variant="outline">ID: {device.client_id}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Especificaciones */}
                {device.specifications && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Especificaciones</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {device.specifications.power_consumption && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Consumo:</span>
                                    <span className="text-sm font-medium">{device.specifications.power_consumption}</span>
                                </div>
                            )}
                            {device.specifications.operating_temperature && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Temperatura:</span>
                                    <span className="text-sm font-medium">{device.specifications.operating_temperature}</span>
                                </div>
                            )}
                            {device.specifications.dimensions && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Dimensiones:</span>
                                    <span className="text-sm font-medium">{device.specifications.dimensions}</span>
                                </div>
                            )}
                            {device.specifications.weight && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Peso:</span>
                                    <span className="text-sm font-medium">{device.specifications.weight}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Descripción */}
                {device.description && (
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Descripción</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{device.description}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
} 