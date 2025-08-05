"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Role } from "@/types/roles/role"
import { useRoles } from "@/hooks/use-roles"
import { MainContainer } from "@/components/layout/main-container"
import { HeaderActions } from "@/components/layout/header-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft,
    Edit,
    Trash2,
    Shield,
    Users,
    Calendar,
    Settings,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    AlertTriangle
} from "lucide-react"
import {
    getRoleName,
    getRoleDescription,
    getRoleStatus,
    getRoleStatusColor,
    getRoleStatusBadge,
    getRoleIcon,
    getRoleInitials,
    getRoleAvatarColor,
    getRolePermissionsCount,
    getRoleEmployeesCount,
    formatRoleDate,
    getPermissionActions,
    getPermissionRestrictions,
    isSubRoute,
    getFormattedRouteCode,
    getPermissionName,
    getRelatedPermissionName
} from "@/utils/role-utils"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function RoleDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const { getRoleById, deleteRole } = useRoles()

    const [ role, setRole ] = useState<Role | null>(null)
    const [ isLoading, setIsLoading ] = useState(true)
    const [ isDeleting, setIsDeleting ] = useState(false)

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

    const handleEdit = () => {
        router.push(`/configuration/role/${roleId}/edit`)
    }

    const handleDelete = async () => {
        if (!role) return

        try {
            setIsDeleting(true)
            await deleteRole(role.id)
            toast({ title: "Rol eliminado correctamente" })
            router.push("/configuration/role")
        } catch (error: any) {
            toast({
                title: "Error al eliminar rol",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleBack = () => {
        router.push("/configuration/role")
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
                        <Button onClick={handleBack} className="mt-4">
                            Volver a la lista
                        </Button>
                    </div>
                </div>
            </MainContainer>
        )
    }

    const roleName = getRoleName(role)
    const initials = getRoleInitials(role)
    const avatarColor = getRoleAvatarColor(roleName)

    return (
        <MainContainer>
            <HeaderActions title="Detalle del Rol">
                <Button variant="outline" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                </Button>
                <Button onClick={handleEdit} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Editar
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el rol "{roleName}".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
            </HeaderActions>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información principal */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar className={`h-16 w-16 text-lg ${avatarColor} text-white`}>
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-2xl">{roleName}</CardTitle>
                                    <CardDescription>
                                        Rol #{role.id}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Información del Rol</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Nombre</p>
                                                    <p className="text-sm text-muted-foreground">{roleName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Settings className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Descripción</p>
                                                    <p className="text-sm text-muted-foreground">{getRoleDescription(role)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Configuración</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{getRoleIcon(role.name)}</span>
                                                    <Badge
                                                        variant={getRoleStatusBadge(role) as any}
                                                        className={getRoleStatusColor(role)}
                                                    >
                                                        {getRoleStatus(role)}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {role.isPublic ? (
                                                    <Eye className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <EyeOff className="h-4 w-4 text-gray-600" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">Visibilidad</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {role.isPublic ? "Público" : "Privado"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium text-sm text-muted-foreground">Estadísticas</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Permisos</p>
                                            <p className="text-sm text-muted-foreground">
                                                {getRolePermissionsCount(role)} permisos configurados
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Empleados</p>
                                            <p className="text-sm text-muted-foreground">
                                                {getRoleEmployeesCount(role)} empleados asignados
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lista de permisos */}
                    {role.role_has_permissions && role.role_has_permissions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Permisos Configurados</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {role.role_has_permissions.map((permission, index) => (
                                        <div key={permission.id || index} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-medium">{getPermissionName(permission)}</h5>
                                                    <p className="text-sm text-muted-foreground">
                                                        {getFormattedRouteCode(permission.routeCode)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isSubRoute(permission) && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Subruta
                                                        </Badge>
                                                    )}
                                                    <Badge variant="secondary" className="text-xs">
                                                        {getRelatedPermissionName(permission)}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h6 className="text-sm font-medium mb-2">Acciones</h6>
                                                    <div className="flex flex-wrap gap-1">
                                                        {getPermissionActions(permission).length > 0 ? (
                                                            getPermissionActions(permission).map((action) => (
                                                                <Badge key={action} variant="outline" className="text-xs">
                                                                    {action}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">Sin acciones</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h6 className="text-sm font-medium mb-2">Restricciones</h6>
                                                    <div className="flex flex-wrap gap-1">
                                                        {getPermissionRestrictions(permission).length > 0 ? (
                                                            getPermissionRestrictions(permission).map((restriction) => (
                                                                <Badge key={restriction} variant="destructive" className="text-xs">
                                                                    {restriction}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">Sin restricciones</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Información adicional */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Información del Sistema</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Fecha de Creación</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatRoleDate(role.created_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Última Actualización</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatRoleDate(role.updated_at)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2"
                                onClick={handleEdit}
                            >
                                <Edit className="h-4 w-4" />
                                Editar Rol
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2"
                                onClick={() => router.push("/configuration/role")}
                            >
                                <Shield className="h-4 w-4" />
                                Ver Todos los Roles
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainContainer>
    )
} 