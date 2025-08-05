"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Employee } from "@/types/employees/employee"
import { useEmployees } from "@/hooks/use-employees"
import { MainContainer } from "@/components/layout/main-container"
import { HeaderActions } from "@/components/layout/header-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, X } from "lucide-react"
import { EmployeeForm } from "../../_components/employee-form"
import { EmployeeFormData } from "@/schemas/employee-schema"

export default function EditEmployeePage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const { getEmployeeById, updateEmployee } = useEmployees()

    const [ employee, setEmployee ] = useState<Employee | null>(null)
    const [ isLoading, setIsLoading ] = useState(true)
    const [ isSubmitting, setIsSubmitting ] = useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)
    const [ formInstance, setFormInstance ] = useState<any>(null)

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

    const handleSubmit = async (values: EmployeeFormData) => {
        if (!employee) return

        try {
            setIsSubmitting(true)
            await updateEmployee(employee.id, values)
            toast({ title: "Empleado actualizado correctamente" })
            router.push(`/configuration/employees/${employee.id}`)
        } catch (error: any) {
            toast({
                title: "Error al actualizar empleado",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        router.push(`/configuration/employees/${employeeId}`)
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
                        <Button onClick={() => router.push("/configuration/employees")} className="mt-4">
                            Volver a la lista
                        </Button>
                    </div>
                </div>
            </MainContainer>
        )
    }

    return (
        <MainContainer>
            <HeaderActions title="Editar Empleado">
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancelar
                </Button>
                <Button onClick={handleSubmitFromButton} disabled={isSubmitting} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </HeaderActions>

            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/configuration/employees/${employeeId}`)}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Volver al detalle
                            </Button>
                        </div>
                        <CardTitle>Editar Información del Empleado</CardTitle>
                        <CardDescription>
                            Modifique los datos del empleado. Los campos marcados con * son obligatorios.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EmployeeForm
                            employee={employee}
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