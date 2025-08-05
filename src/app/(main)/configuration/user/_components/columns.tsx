"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types/users/user"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2, User as UserIcon, Mail, Shield, Phone, Calendar, CheckCircle, XCircle } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
        return <Badge variant="default" className="bg-green-500">Activo</Badge>
    } else {
        return <Badge variant="destructive">Inactivo</Badge>
    }
}

const getRoleBadge = (role?: any) => {
    if (role) {
        return <Badge variant="outline" className="bg-purple-100 text-purple-700">{role.name}</Badge>
    } else {
        return <Badge variant="secondary">Sin rol</Badge>
    }
}

const getVerificationBadge = (emailVerified?: boolean) => {
    if (emailVerified) {
        return <Badge variant="default" className="bg-blue-500">Verificado</Badge>
    } else {
        return <Badge variant="outline">Pendiente</Badge>
    }
}

const getDocumentTypeLabel = (type?: string) => {
    const typeLabels: Record<string, string> = {
        DNI: "DNI",
        CE: "Carné de Extranjería",
        PASSPORT: "Pasaporte",
        RUC: "RUC",
        OTHER: "Otro"
    }
    return typeLabels[ type || "" ] || "N/A"
}

export function getUserColumns(
    handleEditClick: (user: User) => void,
    handleDeleteClick: (userId: string) => void
): ColumnDef<User>[] {
    return [
        {
            accessorKey: "name",
            header: "Nombre",
            cell: ({ row }) => {
                const user = row.original;
                const fullName = `${user.name || ''} ${user.surname || ''}`.trim() || user.username;
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <div className="font-medium">{fullName}</div>
                            <div className="text-xs text-muted-foreground">@{user.username}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-[200px]">{row.original.email}</span>
                </div>
            ),
        },
        {
            accessorKey: "role",
            header: "Rol",
            cell: ({ row }) => getRoleBadge(row.original.role),
        },
        {
            accessorKey: "isActive",
            header: "Estado",
            cell: ({ row }) => getStatusBadge(row.original.isActive),
        },
        {
            accessorKey: "emailVerified",
            header: "Verificación",
            cell: ({ row }) => getVerificationBadge(row.original.emailVerified),
        },
        {
            accessorKey: "documentType",
            header: "Documento",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div>
                        <div className="text-sm">{getDocumentTypeLabel(user.documentType)}</div>
                        <div className="text-xs text-muted-foreground">{user.documentNumber || 'N/A'}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: "phone",
            header: "Teléfono",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{row.original.phone || 'N/A'}</span>
                </div>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Fecha Creación",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                        {row.original.created_at
                            ? format(new Date(row.original.created_at), "dd/MM/yyyy", { locale: es })
                            : 'N/A'
                        }
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