"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Permission } from "@/types/permissions/permission";
import { ActionsCell } from "./actions-cell";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Permission>[] = [
    {
        accessorKey: "name",
        header: "Permiso",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
        accessorKey: "routeCode",
        header: "Código ruta",
        cell: ({ row }) => row.original.routeCode,
    },
    {
        accessorKey: "actions",
        header: "Acciones",
        cell: ({ row }) => {
            const actions = row.original.actions || [];
            return (
                <div className="flex justify-center items-center gap-2">
                    {actions.length > 0 ?
                        <Badge variant="blue" className="h-6 w-6 rounded-full flex items-center justify-center">
                            {actions.length}
                        </Badge>
                        :
                        <Badge variant="default" className="h-6 w-6 rounded-full flex items-center justify-center">
                            {actions.length}
                        </Badge>
                    }
                    <span className="text-xs text-muted-foreground">
                        Accion(es) agregada(s)
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "restrictions",
        header: "Restricciones",
        cell: ({ row }) => {
            const restrictions = row.original.restrictions || [];
            return (
                <div className="flex justify-center items-center gap-2">
                    {restrictions.length > 0 ?
                        <Badge variant="destructive" className="h-6 w-6 rounded-full flex items-center justify-center">
                            {restrictions.length}
                        </Badge>
                        :
                        <Badge variant="default" className="h-6 w-6 rounded-full flex items-center justify-center">
                            {restrictions.length}
                        </Badge>
                    }
                    <span className="text-xs text-muted-foreground">
                        Restriccion(es)
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Fecha Creación",
        cell: ({ row }) => {
            const createdAt = row.getValue("createdAt") as string | null;
            if (!createdAt) return '-';
            return new Date(createdAt).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        },
    },
    {
        accessorKey: "updatedAt",
        header: "Última Actualización",
        cell: ({ row }) => {
            const updatedAt = row.getValue("updatedAt") as string | null;
            if (!updatedAt) return '-';
            return new Date(updatedAt).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        },
    },
    {
        id: "actions-cell",
        header: "Acciones",
        cell: ({ row }) => <ActionsCell rowData={row.original} />,
    },
];