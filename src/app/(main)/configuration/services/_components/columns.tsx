"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ActionsCell } from "./actions-cell"
// Eliminar importación no usada
// import { Client } from "@/types/clients/client"
import { Service, ServiceStatus } from "@/types/services/service"
import { Badge } from "@/components/ui/badge" // Añadir importación para Badge

export const columns: ColumnDef<Service>[] = [
    {
        // Cambiar a la propiedad 'name' de Service
        accessorKey: "name",
        header: "Nombre",
        // Mostrar el nombre directamente
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
        // Cambiar a la propiedad 'description' de Service
        accessorKey: "description",
        header: "Descripción",
        // Mostrar la descripción
        cell: ({ row }) => <span>{row.original.description || 'N/A'}</span>,
    },
    {
        // Cambiar a la propiedad 'status' de Service
        accessorKey: "status",
        header: "Estado",
        // Mostrar el estado con un Badge
        cell: ({ row }) => (
            <div className="text-center">
                 <Badge variant={row.original.status === ServiceStatus.ACTIVE ? "success" : "destructive"}>
                    {row.original.status}
                </Badge>
            </div>
        ),
    },
    {
        id: "actions-cell",
        header: "Acciones",
        // ActionsCell ya está configurada para recibir rowData de tipo Service
        cell: ({ row }) => <div className="flex items-center justify-center"><ActionsCell rowData={row.original} /></div>,
    },
]

