"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ActionsCell } from "./actions-cell"
import { Plan } from "@/types/plans/plan"
// No se necesita Badge aquí si no se muestra estado directamente

export const columns: ColumnDef<Plan>[] = [
    {
        accessorKey: "name",
        header: "Nombre Plan",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
        // Acceder al nombre del servicio anidado
        accessorKey: "service.name",
        header: "Servicio",
        cell: ({ row }) => <span className="font-medium">{row.original.service?.name || 'N/A'}</span>,
    },
    {
        accessorKey: "speed",
        header: "Velocidad (Mbps)",
        cell: ({ row }) => <div className="text-center">{row.original.speed}</div>,
    },
    {
        accessorKey: "price",
        header: "Precio",
        // Formatear el precio en la celda
        cell: ({ row }) => <div className="text-right font-medium">S/ {row.original.price}</div>,
    },
    {
        accessorKey: "description",
        header: "Descripción",
        cell: ({ row }) => <span>{row.original.description || 'N/A'}</span>,
    },
    {
        id: "actions-cell",
        header: () => <div className="text-center">Acciones</div>, // Centrar header
        cell: ({ row }) => <div className="flex items-center justify-center"><ActionsCell rowData={row.original} /></div>,
    },
]

