"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, UserPlus } from "lucide-react"
import Can from "@/components/permission/can"
import { columns } from "./_components/columns"
import { GeneralTable } from "@/components/dataTable/table"
import { useUsers } from "@/hooks/useUser"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { UserForm } from "./_components/user-form"
import { toast } from "sonner"
import api from "@/lib/axios"

import { UserFormData } from "@/schemas/user-schema"
import { ResponsiveTable } from "@/components/dataTable/responsive-table"
import { headers } from "./_components/headers"
import { ActionsCell } from "./_components/actions-cell"
import { User } from "@/types/users/user"

export default function UsersPage() {
    const { users, refreshUsers } = useUsers()
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        return users.slice(start, end)
    }, [users, currentPage, pageSize])

    const handlePaginationChange = (page: number, newPageSize: number) => {
        setCurrentPage(page)
        if (newPageSize !== pageSize) {
            setPageSize(newPageSize)
            setCurrentPage(1)
        }
    }

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            await refreshUsers();
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Error al cargar los usuarios");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers()
    }, [refreshUsers])

    const handleCreateUser = async (userData: UserFormData) => {
        setIsLoading(true)
        try {
            await api.post<UserFormData>("/user", userData);
            toast.success("Usuario creado correctamente")
            await refreshUsers();
        } catch (error) {
            toast.error("Error al crear el usuario")
            console.error("Error creating user:", error)
        } finally {
            setIsLoading(false)
            setIsDialogOpen(false)
        }
    };

    return (
        <Can action="ver-usuario" subject="configuracion-usuario" redirectOnFail={true}>
            <div className="container mx-auto bg-white dark:bg-slate-900 p-4 rounded-md border">
                <div className="flex flex-col md:flex-row justify-between items-center mb-3">
                    <h1 className="text-xl md:text-3xl mb-4 font-bold">Usuarios</h1>
                    <div className="flex md:flex-row flex-col justify-between items-center gap-2">
                        <Can action="crear-usuario" subject="configuracion-usuario">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <UserPlus className="h-4 w-4" />
                                        Agregar Usuario
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[525px]">
                                    <DialogHeader>
                                        <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
                                        <DialogDescription>Ingrese los detalles del nuevo usuario aquí.</DialogDescription>
                                    </DialogHeader>
                                    <UserForm onSubmit={handleCreateUser} onCancel={() => setIsDialogOpen(false)} />
                                </DialogContent>
                            </Dialog>
                        </Can>
                        <Button
                            variant="outline"
                            onClick={() => fetchUsers()}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            Recargar Datos
                        </Button>
                    </div>
                </div>

                <ResponsiveTable
                    columns={columns}
                    headers={headers}
                    data={paginatedData}
                    isLoading={isLoading}
                    totalRecords={users.length}
                    pageSize={pageSize}
                    onPaginationChange={handlePaginationChange}
                    actions={(row: User) => <ActionsCell rowData={row} />}
                />
            </div>
        </Can>
    )
}