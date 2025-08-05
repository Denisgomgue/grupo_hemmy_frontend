import { DeviceType, DeviceStatus } from "@/types/devices/device"

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
    router: "Router",
    deco: "Deco",
    ont: "ONT",
    switch: "Switch",
    repat: "Repetidor",
    herramienta: "Herramienta"
}

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
    assigned: "Asignado",
    stock: "En Stock",
    maintenance: "Mantenimiento",
    damaged: "Dañado",
    lost: "Perdido"
}

export const DEVICE_STATUS_COLORS: Record<DeviceStatus, string> = {
    assigned: "bg-green-500",
    stock: "bg-blue-500",
    maintenance: "bg-yellow-500",
    damaged: "bg-red-500",
    lost: "bg-red-600"
}

export const DEVICE_STATUS_VARIANTS: Record<DeviceStatus, "default" | "secondary" | "outline" | "destructive"> = {
    assigned: "default",
    stock: "secondary",
    maintenance: "outline",
    damaged: "destructive",
    lost: "destructive"
}

export function getDeviceTypeLabel(type: DeviceType): string {
    return DEVICE_TYPE_LABELS[ type ] || type
}

export function getDeviceStatusLabel(status: DeviceStatus): string {
    return DEVICE_STATUS_LABELS[ status ] || status
}

export function getDeviceStatusColor(status: DeviceStatus): string {
    return DEVICE_STATUS_COLORS[ status ] || "bg-gray-500"
}

export function getDeviceStatusVariant(status: DeviceStatus): "default" | "secondary" | "outline" | "destructive" {
    return DEVICE_STATUS_VARIANTS[ status ] || "outline"
} 