"use client"

import { Button } from "@/components/ui/button"
import { DeviceStatus } from "@/types/devices/device"

interface DeviceFilterTabsProps {
    selectedStatus: string
    onStatusChange: (status: string) => void
}

export function DeviceFilterTabs({ selectedStatus, onStatusChange }: DeviceFilterTabsProps) {
    const statusTabs = [
        { value: "all", label: "Todos" },
        { value: "assigned", label: "Asignados" },
        { value: "stock", label: "En Stock" },
        { value: "maintenance", label: "Mantenimiento" },
        { value: "damaged", label: "Dañados" },
        { value: "lost", label: "Perdidos" },
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