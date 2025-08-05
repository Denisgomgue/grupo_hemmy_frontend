"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/use-permissions"
import { Permission, UpdatePermissionData } from "@/types/permissions/permission"
import { MainContainer } from "@/components/layout/main-container"
import { HeaderActions } from "@/components/layout/header-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, X } from "lucide-react"
import { PermissionForm } from "../../_components/permission-form"

export default function PermissionEditPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const { getPermissionById, updatePermission } = usePermissions()

    const [ permission, setPermission ] = useState<Permission | null>(null)
    const [ isLoading, setIsLoading ] = useState(true)
    const [ isSubmitting, setIsSubmitting ] = useState(false)
    const [ error, setError ] = useState<string | null>(null)

    const permissionId = parseInt(params.id as string, 10)

    useEffect(() => {
        async function loadPermission() {
            if (isNaN(permissionId)) {
                setError("ID de permiso inválido")
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError(null)
                const data = await getPermissionById(permissionId)
                setPermission(data)
            } catch (err: any) {
                setError(err.message || "Error al cargar el permiso")
                toast({
                    title: "Error",
                    description: err.message || "No se pudo cargar el permiso",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadPermission()
    }, [ permissionId, getPermissionById, toast ])

    const handleSubmit = async (values: UpdatePermissionData) => {
        try {
            setIsSubmitting(true)
            await updatePermission(permissionId, values)
            toast({ title: "Permiso actualizado correctamente" })
            router.push(`/configuration/permission/${permissionId}`)
        } catch (error: any) {
            toast({
                title: "Error al actualizar permiso",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        router.push(`/configuration/permission/${permissionId}`)
    }

    if (isLoading) {
        return (
            <MainContainer>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Cargando permiso...</p>
                    </div>
                </div>
            </MainContainer>
        )
    }

    if (error || !permission) {
        return (
            <MainContainer>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <X className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Error</h2>
                        <p className="text-muted-foreground mb-4">
                            {error || "No se pudo cargar el permiso"}
                        </p>
                        <Button onClick={() => router.push("/configuration/permission")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </div>
                </div>
            </MainContainer>
        )
    }

    return (
        <MainContainer>
            <HeaderActions title={`Editar Permiso: ${permission.name}`}>
                <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                </Button>
                <Button onClick={() => document.getElementById('permission-form-submit')?.click()}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                </Button>
            </HeaderActions>

            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Editar Permiso</CardTitle>
                        <CardDescription>
                            Modifica la información del permiso. Los cambios se aplicarán inmediatamente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PermissionForm
                            initialData={{
                                name: permission.name,
                                routeCode: permission.routeCode,
                                actions: permission.actions,
                                restrictions: permission.restrictions,
                                isSubRoute: permission.isSubRoute,
                            }}
                            onSubmit={handleSubmit}
                            isLoading={isSubmitting}
                        />

                        {/* Botón oculto para submit externo */}
                        <button
                            id="permission-form-submit"
                            type="submit"
                            form="permission-form"
                            className="hidden"
                        />
                    </CardContent>
                </Card>
            </div>
        </MainContainer>
    )
} 