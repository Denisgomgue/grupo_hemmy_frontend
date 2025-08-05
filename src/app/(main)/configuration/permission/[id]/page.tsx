"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/use-permissions"
import { Permission } from "@/types/permissions/permission"
import { MainContainer } from "@/components/layout/main-container"
import { HeaderActions } from "@/components/layout/header-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
    ArrowLeft,
    Edit,
    Trash2,
    Shield,
    Route,
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    AlertTriangle
} from "lucide-react"
import {
    getPermissionName,
    getPermissionRouteCode,
    getPermissionActions,
    getPermissionRestrictions,
    isPermissionSubRoute,
    getPermissionStatus,
    getPermissionStatusBadge,
    getPermissionIcon,
    getPermissionAvatarColor,
    getPermissionInitials,
    getPermissionRolesCount,
    formatPermissionDate,
    getFormattedRouteCode,
    getActionDescription,
    getRestrictionDescription,
} from "@/utils/permission-utils"
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

export default function PermissionDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const { getPermissionById, deletePermission } = usePermissions()

    const [ permission, setPermission ] = useState<Permission | null>(null)
    const [ isLoading, setIsLoading ] = useState(true)
    const [ error, setError ] = useState<string | null>(null)
    const [ isDeleting, setIsDeleting ] = useState(false)
    const [ showDeleteDialog, setShowDeleteDialog ] = useState(false)

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

    const handleEdit = () => {
        router.push(`/configuration/permission/${permissionId}/edit`)
    }

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await deletePermission(permissionId)
            toast({ title: "Permiso eliminado correctamente" })
            router.push("/configuration/permission")
        } catch (error: any) {
            toast({
                title: "Error al eliminar permiso",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
        }
    }

    const handleBack = () => {
        router.push("/configuration/permission")
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
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Error</h2>
                        <p className="text-muted-foreground mb-4">
                            {error || "No se pudo cargar el permiso"}
                        </p>
                        <Button onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </div>
                </div>
            </MainContainer>
        )
    }

    const actions = getPermissionActions(permission)
    const restrictions = getPermissionRestrictions(permission)
    const rolesCount = getPermissionRolesCount(permission)
    const isSubRoute = isPermissionSubRoute(permission)

    return (
        <MainContainer>
            <HeaderActions title={`Detalle del Permiso: ${getPermissionName(permission)}`}>
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <Button onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                </Button>
            </HeaderActions>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Información básica */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-4">
                                <Avatar className={`h-16 w-16 ${getPermissionAvatarColor(getPermissionName(permission))}`}>
                                    <AvatarFallback className="text-white text-lg">
                                        {getPermissionInitials(permission)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-2xl">{getPermissionName(permission)}</CardTitle>
                                    <CardDescription className="font-mono text-base">
                                        {getPermissionRouteCode(permission)}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                    <div className="mt-1">
                                        <Badge variant={getPermissionStatusBadge(permission) as any}>
                                            {getPermissionStatus(permission)}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Tipo de Ruta</label>
                                    <div className="mt-1">
                                        <Badge variant={isSubRoute ? "secondary" : "default"}>
                                            {isSubRoute ? "Subruta" : "Principal"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
                                    <p className="mt-1">{formatPermissionDate(permission.created_at)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
                                    <p className="mt-1">{formatPermissionDate(permission.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Acciones */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Shield className="h-5 w-5" />
                                <span>Acciones ({actions.length})</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {actions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {actions.map((action) => (
                                        <div key={action} className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <div>
                                                <div className="font-medium">{action}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {getActionDescription(action)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No hay acciones definidas para este permiso</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Restricciones */}
                    {restrictions && restrictions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5" />
                                    <span>Restricciones ({restrictions.length})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {restrictions.map((restriction) => (
                                        <div key={restriction} className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            <div>
                                                <div className="font-medium">{restriction}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {getRestrictionDescription(restriction)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Roles asignados */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Roles Asignados</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">{rolesCount}</div>
                                <p className="text-sm text-muted-foreground">
                                    {rolesCount === 1 ? 'rol asignado' : 'roles asignados'}
                                </p>
                            </div>

                            {permission.role_has_permissions && permission.role_has_permissions.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <Separator />
                                    <div className="text-sm font-medium">Roles que usan este permiso:</div>
                                    {permission.role_has_permissions.slice(0, 5).map((rolePermission) => (
                                        <div key={rolePermission.id} className="flex items-center space-x-2 p-2 bg-muted rounded">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{rolePermission.name}</span>
                                        </div>
                                    ))}
                                    {permission.role_has_permissions.length > 5 && (
                                        <div className="text-sm text-muted-foreground text-center">
                                            +{permission.role_has_permissions.length - 5} más
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Información adicional */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Adicional</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Código de Ruta</label>
                                <p className="mt-1 font-mono text-sm bg-muted p-2 rounded">
                                    {getPermissionRouteCode(permission)}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Ruta Formateada</label>
                                <p className="mt-1 text-sm">
                                    {getFormattedRouteCode(getPermissionRouteCode(permission))}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Diálogo de confirmación de eliminación */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el permiso
                            "{getPermissionName(permission)}" y todas sus asociaciones con roles.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </MainContainer>
    )
} 