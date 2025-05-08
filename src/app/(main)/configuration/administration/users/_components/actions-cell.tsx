"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import api from "@/lib/axios"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, UserCog, Edit, Power } from "lucide-react"
import type { Profile } from "@/types/profiles/profile"
import { UserForm } from "./edituser-from"
import { useUsers } from "@/hooks/useUser"
import Can from "@/components/permission/can"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import type { User } from "@/types/users/user"
import useSWR from "swr"
import { useAuth } from "@/contexts/AuthContext"
import { formSchema } from "@/schemas/user-schema"
import * as z from "zod"
interface ActionsCellProps {
    rowData: User
}

const fetcher = (url: string) => api.get(url).then((res) => res.data)

export const ActionsCell: React.FC<ActionsCellProps> = ({ rowData }) => {
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedProfile, setSelectedProfile] = useState<number | null>(null)
    const { user } = useAuth()
    const [showStatusDialog, setShowStatusDialog] = useState(false)

    const { refreshUsers } = useUsers()

    const { data: profiles, error, isLoading: profilesLoading } = useSWR<Profile[]>("/roles", fetcher)

    const handleOpenProfileDialog = (user: any) => {
        console.log(user)
        setIsProfileDialogOpen(true)
        setSelectedProfile(null)
    }

    const handleProfileSelect = async () => {
        if (selectedProfile) {
            try {
                await api.post(`/user/${rowData.id}/role/${selectedProfile}`)
                toast.success(`Perfil asignado correctamente al usuario ${rowData.name || ""}.`)
                setIsProfileDialogOpen(false)
                setSelectedProfile(null)
                await refreshUsers()
            } catch (error) {
                console.error("Error asignando el perfil:", error)
                toast.error("No se pudo asignar el perfil. Por favor, inténtalo de nuevo.")
            }
        }
    }

    const handleDelete = async () => {
        try {
            setLoading(true)
            await api.delete(`/user/${rowData.id}`)
            toast.success(`Usuario ${rowData.name || ""} eliminado exitosamente.`)
            await refreshUsers()
        } catch (error) {
            console.error("Error eliminando usuario:", error)
            toast.error("No se pudo eliminar al usuario. Por favor, inténtalo de nuevo.")
        } finally {
            setLoading(false)
            setShowDeleteDialog(false)
        }
    }

    const handleToggleStatus = async () => {
        if (rowData.email === user?.email && rowData.isActive) {
            toast.error("No puedes desactivar tu propia cuenta")
            return
        }
        try {
            const updatedStatus = !rowData.isActive;
            await api.patch(`/user/${rowData.id}`, { isActive: updatedStatus })
            toast.success(`Usuario ${updatedStatus ? 'activado' : 'desactivado'} exitosamente`)
            await refreshUsers() 
        } catch (error) {
            console.error("Error:", error)
            toast.error(`Error al ${rowData.isActive ? 'desactivar' : 'activar'} el usuario`)
        } finally {
            setShowStatusDialog(false)
        }
    }

    const handleUpdateUser = async (values: z.infer<typeof formSchema>) => {
        try {
            await api.patch(`/user/${rowData.id}`, values)
            toast.success("Usuario actualizado exitosamente")
            setIsEditDialogOpen(false)
            refreshUsers()
        } catch (error) {
            console.error("Error actualizando usuario:", error)
            toast.error("Error al actualizar usuario")
        }
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <Can action="editar-usuario" subject="configuracion-usuario">
                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsEditDialogOpen(true)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar Usuario</p>
                        </TooltipContent>
                    </Tooltip>
                </Can>
                <Can action="asignar-perfil" subject="configuracion-usuario">
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="outline" size="icon" onClick={() => handleOpenProfileDialog(rowData)}>
                                <UserCog />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Asignar Perfil</p>
                        </TooltipContent>
                    </Tooltip>
                </Can>
                <Can action="eliminar-usuario" subject="configuracion-usuario">
                    {rowData.email !== user?.email && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Eliminar Usuario</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </Can>
                <Can action="estado-usuario" subject="configuracion-usuario">
                    {rowData.email !== user?.email && (
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setShowStatusDialog(true)}
                                    className={rowData.isActive ? 'bg-green-100' : 'bg-red-100'}
                                    disabled={rowData.email === user?.email}
                                >
                                    <Power className={`h-4 w-4 ${rowData.isActive ? 'text-green-600' : 'text-red-600'}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{rowData.isActive ? 'Desactivar' : 'Activar'} Usuario</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </Can>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                    </DialogHeader>
                    <UserForm
                        user={rowData}
                        onSubmit={handleUpdateUser}
                        onCancel={() => setIsEditDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Seleccionar Perfil</DialogTitle>
                    </DialogHeader>
                    {profilesLoading || profilesLoading ? (
                        <p>Cargando perfiles...</p>
                    ) : error ? (
                        <p>Error al cargar perfiles. Inténtalo de nuevo.</p>
                    ) : (
                        <Select value={selectedProfile?.toString()} onValueChange={(value) => setSelectedProfile(Number(value))}>
                            <SelectTrigger>
                                {profiles?.find(profile => profile.id === selectedProfile)?.name || "Selecciona un perfil"}
                            </SelectTrigger>
                            <SelectContent>
                                {profiles?.map((profile) => (
                                    <SelectItem key={profile.id} value={profile.id.toString()}>
                                        {profile.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleProfileSelect}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {rowData.isActive
                                ? `¿Deseas desactivar al usuario ${rowData.name}? El usuario no podrá acceder al sistema.`
                                : `¿Deseas activar al usuario ${rowData.name}? El usuario podrá volver a acceder al sistema.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleToggleStatus}
                            className={rowData.isActive ? 'bg-destructive hover:bg-destructive/90' : 'bg-green-600 hover:bg-green-700'}
                        >
                            {rowData.isActive ? 'Sí, desactivar' : 'Sí, activar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-destructive dark:bg-destructive dark:hover:bg-destructive/90 text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
