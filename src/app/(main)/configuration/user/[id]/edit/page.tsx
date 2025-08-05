"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { User, UpdateUserData } from "@/types/users/user"
import { useUsers } from "@/hooks/use-users"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, X } from "lucide-react"
import { toast } from "sonner"
import { UserForm } from "@/schemas/user-schema"
import { useRoles } from "@/hooks/use-roles"

export default function UserEditPage() {
    const params = useParams()
    const router = useRouter()
    const { getUserById, updateUser } = useUsers()
    const { roles } = useRoles()
    const [ user, setUser ] = useState<User | null>(null)
    const [ isLoading, setIsLoading ] = useState(true)
    const [ isSaving, setIsSaving ] = useState(false)
    const [ error, setError ] = useState<string | null>(null)

    const userId = Number(params.id)

    useEffect(() => {
        if (userId) {
            loadUser()
        }
    }, [ userId ])

    const loadUser = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const userData = await getUserById(userId)
            setUser(userData)
        } catch (err: any) {
            setError(err.message || "Error al cargar usuario")
            toast.error("Error al cargar usuario")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (data: UpdateUserData) => {
        try {
            setIsSaving(true)
            await updateUser(userId, data)
            toast.success("Usuario actualizado correctamente")
            router.push(`/configuration/user/${userId}`)
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar usuario")
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        router.push(`/configuration/user/${userId}`)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Cargando usuario...</p>
                </div>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Error: {error || "Usuario no encontrado"}</p>
                    <Button onClick={() => router.push("/configuration/user")}>
                        Volver a Usuarios
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/configuration/user/${userId}`)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Editar Usuario</h1>
                        <p className="text-muted-foreground">
                            Modifica la información del usuario
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                    <Button disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
            </div>

            {/* Formulario */}
            <Card>
                <CardHeader>
                    <CardTitle>Información del Usuario</CardTitle>
                    <CardDescription>
                        Actualiza los datos del usuario. Los campos marcados con * son obligatorios.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserForm
                        initialData={user}
                        roles={roles}
                        onSubmit={handleSubmit}
                        isLoading={isSaving}
                        isEdit={true}
                    />
                </CardContent>
            </Card>
        </div>
    )
} 