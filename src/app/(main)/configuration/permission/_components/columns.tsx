import { ColumnDef } from "@tanstack/react-table"
import { Permission } from "@/types/permissions/permission"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    getPermissionName,
    getPermissionRouteCode,
    getPermissionActions,
    getPermissionRestrictions,
    isPermissionSubRoute,
    getPermissionStatus,
    getPermissionStatusBadge,
    getPermissionIcon,
    getPermissionRolesCount,
    formatPermissionDate,
    getFormattedRouteCode,
    getActionDescription,
    getRestrictionDescription,
} from "@/utils/permission-utils"

interface PermissionColumnsProps {
    onEdit: (permission: Permission) => void
    onDelete: (permissionId: string) => void
    onView: (permission: Permission) => void
}

export function getPermissionColumns({ onEdit, onDelete, onView }: PermissionColumnsProps): ColumnDef<Permission>[] {
    return [
        {
            accessorKey: "name",
            header: "Nombre",
            cell: ({ row }) => {
                const permission = row.original
                return (
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getPermissionIcon(getPermissionName(permission))}</div>
                        <div>
                            <div className="font-medium">{getPermissionName(permission)}</div>
                            <div className="text-sm text-muted-foreground">
                                {getFormattedRouteCode(getPermissionRouteCode(permission))}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "routeCode",
            header: "Código de Ruta",
            cell: ({ row }) => {
                const permission = row.original
                return (
                    <div className="font-mono text-sm">
                        {getPermissionRouteCode(permission)}
                    </div>
                )
            },
        },
        {
            accessorKey: "actions",
            header: "Acciones",
            cell: ({ row }) => {
                const permission = row.original
                const actions = getPermissionActions(permission)

                if (actions.length === 0) {
                    return <span className="text-muted-foreground">Sin acciones</span>
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {actions.slice(0, 3).map((action) => (
                            <Badge key={action} variant="secondary" className="text-xs">
                                {action}
                            </Badge>
                        ))}
                        {actions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{actions.length - 3}
                            </Badge>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "restrictions",
            header: "Restricciones",
            cell: ({ row }) => {
                const permission = row.original
                const restrictions = getPermissionRestrictions(permission)

                if (!restrictions || restrictions.length === 0) {
                    return <span className="text-muted-foreground">Sin restricciones</span>
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {restrictions.slice(0, 2).map((restriction) => (
                            <Badge key={restriction} variant="outline" className="text-xs">
                                {restriction}
                            </Badge>
                        ))}
                        {restrictions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                                +{restrictions.length - 2}
                            </Badge>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "isSubRoute",
            header: "Tipo",
            cell: ({ row }) => {
                const permission = row.original
                const isSubRoute = isPermissionSubRoute(permission)

                return (
                    <Badge variant={isSubRoute ? "secondary" : "default"}>
                        {isSubRoute ? "Subruta" : "Principal"}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => {
                const permission = row.original
                const status = getPermissionStatus(permission)
                const badgeVariant = getPermissionStatusBadge(permission)

                return (
                    <Badge variant={badgeVariant as any}>
                        {status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "roles",
            header: "Roles Asignados",
            cell: ({ row }) => {
                const permission = row.original
                const rolesCount = getPermissionRolesCount(permission)

                return (
                    <div className="text-center">
                        <span className="font-medium">{rolesCount}</span>
                        <div className="text-xs text-muted-foreground">roles</div>
                    </div>
                )
            },
        },
        {
            accessorKey: "created_at",
            header: "Creado",
            cell: ({ row }) => {
                const permission = row.original
                return (
                    <div className="text-sm text-muted-foreground">
                        {formatPermissionDate(permission.created_at)}
                    </div>
                )
            },
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => {
                const permission = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onView(permission)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(permission)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(permission.id.toString())}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
} 