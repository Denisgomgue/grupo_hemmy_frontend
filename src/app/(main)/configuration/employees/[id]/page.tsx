"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Employee } from "@/types/employees/employee"
import { useEmployees } from "@/hooks/use-employees"
import { MainContainer } from "@/components/layout/main-container"
import { HeaderActions } from "@/components/layout/header-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Phone,
    Calendar,
    UserCog,
    FileText,
    Mail,
    MapPin,
    Building
} from "lucide-react"
import {
    getFullName,
    formatDni,
    formatPhone,
    getRoleIcon,
    getEmployeeStatusColor,
    getInitials,
    getAvatarColor,
    formatEmployeeDate
} from "@/utils/employee-utils"
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

export default function EmployeeDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const { getEmployeeById, deleteEmployee } = useEmployees()

    const [ employee, setEmployee ] = useState<Employee | null>(null)
    const [ isLoading, setIsLoading ] = useState(true)
    const [ isDeleting, setIsDeleting ] = useState(false)

    const employeeId = params.id as string

    useEffect(() => {
        async function loadEmployee() {
            if (!employeeId) return

            try {
                setIsLoading(true)
                const data = await getEmployeeById(parseInt(employeeId, 10))
                setEmployee(data)
            } catch (error: any) {
                toast({
                    title: "Error al cargar empleado",
                    description: error.message,
                    variant: "destructive",
                })
                router.push("/configuration/employees")
            } finally {
                setIsLoading(false)
            }
        }

        loadEmployee()
    }, [ employeeId, getEmployeeById, toast, router ])

    const handleEdit = () => {
        router.push(`/configuration/employees/${employeeId}/edit`)
    }

    const handleDelete = async () => {
        if (!employee) return

        try {
            setIsDeleting(true)
            await deleteEmployee(employee.id)
            toast({ title: "Empleado eliminado correctamente" })
            router.push("/configuration/employees")
        } catch (error: any) {
            toast({
                title: "Error al eliminar empleado",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleBack = () => {
        router.push("/configuration/employees")
    }

    if (isLoading) {
        return (
            <MainContainer>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Cargando empleado...</p>
                    </div>
                </div>
            </MainContainer>
        )
    }

    if (!employee) {
        return (
            <MainContainer>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-muted-foreground">Empleado no encontrado</p>
                        <Button onClick={handleBack} className="mt-4">
                            Volver a la lista
                        </Button>
                    </div>
                </div>
            </MainContainer>
        )
    }

    const fullName = getFullName(employee)
    const initials = getInitials(employee)
    const avatarColor = getAvatarColor(fullName)

    return (
        <MainContainer>
            <HeaderActions title="Detalle del Empleado">
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
                                Esta acción no se puede deshacer. Se eliminará permanentemente el empleado "{fullName}".
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
                                    <CardTitle className="text-2xl">{fullName}</CardTitle>
                                    <CardDescription>
                                        Empleado #{employee.id}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Información Personal</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Nombre</p>
                                                    <p className="text-sm text-muted-foreground">{employee.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Apellido</p>
                                                    <p className="text-sm text-muted-foreground">{employee.lastName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">DNI</p>
                                                    <p className="text-sm text-muted-foreground">{formatDni(employee.dni)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Información de Contacto</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Teléfono</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {employee.phone ? formatPhone(employee.phone) : "No registrado"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium text-sm text-muted-foreground">Rol y Permisos</h4>
                                <div className="flex items-center gap-3">
                                    <UserCog className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{getRoleIcon(employee.role?.name || "")}</span>
                                        <Badge
                                            variant="secondary"
                                            className={getEmployeeStatusColor(employee)}
                                        >
                                            {employee.role?.name || "Sin rol asignado"}
                                        </Badge>
                                    </div>
                                </div>
                                {employee.role?.description && (
                                    <p className="text-sm text-muted-foreground ml-7">
                                        {employee.role.description}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
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
                                    <p className="text-sm font-medium">Fecha de Registro</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatEmployeeDate(employee.created_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Última Actualización</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatEmployeeDate(employee.updated_at)}
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
                                Editar Información
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2"
                                onClick={() => router.push("/configuration/employees")}
                            >
                                <User className="h-4 w-4" />
                                Ver Todos los Empleados
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainContainer>
    )
} 