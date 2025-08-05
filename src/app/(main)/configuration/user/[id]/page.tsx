"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { User } from "@/types/users/user"
import { useUsers } from "@/hooks/use-users"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft,
    Edit,
    Trash2,
    Mail,
    Phone,
    User as UserIcon,
    Calendar,
    Shield,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react"
import { toast } from "sonner"
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
import { formatFullName, formatDocument, getUserStatus, getRoleStatus, formatDate, getUserAvatar, getAvatarColor } from "@/utils/user-utils"

export default function UserDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { getUserById, deleteUser } = useUsers()
    const [ user, setUser ] = useState<User | null>(null)
    const [ isLoading, setIsLoading ] = useState(true)
    const [ error, setError ] = useState<string | null>(null)
    const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState(false)

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

    const handleEdit = () => {
        router.push(`/configuration/user/${userId}/edit`)
    }

    const handleDelete = () => {
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!user) return

        try {
            await deleteUser(user.id)
            toast.success("Usuario eliminado correctamente")
            router.push("/configuration/user")
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar usuario")
        } finally {
            setIsDeleteDialogOpen(false)
        }
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

    const fullName = formatFullName(user)
    const document = formatDocument(user)
    const status = getUserStatus(user)
    const roleStatus = getRoleStatus(user)
    const avatar = getUserAvatar(user)
    const avatarColor = getAvatarColor(user)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={() => router.push("/configuration/user")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Detalle de Usuario</h1>
                        <p className="text-muted-foreground">
                            Información completa del usuario
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Información Principal */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-4">
                                <Avatar className={`h-16 w-16 ${avatarColor} text-white`}>
                                    <AvatarFallback className="text-lg font-medium">
                                        {avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-2xl">{fullName}</CardTitle>
                                    <CardDescription>@{user.username}</CardDescription>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Badge variant={status.variant}>
                                            {status.label}
                                        </Badge>
                                        <Badge variant={roleStatus.variant}>
                                            {roleStatus.label}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Email</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>

                                    {user.phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Teléfono</p>
                                                <p className="text-sm text-muted-foreground">{user.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {document !== "Sin documento" && (
                                        <div className="flex items-center space-x-3">
                                            <UserIcon className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Documento</p>
                                                <p className="text-sm text-muted-foreground">{document}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Fecha de Creación</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Última Actualización</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(user.updated_at)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        {user.isActive ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">Estado</p>
                                            <p className="text-sm text-muted-foreground">
                                                {user.isActive ? "Usuario activo" : "Usuario inactivo"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información del Rol */}
                    {user.role && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5" />
                                    <span>Información del Rol</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium">Nombre del Rol</p>
                                    <p className="text-sm text-muted-foreground">{user.role.name}</p>
                                </div>

                                {user.role.description && (
                                    <div>
                                        <p className="text-sm font-medium">Descripción</p>
                                        <p className="text-sm text-muted-foreground">{user.role.description}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Permisos Totales</p>
                                        <p className="text-sm text-muted-foreground">
                                            {user.role.role_has_permissions?.length || 0} permisos
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Tipo de Rol</p>
                                        <p className="text-sm text-muted-foreground">
                                            {user.role.allowAll ? "Permisos totales" : "Permisos específicos"}
                                        </p>
                                    </div>
                                </div>

                                {user.role.role_has_permissions && user.role.role_has_permissions.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Permisos Asignados</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {user.role.role_has_permissions.map((permission) => (
                                                <Badge key={permission.id} variant="secondary" className="justify-start">
                                                    {permission.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Acciones Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full justify-start" variant="outline" onClick={handleEdit}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Usuario
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Shield className="h-4 w-4 mr-2" />
                                Cambiar Contraseña
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <UserIcon className="h-4 w-4 mr-2" />
                                Asignar Rol
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Sistema</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium">ID del Usuario</p>
                                <p className="text-sm text-muted-foreground">#{user.id}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium">Nombre de Usuario</p>
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium">Verificación</p>
                                <p className="text-sm text-muted-foreground">
                                    {user.email && user.name ? "Completa" : "Pendiente"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el usuario{" "}
                            <strong>{fullName}</strong> del sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
} 