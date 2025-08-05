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

interface UserFiltersProps {
    filters: {
        status: string
        role: string
        documentType: string
        verification: string
    }
    onFiltersChange: (filters: any) => void
    className?: string
}

const documentTypes: { value: string; label: string }[] = [
    { value: "DNI", label: "DNI" },
    { value: "CE", label: "Carné de Extranjería" },
    { value: "PASSPORT", label: "Pasaporte" },
    { value: "RUC", label: "RUC" },
    { value: "OTHER", label: "Otro" },
]

const statusOptions = [
    { value: "active", label: "Activos" },
    { value: "inactive", label: "Inactivos" },
]

const verificationOptions = [
    { value: "verified", label: "Verificados" },
    { value: "unverified", label: "Pendientes" },
]

export function UserFilters({ filters, onFiltersChange, className }: UserFiltersProps) {
    const [ localFilters, setLocalFilters ] = useState(filters)

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...localFilters, [ key ]: value === 'all' ? '' : value }
        setLocalFilters(newFilters)
        onFiltersChange(newFilters)
    }

    const clearFilters = () => {
        const clearedFilters = {
            status: "",
            role: "",
            documentType: "",
            verification: ""
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
                    <Label htmlFor="role-filter">Rol</Label>
                    <Select
                        value={localFilters.role || 'all'}
                        onValueChange={(value) => handleFilterChange("role", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Todos los roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los roles</SelectItem>
                            <SelectItem value="with_role">Con rol</SelectItem>
                            <SelectItem value="without_role">Sin rol</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="document-type-filter">Tipo de Documento</Label>
                    <Select
                        value={localFilters.documentType || 'all'}
                        onValueChange={(value) => handleFilterChange("documentType", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            {documentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="verification-filter">Verificación</Label>
                    <Select
                        value={localFilters.verification || 'all'}
                        onValueChange={(value) => handleFilterChange("verification", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {verificationOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
} 