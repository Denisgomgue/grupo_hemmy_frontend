"use client";

import { Badge } from "@/components/ui/badge";
import { User } from "@/types/users/user";

export const headers = [
    {
        key: "name",
        label: "Nombres",
        render: (value: string, item: User) => {
            return item.name || '-'
        },
    },
    {
        key: "surname",
        label: "Apellidos",
        render: (value: string, item: User) => {
            return item.surname || '-'
        },   
    },
    {
        key: "username",
        label: "Nombre de Usuario",
        render: (value: string, item: User) => {
            return item.username || '-'
        },
    },
    {
        key: "documentType",
        label: "Tipo De Documento",
        render: (value: string, item: User) => {
            return item.documentType || '-'
        },
    },
    {
        key: "documentNumber",
        label: "Documento",
        render: (value: string, item: User) => {
            return item.documentNumber || '-'
        },
    },
    {
        key: "email",
        label: "Correo electrónico",
    },
    {
        key: "phone",
        label: "Celular",
        render: (value: string, item: User) => (
            <span className="font-medium">{item.phone || 'N/A'}</span>
        ),
    },
    {
        key: "profile",
        label: "Perfil",
        render: (value: string, item: User) => {
            const role = item.role
            return role ? role.name : 'Sin perfil asignado'
        },
    },
    {
        key: "isActive",
        label: "Estado",
        render: (value: string, item: User) => {
            const isActive = item.isActive
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
    }
];