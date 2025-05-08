"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Profile } from "@/types/profiles/profile";
import { ActionsCell } from "./actions-cell";
import { Badge } from "@/components/ui/badge";
import { PermissionsCell } from "./permission-cell";

export const columns: ColumnDef<Profile>[] = [
    {
        accessorKey: "name",
        header: "Perfil",
        cell: ({ row }) => (
            <div className="font-medium">{row.original.name}</div>
        ),
    },
    {
        accessorKey: "description",
        header: "Descripción",
        cell: ({ row }) => (
            <div className="text-sm text-muted-foreground">
                {row.original.description || "Sin descripción"}
            </div>
        ),
    },
    {
        accessorKey: "allowAll",
        header: "SuperAdmin",
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                {row.original.allowAll ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-[#28C76F]/20 dark:text-green-600 font-normal">
                        Habilitado
                    </Badge>
                ) : (
                    <div className="text-sm text-muted-foreground">
                        false
                    </div>
                )}
            </div>
        ),
    },
    {
        accessorKey: "role_has_permissions",
        header: "Permisos",
        cell: ({ row }) => (
            <PermissionsCell
                permissions={row.original.role_has_permissions || []}
                allowAll={row.original.allowAll}
            />
        ),
    },
    {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => <div className="flex items-center justify-center"><ActionsCell rowData={row.original} /></div>
    },
];