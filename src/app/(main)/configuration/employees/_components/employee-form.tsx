"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { employeeSchema, type EmployeeFormData } from "@/schemas/employee-schema"
import { Employee } from "@/types/employees/employee"
import { useEffect } from "react"
import { useRoles } from "@/hooks/use-role"

interface EmployeeFormProps {
    employee?: Employee | null
    onSubmit: (values: EmployeeFormData) => void
    isLoading?: boolean
    onCancel: () => void
    formRef?: React.RefObject<HTMLFormElement | null>
    onFormReady?: (form: any) => void
}

export function EmployeeForm({ employee, onSubmit, isLoading = false, onCancel, formRef, onFormReady }: EmployeeFormProps) {
    const { roles, isLoading: rolesLoading } = useRoles();

    const form = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            name: "",
            lastName: "",
            dni: "",
            phone: "",
            roleId: undefined,
            ...(employee ? {
                name: employee.name || "",
                lastName: employee.lastName || "",
                dni: employee.dni || "",
                phone: employee.phone || "",
                roleId: employee.roleId,
            } : {})
        },
    })

    useEffect(() => {
        if (onFormReady) {
            onFormReady(form);
        }
    }, [ form, onFormReady ]);

    const handleSubmit = async (values: EmployeeFormData) => {
        await onSubmit(values)
    }

    return (
        <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre *</FormLabel>
                                <FormControl>
                                    <Input
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        disabled={isLoading}
                                        placeholder="Ingrese el nombre"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido *</FormLabel>
                                <FormControl>
                                    <Input
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        disabled={isLoading}
                                        placeholder="Ingrese el apellido"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dni"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>DNI *</FormLabel>
                                <FormControl>
                                    <Input
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        disabled={isLoading}
                                        placeholder="12345678"
                                        maxLength={8}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                    <Input
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        disabled={isLoading}
                                        placeholder="912345678"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="roleId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rol *</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : undefined)}
                                    value={field.value?.toString() || ""}
                                    disabled={isLoading || rolesLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar rol" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </form>
        </Form>
    )
} 