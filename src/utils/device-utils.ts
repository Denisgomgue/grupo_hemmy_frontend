import { DeviceType, DeviceStatus, DeviceUseType } from "@/types/devices/device"

export const getDeviceTypeLabel = (type: DeviceType): string => {
    const typeLabels: Record<DeviceType, string> = {
        router: "Router",
        deco: "Deco",
        ont: "ONT",
        switch: "Switch",
        laptop: "Laptop",
        crimpadora: "Crimpadora",
        tester: "Tester",
        antena: "Antena",
        fibra: "Fibra",
        conector: "Conector",
        otro: "Otro"
    }
    return typeLabels[ type ] || type
}

export const getDeviceStatusLabel = (status: DeviceStatus): string => {
    const statusLabels: Record<DeviceStatus, string> = {
        STOCK: "En Stock",
        ASSIGNED: "Asignado",
        SOLD: "Vendido",
        MAINTENANCE: "Mantenimiento",
        LOST: "Perdido",
        USED: "Usado"
    }
    return statusLabels[ status ] || status
}

export const getDeviceUseTypeLabel = (useType: DeviceUseType): string => {
    const useTypeLabels: Record<DeviceUseType, string> = {
        CLIENT: "Cliente",
        EMPLOYEE: "Empleado",
        COMPANY: "Empresa",
        CONSUMABLE: "Consumible"
    }
    return useTypeLabels[ useType ] || useType
}

export const getDeviceStatusColor = (status: DeviceStatus): string => {
    const statusColors: Record<DeviceStatus, string> = {
        STOCK: "bg-gray-100 text-gray-800",
        ASSIGNED: "bg-green-100 text-green-800",
        SOLD: "bg-blue-100 text-blue-800",
        MAINTENANCE: "bg-yellow-100 text-yellow-800",
        LOST: "bg-red-100 text-red-800",
        USED: "bg-orange-100 text-orange-800"
    }
    return statusColors[ status ] || "bg-gray-100 text-gray-800"
}

export const getDeviceTypeIcon = (type: DeviceType): string => {
    const typeIcons: Record<DeviceType, string> = {
        router: "📡",
        deco: "📶",
        ont: "🔌",
        switch: "🔀",
        laptop: "💻",
        crimpadora: "🔧",
        tester: "📊",
        antena: "📡",
        fibra: "🔗",
        conector: "🔌",
        otro: "📦"
    }
    return typeIcons[ type ] || "📦"
}

export const validateMacAddress = (mac: string): boolean => {
    if (!mac) return true // Opcional
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    return macRegex.test(mac)
}

export const formatMacAddress = (mac: string): string => {
    if (!mac) return ""
    // Remover todos los caracteres no hexadecimales
    const cleanMac = mac.replace(/[^0-9A-Fa-f]/g, "")
    // Agrupar en pares y agregar dos puntos
    return cleanMac.match(/.{1,2}/g)?.join(":") || mac
}

export const getDeviceSummaryStats = (devices: any[]) => {
    const stats = {
        total: devices.length,
        byStatus: {} as Record<DeviceStatus, number>,
        byType: {} as Record<DeviceType, number>,
        byUseType: {} as Record<DeviceUseType, number>
    }

    // Inicializar contadores
    Object.values(DeviceStatus).forEach(status => {
        stats.byStatus[ status ] = 0
    })
    Object.values(DeviceType).forEach(type => {
        stats.byType[ type ] = 0
    })
    Object.values(DeviceUseType).forEach(useType => {
        stats.byUseType[ useType ] = 0
    })

    // Contar dispositivos
    devices.forEach(device => {
        stats.byStatus[ device.status ]++
        stats.byType[ device.type ]++
        stats.byUseType[ device.useType ]++
    })

    return stats
} 