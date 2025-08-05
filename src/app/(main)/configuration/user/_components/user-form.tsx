"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { UserFormSchema, type UserFormData } from "@/schemas/user-schema"
import { User } from "@/types/users/user"
import { useEffect, useCallback } from "react"

interface UserFormProps {
    user?: User | null
    onSubmit: (values: UserFormData) => void
    isLoading?: boolean
    onCancel: () => void
    formRef?: React.RefObject<HTMLFormElement | null>
    onFormReady?: (form: any) => void
    isEdit?: boolean
}

export function UserForm({ user, onSubmit, isLoading = false, onCancel, formRef, onFormReady, isEdit = false }: UserFormProps) {
    const form = useForm<UserFormData>({
        resolver: zodResolver(UserFormSchema),
            defaultValues: {
            name: "",
            surname: "",
            email: "",
            password: "",
            confirmPassword: "",
            documentType: "",
            documentNumber: "",
            username: "",
            phone: "",
            address: "",
            roleId: undefined,
            isActive: true,
            allowAll: false,
            isPublic: false,
            ...(user ? {
                name: user.name || "",
                surname: user.surname || "",
                email: user.email || "",
                password: "",
                confirmPassword: "",
                documentType: user.documentType || "",
                documentNumber: user.documentNumber || "",
                username: user.username || "",
                phone: user.phone || "",
                address: user.address || "",
                roleId: user.role?.id?.toString() || "",
                isActive: user.isActive ?? true,
                allowAll: user.allowAll ?? false,
                isPublic: user.isPublic ?? false,
            } : {})
        },
    })

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name || "",
                surname: user.surname || "",
                email: user.email || "",
                password: "",
                confirmPassword: "",
                documentType: user.documentType || "",
                documentNumber: user.documentNumber || "",
                username: user.username || "",
                phone: user.phone || "",
                address: user.address || "",
                roleId: user.role?.id?.toString() || "",
                isActive: user.isActive ?? true,
                allowAll: user.allowAll ?? false,
                isPublic: user.isPublic ?? false,
            })
        }
    }, [ user, form ])

    useEffect(() => {
        if (onFormReady) {
            onFormReady(form);
            }
    }, [ form, onFormReady ]);

    const handleSubmit = async (values: UserFormData) => {
        await onSubmit(values)
    }

    const getDocumentTypeLabel = (type: string) => {
        const typeLabels: Record<string, string> = {
            DNI: "DNI",
            CE: "Carné de Extranjería",
            PASSPORT: "Pasaporte",
            RUC: "RUC",
            OTHER: "Otro"
        }
        return typeLabels[ type ] || type
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
                        name="surname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido</FormLabel>
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
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        disabled={isLoading}
                                        placeholder="usuario@ejemplo.com"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                                )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de Usuario *</FormLabel>
                                <FormControl>
                                    <Input
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        disabled={isLoading}
                                        placeholder="usuario123"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Documento</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                        <SelectContent>
                                            <SelectItem value="DNI">DNI</SelectItem>
                                            <SelectItem value="CE">Carné de Extranjería</SelectItem>
                                            <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                                            <SelectItem value="RUC">RUC</SelectItem>
                                            <SelectItem value="OTHER">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="documentNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Documento</FormLabel>
                                <FormControl>
                                    <Input
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        disabled={isLoading}
                                        placeholder="12345678"
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
                                        placeholder="+51 999 999 999"
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
                                <FormLabel>Rol</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar rol" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">Sin rol</SelectItem>
                                        {/* Aquí se pueden agregar los roles dinámicamente */}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                                <Input
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    disabled={isLoading}
                                    placeholder="Ingrese la dirección completa"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!isEdit && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            disabled={isLoading}
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Contraseña *</FormLabel>
                                    <FormControl>
                                    <Input
                                        type="password"
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            disabled={isLoading}
                                            placeholder="Repita la contraseña"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Usuario Activo</FormLabel>
                                    <FormDescription>
                                        El usuario podrá acceder al sistema
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="allowAll"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Permitir Todo</FormLabel>
                                    <FormDescription>
                                        Acceso completo a todas las funciones
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isPublic"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading}
                                />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Usuario Público</FormLabel>
                                    <FormDescription>
                                        Visible para otros usuarios
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                            </div>
            </form>
        </Form>
        )
    }