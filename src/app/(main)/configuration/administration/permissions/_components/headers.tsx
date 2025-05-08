"use client";

import { Badge } from "@/components/ui/badge";
import { Permission } from "@/types/permissions/permission";

export const headers = [
    {
        key: "name",
        label: "Permiso",
        render: (value: string, item: Permission) => <span className="font-medium">{item.name}</span>,
    },
    {
        key: "routeCode",
        label: "Código ruta",
        render: (value: string, item: Permission) => item.routeCode,
    },
    {
        key: "actions",
        label: "Acciones",
        render: (value: string, item: Permission) => {
            const actions = item.actions || [];
            return (
                <div className="flex justify-start items-center gap-2">
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
        key: "restrictions",
        label: "Restricciones",
        render: (value: string, item: Permission) => {
            const restrictions = item.restrictions || [];
            return (
                <div className="flex justify-start items-center gap-2">
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
        key: "createdAt",
        label: "Fecha Creación",
        render: (value: string, item: Permission) => {
            if (!item.createdAt) return '-';
            return new Date(item.createdAt).toLocaleString('es-ES', {
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
        key: "updatedAt",
        label: "Última Actualización",
        render: (value: string, item: Permission) => {
            if (!item.updatedAt) return '-';
            return new Date(item.updatedAt).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        },
    }
];