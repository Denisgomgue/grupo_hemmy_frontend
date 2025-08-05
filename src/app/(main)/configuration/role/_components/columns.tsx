"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Role } from "@/types/roles/role"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Shield, Users, Calendar, Settings, Eye, EyeOff } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
    getRoleName,
    getRoleDescription,
    getRoleStatus,
    getRoleStatusColor,
    getRoleStatusBadge,
    getRoleIcon,
    getRolePermissionsCount,
    getRoleEmployeesCount,
    formatRoleDate
} from "@/utils/role-utils"

export function getRoleColumns(
    handleEditClick: (role: Role) => void,
    handleDeleteClick: (roleId: string) => void
): ColumnDef<Role>[] {
    return [
        {
            accessorKey: "name",
            header: "Rol",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-purple-600" />
                        </div>
                    </div>
                    <div>
                        <div className="font-medium">{getRoleName(row.original)}</div>
                        <div className="text-sm text-muted-foreground">{getRoleDescription(row.original)}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{getRoleIcon(role.name)}</span>
                        <Badge
                            variant={getRoleStatusBadge(role) as any}
                            className={getRoleStatusColor(role)}
                        >
                            {getRoleStatus(role)}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: "permissions",
            header: "Permisos",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>{getRolePermissionsCount(row.original)} permisos</span>
                </div>
            ),
        },
        {
            accessorKey: "employees",
            header: "Empleados",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{getRoleEmployeesCount(row.original)} empleados</span>
                </div>
            ),
        },
        {
            accessorKey: "visibility",
            header: "Visibilidad",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.isPublic ? (
                        <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                        <EyeOff className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-sm">
                        {row.original.isPublic ? "Público" : "Privado"}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Fecha de Creación",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                        {formatRoleDate(row.original.created_at)}
                    </span>
                </div>
            ),
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