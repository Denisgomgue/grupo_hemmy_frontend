"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Role } from "@/types/roles/role"
import { useRoles } from "@/hooks/use-roles"
import { MainContainer } from "@/components/layout/main-container"
import { HeaderActions } from "@/components/layout/header-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, X } from "lucide-react"
import { RoleForm } from "../../_components/role-form"
import { RoleFormData } from "@/schemas/role-schema"

export default function EditRolePage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const { getRoleById, updateRole } = useRoles()

    const [ role, setRole ] = useState<Role | null>(null)
    const [ isLoading, setIsLoading ] = useState(true)
    const [ isSubmitting, setIsSubmitting ] = useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)
    const [ formInstance, setFormInstance ] = useState<any>(null)

    const roleId = params.id as string

    useEffect(() => {
        async function loadRole() {
            if (!roleId) return

            try {
                setIsLoading(true)
                const data = await getRoleById(parseInt(roleId, 10))
                setRole(data)
            } catch (error: any) {
                toast({
                    title: "Error al cargar rol",
                    description: error.message,
                    variant: "destructive",
                })
                router.push("/configuration/role")
            } finally {
                setIsLoading(false)
            }
        }

        loadRole()
    }, [ roleId, getRoleById, toast, router ])

    const handleSubmit = async (values: RoleFormData) => {
        if (!role) return

        try {
            setIsSubmitting(true)
            await updateRole(role.id, values)
            toast({ title: "Rol actualizado correctamente" })
            router.push(`/configuration/role/${role.id}`)
        } catch (error: any) {
            toast({
                title: "Error al actualizar rol",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        router.push(`/configuration/role/${roleId}`)
    }

    const handleSubmitFromButton = async () => {
        if (formInstance) {
            const values = formInstance.getValues()
            await handleSubmit(values)
        }
    }

    if (isLoading) {
        return (
            <MainContainer>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Cargando rol...</p>
                    </div>
                </div>
            </MainContainer>
        )
    }

    if (!role) {
        return (
            <MainContainer>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-muted-foreground">Rol no encontrado</p>
                        <Button onClick={() => router.push("/configuration/role")} className="mt-4">
                            Volver a la lista
                        </Button>
                    </div>
                </div>
            </MainContainer>
        )
    }

    return (
        <MainContainer>
            <HeaderActions title="Editar Rol">
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancelar
                </Button>
                <Button onClick={handleSubmitFromButton} disabled={isSubmitting} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </HeaderActions>

            <div className="max-w-6xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/configuration/role/${roleId}`)}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver al detalle
                            </Button>
                        </div>
                        <CardTitle>Editar Información del Rol</CardTitle>
                        <CardDescription>
                            Modifique los datos del rol. Los campos marcados con * son obligatorios.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RoleForm
                            role={role}
                            onSubmit={handleSubmit}
                            isLoading={isSubmitting}
                            onCancel={handleCancel}
                            formRef={formRef}
                            onFormReady={setFormInstance}
                        />
                    </CardContent>
                </Card>
            </div>
        </MainContainer>
    )
} 