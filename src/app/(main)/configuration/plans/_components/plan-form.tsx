"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea" // Usar Textarea para descripción
import { toast } from "sonner"
// Importar schema y tipo de Plan
import { PlanFormData, PlanSchema } from "@/schemas/plan-schema"
import api from "@/lib/axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
// Importar tipo de Plan y Service
import { Plan } from "@/types/plans/plan"
import { Service } from "@/types/services/service"
import { useServices } from "@/hooks/use-service" // Hook para obtener servicios

interface PlanFormProps {
    open: boolean
    isEdit: Plan | null // Usar tipo Plan
    onSave: (values: PlanFormData) => void // Usar tipo PlanFormData
    onClose: () => void
    loading?: boolean
}

export function PlanForm({ onSave, onClose, isEdit, open, loading: externalLoading }: PlanFormProps) {
    const [isMounted, setIsMounted] = useState(false)
    const { services, refreshService } = useServices() // Obtener servicios

    const form = useForm<PlanFormData>({
        resolver: zodResolver(PlanSchema),
        defaultValues: {
            id: 0,
            name: "",
            service: undefined,
            speed: 0,
            price: 0,
            description: "",
        },
    })

    useEffect(() => {
        setIsMounted(true)
        // Cargar servicios cuando el componente se monta
        refreshService()
    }, [refreshService])

    useEffect(() => {
        if (isEdit) {
            form.reset({
                id: isEdit.id,
                name: isEdit.name,
                service: isEdit.service?.id ?? undefined,
                speed: isEdit.speed ?? 0,
                price: isEdit.price ?? 0,
                description: isEdit.description || "",
            });
        } else {
            form.reset({
                id: undefined,
                name: "",
                service: undefined,
                speed: 0,
                price: 0,
                description: "",
            });
        }
    }, [isEdit, form]);

    if (!isMounted) {
        return null
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-w-full max-h-[80vh] overflow-auto">
                <DialogHeader>
                    {/* Cambiar título */}
                    <DialogTitle>{isEdit ? "Editar Plan" : "Nuevo Plan"}</DialogTitle>
                    {/* Cambiar descripción */}
                    <DialogDescription>Ingrese los detalles del plan aquí.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                        {/* Campo Nombre */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Plan</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ingrese el nombre del plan" value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campo Servicio (Selector) */}
                        <FormField
                            control={form.control}
                            name="service"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Servicio Asociado</FormLabel>
                                    <Select 
                                        onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : undefined)} 
                                        defaultValue={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un servicio" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>                                
                                            {services.map((service) => (
                                                <SelectItem key={service.id} value={service.id.toString()}>
                                                    {service.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                         {/* Campo Velocidad (Speed) */}
                        <FormField
                            control={form.control}
                            name="speed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Velocidad (Mbps)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            {...field} 
                                            placeholder="Ingrese la velocidad" 
                                            value={field.value ?? ''} 
                                            onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campo Precio */}
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Precio</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            step="0.01" // Para permitir decimales
                                            {...field} 
                                            placeholder="Ingrese el precio" 
                                            value={field.value ?? ''} 
                                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campo Descripción */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Ingrese la descripción (opcional)"
                                            value={field.value || ''}
                                            className="resize-none" // Opcional: deshabilitar redimensionar
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={externalLoading}>
                                {externalLoading ? "Guardando..." : "Guardar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 