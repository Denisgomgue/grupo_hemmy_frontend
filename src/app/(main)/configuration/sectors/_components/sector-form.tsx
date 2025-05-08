"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { SectorsFormData, sectorsFormSchema } from "@/schemas/sectors-schema"
import api from "@/lib/axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Sector } from "@/types/sectors/sector"

interface SectorFormProps {
    open: boolean
    isEdit: Sector | null
    onSave: (values: SectorsFormData) => void
    onClose: () => void
    loading?: boolean
}

export function SectorForm({ onSave, onClose, isEdit, open, loading: externalLoading }: SectorFormProps) {
    const [isMounted, setIsMounted] = useState(false)

    const form = useForm<SectorsFormData>({
        resolver: zodResolver(sectorsFormSchema),
        defaultValues: {
            id: 0,
            name: "",
            description: "",
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
                description: isEdit.description,
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
                    <DialogTitle>{isEdit ? "Editar Sector" : "Nuevo Sector"}</DialogTitle>
                    <DialogDescription>Ingrese los detalles del sector aquí.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Sector</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ingrese el nombre del sector" value={field.value || ''} />
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
                                        <Textarea
                                            {...field}
                                            placeholder="Ingrese la descripción (opcional)"
                                            value={field.value || ''}
                                            className="resize-none"
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