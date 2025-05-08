"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ServicesFormData, servicesFormSchema, ServiceStatus } from "@/schemas/services-shema"
import api from "@/lib/axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Service } from "@/types/services/service"

interface ServiceFormProps {
    open: boolean
    isEdit: Service | null
    onSave: (values: ServicesFormData) => void
    onClose: () => void
    loading?: boolean
}

export function ServiceForm({ onSave, onClose, isEdit, open, loading: externalLoading }: ServiceFormProps) {
    const [isMounted, setIsMounted] = useState(false)

    const form = useForm<ServicesFormData>({
        resolver: zodResolver(servicesFormSchema),
        defaultValues: {
            id: 0,
            name: "",
            description: "",
            status: ServiceStatus.enum.ACTIVE,
        },
    })

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (isEdit) {
            form.reset({
                id: isEdit.id,
                name: isEdit.name,
                description: isEdit.description || "",
                status: isEdit.status,
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
                    <DialogTitle>{isEdit ? "Editar Servicio" : "Nuevo Servicio"}</DialogTitle>
                    <DialogDescription>Ingrese los detalles del servicio aquí.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Servicio</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ingrese el nombre del servicio" value={field.value || ''} />
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
                                        <Input {...field} placeholder="Ingrese la descripción (opcional)" value={field.value || ''}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione el estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ServiceStatus.options.map((statusValue) => (
                                                <SelectItem key={statusValue} value={statusValue}>
                                                    {statusValue}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4">
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