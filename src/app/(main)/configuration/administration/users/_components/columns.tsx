"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ActionsCell } from "./actions-cell";
import { User } from "@/types/users/user";

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "Nombres",
        cell: ({ row }) => {
            const name = row.getValue("name") as string | null
            return name || '-'
        },
    },
    {
        accessorKey: "surname",
        header: "Apellidos",
        cell: ({ row }) => {
            const surname = row.getValue("surname") as string | null
            return surname || '-'
        },   
    },
    {
        accessorKey: "username",
        header: "Nombre de Usuario",
        cell: ({ row }) => {
            const username = row.getValue("username") as string | null
            return username || '-'
        },
    },
    {
        accessorKey: "documentType",
        header: "Tipo De Documento",
        cell: ({ row }) => {
            const type_document = row.getValue("documentType") as string | null
            return type_document || '-'
        },
    },
    {
        accessorKey: "documentNumber",
        header: "Documento",
        cell: ({ row }) => {
            const document = row.getValue("documentNumber") as string | null
            return document || '-'
        },
    },
    {
        accessorKey: "email",
        header: "Correo electrónico",
    },
    {
        accessorKey: "phone",
        header: "Celular",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.phone || 'N/A'}</span>
        ),
    },
    {
        accessorKey: "profile",
        header: "Perfil",
        cell: ({ row }) => {
            const role = row.original.role
            return role ? role.name : 'Sin perfil asignado'
        },
    },
    {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => {
            const isActive = row.original.isActive
            return (
                <Badge 
                    variant="outline" 
                    className={
                        isActive 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-red-100 text-red-800 border-red-200"
                    }
                >
                    {isActive ? "Activo" : "Inactivo"}
                </Badge>
            )
        }
    },
    {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => <div className="flex justify-center items-center"><ActionsCell rowData={row.original} /></div>
    },
];