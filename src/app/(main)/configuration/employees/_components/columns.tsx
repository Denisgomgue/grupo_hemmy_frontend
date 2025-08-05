"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Employee } from "@/types/employees/employee"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, User, Phone, Calendar, UserCog } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getFullName, formatDni, formatPhone, getRoleIcon, getEmployeeStatusColor } from "@/utils/employee-utils"

export function getEmployeeColumns(
    handleEditClick: (employee: Employee) => void,
    handleDeleteClick: (employeeId: string) => void
): ColumnDef<Employee>[] {
    return [
        {
            accessorKey: "name",
            header: "Empleado",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                    <div>
                        <div className="font-medium">{getFullName(row.original)}</div>
                        <div className="text-sm text-muted-foreground">{formatDni(row.original.dni)}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "role",
            header: "Rol",
            cell: ({ row }) => {
                const role = row.original.role;
                if (!role) {
                    return <Badge variant="outline">Sin rol</Badge>;
                }
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{getRoleIcon(role.name)}</span>
                        <Badge
                            variant="secondary"
                            className={getEmployeeStatusColor(row.original)}
                        >
                            {role.name}
                        </Badge>
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
                    <span>{row.original.phone ? formatPhone(row.original.phone) : "-"}</span>
                </div>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Fecha de Registro",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                        {format(new Date(row.original.created_at), "dd/MM/yyyy", { locale: es })}
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