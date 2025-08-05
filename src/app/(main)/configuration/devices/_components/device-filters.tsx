"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"

interface DeviceFiltersProps {
    filters: {
        status: string
        type: string
        location: string
        installationDate: string
    }
    onFiltersChange: (filters: any) => void
    className?: string
}

const deviceTypes: { value: string; label: string }[] = [
    { value: "sensor", label: "Sensor" },
    { value: "actuator", label: "Actuador" },
    { value: "gateway", label: "Gateway" },
    { value: "controller", label: "Controlador" },
    { value: "camera", label: "Cámara" },
    { value: "router", label: "Router" },
    { value: "switch", label: "Switch" },
    { value: "ont", label: "ONT" },
    { value: "deco", label: "Deco" },
    { value: "repat", label: "Repetidor" },
    { value: "herramienta", label: "Herramienta" },
    { value: "server", label: "Servidor" },
    { value: "other", label: "Otro" },
]

const statusOptions = [
    { value: "assigned", label: "Asignado" },
    { value: "stock", label: "En Stock" },
    { value: "maintenance", label: "Mantenimiento" },
    { value: "damaged", label: "Dañado" },
    { value: "lost", label: "Perdido" },
]

export function DeviceFilters({ filters, onFiltersChange, className }: DeviceFiltersProps) {
    const [ localFilters, setLocalFilters ] = useState(filters)

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...localFilters, [ key ]: value === 'all' ? '' : value }
        setLocalFilters(newFilters)
        onFiltersChange(newFilters)
    }

    const clearFilters = () => {
        const clearedFilters = {
            status: "",
            type: "",
            location: "",
            installationDate: ""
        }
        setLocalFilters(clearedFilters)
        onFiltersChange(clearedFilters)
    }

    const hasActiveFilters = Object.values(localFilters).some(value => value !== "")

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Filtros</h3>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 px-2 text-xs"
                    >
                        <X className="mr-1 h-3 w-3" />
                        Limpiar
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                    <Label htmlFor="status-filter">Estado</Label>
                    <Select
                        value={localFilters.status || 'all'}
                        onValueChange={(value) => handleFilterChange("status", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type-filter">Tipo</Label>
                    <Select
                        value={localFilters.type || 'all'}
                        onValueChange={(value) => handleFilterChange("type", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            {deviceTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location-filter">Ubicación</Label>
                    <Input
                        id="location-filter"
                        placeholder="Buscar por ubicación..."
                        value={localFilters.location}
                        onChange={(e) => handleFilterChange("location", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date-filter">Fecha Instalación</Label>
                    <Input
                        id="date-filter"
                        type="date"
                        value={localFilters.installationDate}
                        onChange={(e) => handleFilterChange("installationDate", e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
} 