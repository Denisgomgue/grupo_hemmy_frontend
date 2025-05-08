"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ActionsCell } from "./actions-cell"
import { Sector } from "@/types/sectors/sector"

export const columns: ColumnDef<Sector>[] = [
    {
        accessorKey: "name",
        header: "Nombre Sector",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
        accessorKey: "description",
        header: "Descripción",
        cell: ({ row }) => <span>{row.original.description || 'N/A'}</span>,
    },
    {
        id: "actions-cell",
        header: () => <div className="text-center">Acciones</div>,
        cell: ({ row }) => <div className="flex items-center justify-center"><ActionsCell rowData={row.original} /></div>,
    },
]

