"use client"

import { Button } from "@/components/ui/button"

interface UserFilterTabsProps {
    selectedStatus: string
    onStatusChange: (status: string) => void
}

export function UserFilterTabs({ selectedStatus, onStatusChange }: UserFilterTabsProps) {
    const statusTabs = [
        { value: "all", label: "Todos" },
        { value: "active", label: "Activos" },
        { value: "inactive", label: "Inactivos" },
        { value: "verified", label: "Verificados" },
        { value: "unverified", label: "Pendientes" },
        { value: "with_role", label: "Con Rol" },
        { value: "without_role", label: "Sin Rol" },
    ]

    return (
        <div className="flex flex-wrap gap-2">
            {statusTabs.map((option) => (
                <Button
                    key={option.value}
                    variant={selectedStatus === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onStatusChange(option.value)}
                >
                    {option.label}
                </Button>
            ))}
        </div>
    )
} 