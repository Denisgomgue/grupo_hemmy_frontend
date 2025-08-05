"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { roleSchema, type RoleFormData, type RoleHasPermissionFormData } from "@/schemas/role-schema"
import { Role, RoleHasPermission } from "@/types/roles/role"
import { useEffect } from "react"
import { usePermissions } from "@/hooks/use-permission"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Settings } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface RoleFormProps {
    role?: Role | null
    onSubmit: (values: RoleFormData) => void
    isLoading?: boolean
    onCancel: () => void
    formRef?: React.RefObject<HTMLFormElement | null>
    onFormReady?: (form: any) => void
}

export function RoleForm({ role, onSubmit, isLoading = false, onCancel, formRef, onFormReady }: RoleFormProps) {
    const { permissions, isLoading: permissionsLoading } = usePermissions();

    const form = useForm<RoleFormData>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: "",
            description: "",
            allowAll: false,
            isPublic: false,
            role_has_permissions: [],
            ...(role ? {
                name: role.name || "",
                description: role.description || "",
                allowAll: role.allowAll || false,
                isPublic: role.isPublic || false,
                role_has_permissions: role.role_has_permissions?.map(rhp => ({
                    name: rhp.name,
                    routeCode: rhp.routeCode,
                    actions: rhp.actions || [],
                    restrictions: rhp.restrictions || [],
                    isSubRoute: rhp.isSubRoute,
                    permissionId: rhp.permissionId || 0,
                })) || [],
            } : {})
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "role_has_permissions"
    });

    useEffect(() => {
        if (onFormReady) {
            onFormReady(form);
        }
    }, [ form, onFormReady ]);

    const handleSubmit = async (values: RoleFormData) => {
        await onSubmit(values)
    }

    const addPermission = () => {
        append({
            name: "",
            routeCode: "",
            actions: [],
            restrictions: [],
            isSubRoute: false,
            permissionId: 0,
        });
    };

    const removePermission = (index: number) => {
        remove(index);
    };

    return (
        <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Información básica del rol */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Rol</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del Rol *</FormLabel>
                                        <FormControl>
                                            <Input
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                disabled={isLoading}
                                                placeholder="Ej: Administrador"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl>
                                            <Input
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                disabled={isLoading}
                                                placeholder="Descripción del rol"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <FormLabel>Acceso Total</FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Este rol tendrá acceso a todas las funcionalidades
                                            </p>
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
                                            <FormLabel>Rol Público</FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Este rol será visible para todos los usuarios
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Permisos del rol */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Permisos del Rol</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addPermission}
                                disabled={isLoading || permissionsLoading}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Agregar Permiso
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No hay permisos configurados</p>
                                <p className="text-sm">Haz clic en "Agregar Permiso" para comenzar</p>
                            </div>
                        ) : (
                            fields.map((field, index) => (
                                <Card key={field.id} className="border-dashed">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-medium">Permiso {index + 1}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removePermission(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`role_has_permissions.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nombre del Permiso *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                value={field.value || ""}
                                                                onChange={field.onChange}
                                                                onBlur={field.onBlur}
                                                                disabled={isLoading}
                                                                placeholder="Ej: Ver Usuarios"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`role_has_permissions.${index}.routeCode`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Código de Ruta *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                value={field.value || ""}
                                                                onChange={field.onChange}
                                                                onBlur={field.onBlur}
                                                                disabled={isLoading}
                                                                placeholder="Ej: users.view"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <FormField
                                                control={form.control}
                                                name={`role_has_permissions.${index}.permissionId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Permiso Relacionado *</FormLabel>
                                                        <Select
                                                            onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : 0)}
                                                            value={field.value?.toString() || ""}
                                                            disabled={isLoading || permissionsLoading}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Seleccionar permiso" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {permissions.map((permission: any) => (
                                                                    <SelectItem key={permission.id} value={permission.id.toString()}>
                                                                        {permission.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`role_has_permissions.${index}.isSubRoute`}
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
                                                            <FormLabel>Es Subruta</FormLabel>
                                                            <p className="text-sm text-muted-foreground">
                                                                Marca si este es un permiso de subruta
                                                            </p>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Separator className="my-4" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <FormLabel className="text-sm font-medium">Acciones</FormLabel>
                                                <div className="mt-2 space-y-2">
                                                    {[ "create", "read", "update", "delete" ].map((action) => (
                                                        <FormField
                                                            key={action}
                                                            control={form.control}
                                                            name={`role_has_permissions.${index}.actions`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(action) || false}
                                                                            onCheckedChange={(checked) => {
                                                                                const currentActions = field.value || [];
                                                                                if (checked) {
                                                                                    field.onChange([ ...currentActions, action ]);
                                                                                } else {
                                                                                    field.onChange(currentActions.filter(a => a !== action));
                                                                                }
                                                                            }}
                                                                            disabled={isLoading}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none">
                                                                        <FormLabel className="text-sm capitalize">
                                                                            {action}
                                                                        </FormLabel>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <FormLabel className="text-sm font-medium">Restricciones</FormLabel>
                                                <div className="mt-2 space-y-2">
                                                    {[ "time", "location", "data" ].map((restriction) => (
                                                        <FormField
                                                            key={restriction}
                                                            control={form.control}
                                                            name={`role_has_permissions.${index}.restrictions`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(restriction) || false}
                                                                            onCheckedChange={(checked) => {
                                                                                const currentRestrictions = field.value || [];
                                                                                if (checked) {
                                                                                    field.onChange([ ...currentRestrictions, restriction ]);
                                                                                } else {
                                                                                    field.onChange(currentRestrictions.filter(r => r !== restriction));
                                                                                }
                                                                            }}
                                                                            disabled={isLoading}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none">
                                                                        <FormLabel className="text-sm capitalize">
                                                                            {restriction}
                                                                        </FormLabel>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>
            </form>
        </Form>
    )
} 