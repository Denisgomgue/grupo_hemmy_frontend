import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { useState } from "react"
import { CreatePermissionData, UpdatePermissionData } from "@/types/permissions/permission"

// Opciones predefinidas para acciones
const ACTION_OPTIONS = [
    { value: "create", label: "Crear", description: "Permite crear nuevos registros" },
    { value: "read", label: "Leer", description: "Permite ver registros existentes" },
    { value: "update", label: "Actualizar", description: "Permite modificar registros" },
    { value: "delete", label: "Eliminar", description: "Permite eliminar registros" },
    { value: "export", label: "Exportar", description: "Permite exportar datos" },
    { value: "import", label: "Importar", description: "Permite importar datos" },
    { value: "approve", label: "Aprobar", description: "Permite aprobar solicitudes" },
    { value: "reject", label: "Rechazar", description: "Permite rechazar solicitudes" },
]

// Opciones predefinidas para restricciones
const RESTRICTION_OPTIONS = [
    { value: "own_data", label: "Solo datos propios", description: "Solo puede acceder a sus propios datos" },
    { value: "department_data", label: "Datos del departamento", description: "Solo puede acceder a datos de su departamento" },
    { value: "company_data", label: "Datos de la empresa", description: "Solo puede acceder a datos de su empresa" },
    { value: "read_only", label: "Solo lectura", description: "No puede modificar datos" },
    { value: "time_restricted", label: "Restricción temporal", description: "Acceso limitado por horario" },
    { value: "ip_restricted", label: "Restricción IP", description: "Acceso limitado por dirección IP" },
]

const permissionSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
    routeCode: z.string().min(1, "El código de ruta es requerido").max(50, "El código de ruta no puede exceder 50 caracteres"),
    actions: z.array(z.string()).min(1, "Debe seleccionar al menos una acción"),
    restrictions: z.array(z.string()).optional(),
    isSubRoute: z.boolean().default(false),
})

type PermissionFormData = z.infer<typeof permissionSchema>

interface PermissionFormProps {
    initialData?: CreatePermissionData | UpdatePermissionData
    onSubmit: (data: PermissionFormData) => void
    isLoading?: boolean
}

export function PermissionForm({ initialData, onSubmit, isLoading = false }: PermissionFormProps) {
    const [ customActions, setCustomActions ] = useState<string[]>([])
    const [ customRestrictions, setCustomRestrictions ] = useState<string[]>([])

    const form = useForm<PermissionFormData>({
        resolver: zodResolver(permissionSchema),
        defaultValues: {
            name: initialData?.name || "",
            routeCode: initialData?.routeCode || "",
            actions: initialData?.actions || [],
            restrictions: initialData?.restrictions || [],
            isSubRoute: initialData?.isSubRoute || false,
        },
    })

    const watchedActions = form.watch("actions")
    const watchedRestrictions = form.watch("restrictions")

    const handleAddCustomAction = () => {
        const newAction = prompt("Ingrese el nombre de la acción personalizada:")
        if (newAction && newAction.trim()) {
            setCustomActions(prev => [ ...prev, newAction.trim() ])
            const currentActions = form.getValues("actions")
            form.setValue("actions", [ ...currentActions, newAction.trim() ])
        }
    }

    const handleAddCustomRestriction = () => {
        const newRestriction = prompt("Ingrese el nombre de la restricción personalizada:")
        if (newRestriction && newRestriction.trim()) {
            setCustomRestrictions(prev => [ ...prev, newRestriction.trim() ])
            const currentRestrictions = form.getValues("restrictions")
            form.setValue("restrictions", [ ...(currentRestrictions || []), newRestriction.trim() ])
        }
    }

    const handleRemoveAction = (actionToRemove: string) => {
        const currentActions = form.getValues("actions")
        form.setValue("actions", currentActions.filter(action => action !== actionToRemove))
    }

    const handleRemoveRestriction = (restrictionToRemove: string) => {
        const currentRestrictions = form.getValues("restrictions")
        form.setValue("restrictions", (currentRestrictions || []).filter(restriction => restriction !== restrictionToRemove))
    }

    const handleToggleAction = (action: string) => {
        const currentActions = form.getValues("actions")
        if (currentActions.includes(action)) {
            form.setValue("actions", currentActions.filter(a => a !== action))
        } else {
            form.setValue("actions", [ ...currentActions, action ])
        }
    }

    const handleToggleRestriction = (restriction: string) => {
        const currentRestrictions = form.getValues("restrictions") || []
        if (currentRestrictions.includes(restriction)) {
            form.setValue("restrictions", currentRestrictions.filter(r => r !== restriction))
        } else {
            form.setValue("restrictions", [ ...currentRestrictions, restriction ])
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Permiso</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Gestión de Usuarios" {...field} />
                            </FormControl>
                            <FormDescription>
                                Nombre descriptivo del permiso que se mostrará en la interfaz
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="routeCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Código de Ruta</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: users.manage" {...field} />
                            </FormControl>
                            <FormDescription>
                                Código único que identifica la ruta o funcionalidad
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isSubRoute"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Subruta</FormLabel>
                                <FormDescription>
                                    Marca si este permiso es para una subruta o funcionalidad secundaria
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <div>
                        <FormLabel className="text-base">Acciones</FormLabel>
                        <FormDescription>
                            Selecciona las acciones que este permiso permite realizar
                        </FormDescription>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {ACTION_OPTIONS.map((action) => (
                            <div
                                key={action.value}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${watchedActions.includes(action.value)
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                    }`}
                                onClick={() => handleToggleAction(action.value)}
                            >
                                <div className="font-medium">{action.label}</div>
                                <div className="text-sm text-muted-foreground">{action.description}</div>
                            </div>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddCustomAction}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Acción Personalizada
                    </Button>

                    {watchedActions.length > 0 && (
                        <div className="space-y-2">
                            <FormLabel>Acciones Seleccionadas:</FormLabel>
                            <div className="flex flex-wrap gap-2">
                                {watchedActions.map((action) => (
                                    <Badge key={action} variant="secondary" className="gap-1">
                                        {action}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => handleRemoveAction(action)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <FormLabel className="text-base">Restricciones (Opcional)</FormLabel>
                        <FormDescription>
                            Selecciona las restricciones que se aplicarán a este permiso
                        </FormDescription>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {RESTRICTION_OPTIONS.map((restriction) => (
                            <div
                                key={restriction.value}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${(watchedRestrictions || []).includes(restriction.value)
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                    }`}
                                onClick={() => handleToggleRestriction(restriction.value)}
                            >
                                <div className="font-medium">{restriction.label}</div>
                                <div className="text-sm text-muted-foreground">{restriction.description}</div>
                            </div>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddCustomRestriction}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Restricción Personalizada
                    </Button>

                    {(watchedRestrictions || []).length > 0 && (
                        <div className="space-y-2">
                            <FormLabel>Restricciones Seleccionadas:</FormLabel>
                            <div className="flex flex-wrap gap-2">
                                {(watchedRestrictions || []).map((restriction) => (
                                    <Badge key={restriction} variant="outline" className="gap-1">
                                        {restriction}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => handleRemoveRestriction(restriction)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Guardando..." : "Guardar Permiso"}
                </Button>
            </form>
        </Form>
    )
} 