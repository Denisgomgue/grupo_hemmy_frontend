"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Device, DeviceStatus, DeviceType, DeviceUseType } from "@/types/devices/device"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2, Cpu, User, ClipboardList, Calendar, UserCog } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
        case "ASSIGNED":
            return <Badge variant="default" className="bg-green-500 w-max">Asignado</Badge>
        case "STOCK":
            return <Badge variant="secondary" className="w-max">En Stock</Badge>
        case "MAINTENANCE":
            return <Badge variant="outline" className="w-max">Mantenimiento</Badge>
        case "SOLD":
            return <Badge variant="default" className="bg-blue-500 w-max">Vendido</Badge>
        case "LOST":
            return <Badge variant="destructive" className="w-max">Perdido</Badge>
        case "USED":
            return <Badge variant="default" className="bg-orange-500 w-max">Usado</Badge>
        default:
            return <Badge variant="outline" className="w-max">{status}</Badge>
    }
}

const getTypeLabel = (type: DeviceType) => {
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

const getUseTypeLabel = (useType: DeviceUseType) => {
    const useTypeLabels: Record<DeviceUseType, string> = {
        CLIENT: "Cliente",
        EMPLOYEE: "Empleado",
        COMPANY: "Empresa",
        CONSUMABLE: "Consumible"
    }
    return useTypeLabels[ useType ] || useType
}

export function getDeviceColumns(
    handleEditClick: (device: Device) => void,
    handleDeleteClick: (deviceId: string) => void
): ColumnDef<Device>[] {
    return [
        {
            accessorKey: "serialNumber",
            header: "Serial",
            cell: ({ row }) => row.original.serialNumber || <span className="text-muted-foreground">-</span>,
        },
        {
            accessorKey: "type",
            header: "Tipo",
            cell: ({ row }) => getTypeLabel(row.original.type),
        },
        {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => getStatusBadge(row.original.status),
        },
        {
            accessorKey: "useType",
            header: "Tipo de Uso",
            cell: ({ row }) => getUseTypeLabel(row.original.useType),
        },
        {
            accessorKey: "brand",
            header: "Marca",
            cell: ({ row }) => row.original.brand || <span className="text-muted-foreground">-</span>,
        },
        {
            accessorKey: "model",
            header: "Modelo",
            cell: ({ row }) => row.original.model || <span className="text-muted-foreground">-</span>,
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(row.original)}
                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                    >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(row.original.id.toString())}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                    </Button>
                </div>
            ),
        }
    ]
} 