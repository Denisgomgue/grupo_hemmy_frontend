"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types/users/user"
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
import { formatFullName, formatDocument, getUserStatus, getRoleStatus, formatDate, getUserAvatar, getAvatarColor } from "@/utils/user-utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "Usuario",
        cell: ({ row }) => {
            const user = row.original
            const fullName = formatFullName(user)
            const avatar = getUserAvatar(user)
            const avatarColor = getAvatarColor(user)

            return (
                <div className="flex items-center space-x-3">
                    <Avatar className={`h-8 w-8 ${avatarColor} text-white`}>
                        <AvatarFallback className="text-xs font-medium">
                            {avatar}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{fullName}</span>
                        <span className="text-sm text-muted-foreground">@{user.username}</span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{row.getValue("email")}</span>
                    <span className="text-sm text-muted-foreground">{formatDocument(row.original)}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "phone",
        header: "Teléfono",
        cell: ({ row }) => {
            const phone = row.getValue("phone") as string
            return phone || "Sin teléfono"
        },
    },
    {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => {
            const user = row.original
            const roleStatus = getRoleStatus(user)

            return (
                <Badge variant={roleStatus.variant}>
                    {roleStatus.label}
                </Badge>
            )
        },
    },
    {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => {
            const user = row.original
            const status = getUserStatus(user)

            return (
                <Badge variant={status.variant}>
                    {status.label}
                </Badge>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: "Fecha de Creación",
        cell: ({ row }) => {
            return formatDate(row.getValue("created_at"))
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original

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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Button variant="ghost" size="sm" className="w-full justify-start">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Button variant="ghost" size="sm" className="w-full justify-start">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
] 