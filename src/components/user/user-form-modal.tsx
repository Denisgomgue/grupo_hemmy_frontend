"use client"

import { useState } from "react"
import { User, CreateUserData, UpdateUserData } from "@/types/users/user"
import { UserForm } from "@/schemas/user-schema"
import { useUsers } from "@/hooks/use-users"
import { useRoles } from "@/hooks/use-roles"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface UserFormModalProps {
    isOpen: boolean
    onClose: () => void
    user?: User
    onSuccess?: () => void
}

export function UserFormModal({ isOpen, onClose, user, onSuccess }: UserFormModalProps) {
    const [ isLoading, setIsLoading ] = useState(false)
    const { createUser, updateUser } = useUsers()
    const { roles } = useRoles()
    const isEdit = !!user

    const handleSubmit = async (data: CreateUserData | UpdateUserData) => {
        try {
            setIsLoading(true)

            if (isEdit) {
                await updateUser(user.id, data as UpdateUserData)
                toast.success("Usuario actualizado correctamente")
            } else {
                await createUser(data as CreateUserData)
                toast.success("Usuario creado correctamente")
            }

            onSuccess?.()
            onClose()
        } catch (error: any) {
            toast.error(error.message || "Error al guardar usuario")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Editar Usuario" : "Crear Nuevo Usuario"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Modifica la información del usuario seleccionado."
                            : "Completa la información para crear un nuevo usuario."
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <UserForm
                        initialData={user}
                        roles={roles}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        isEdit={isEdit}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 