"use client"

import React, { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ClientFormData, ClientSchema, AccountStatusEnum } from "@/schemas/client-schema"
import api from "@/lib/axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Client } from "@/types/clients/client"
import { Plan } from "@/types/plans/plan"
import { Sector } from "@/types/sectors/sector"
import { usePlans } from "@/hooks/use-plan"
import { useSectors } from "@/hooks/use-sector"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from 'date-fns/locale'
import { useServices } from "@/hooks/use-service"
import { Service } from "@/types/services/service"

export interface ClientFormProps {
    client?: Client | null;
    onSubmit: (values: ClientFormData) => void;
    isLoading?: boolean;
    onCancel: () => void;
}

export function ClientForm({ client, onSubmit, isLoading, onCancel }: ClientFormProps) {
    const [ isMounted, setIsMounted ] = useState(false)
    const [ step, setStep ] = useState(1)

    const { plans, refreshPlans } = usePlans()
    const { sectors, refreshSector } = useSectors()
    const { services, refreshService } = useServices()
    const [ loading, setLoading ] = useState(false)

    const [ selectedServiceId, setSelectedServiceId ] = useState<number | undefined>(
        client?.plan?.service?.id
    )

    const form = useForm<ClientFormData>({
        resolver: zodResolver(ClientSchema),
        defaultValues: client ? {
            id: client.id,
            name: client.name,
            lastName: client.lastName,
            dni: client.dni,
            phone: client.phone ?? '',
            address: client.address ?? '',
            installationDate: client.installationDate ? format(new Date(client.installationDate), 'yyyy-MM-dd') : '',
            reference: client.reference ?? '',
            paymentDate: client.paymentDate ? format(new Date(client.paymentDate), 'yyyy-MM-dd') : '',
            advancePayment: client.advancePayment ?? false,
            status: client.status,
            plan: client.plan?.id ?? undefined,
            sector: client.sector?.id ?? undefined,
            description: client.description ?? '',
        } : {
            id: undefined,
            name: '',
            lastName: '',
            dni: '',
            phone: '',
            address: '',
            installationDate: '',
            reference: '',
            paymentDate: '',
            advancePayment: false,
            status: AccountStatusEnum.enum.ACTIVE,
            plan: undefined,
            sector: undefined,
            description: '',
        },
    })

    useEffect(() => {
        refreshPlans()
        refreshSector()
        refreshService()
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (client) {
            form.reset({
                id: client.id,
                name: client.name,
                lastName: client.lastName,
                dni: client.dni,
                phone: client.phone ?? '',
                address: client.address ?? '',
                installationDate: client.installationDate ? format(new Date(client.installationDate), 'yyyy-MM-dd') : '',
                reference: client.reference ?? '',
                paymentDate: client.paymentDate ? format(new Date(client.paymentDate), 'yyyy-MM-dd') : '',
                advancePayment: client.advancePayment ?? false,
                status: client.status,
                plan: client.plan?.id ?? undefined,
                sector: client.sector?.id ?? undefined,
                description: client.description ?? '',
            })
            setSelectedServiceId(client.plan?.service?.id)
        } else {
            form.reset({
                id: undefined,
                name: '',
                lastName: '',
                dni: '',
                phone: '',
                address: '',
                installationDate: '',
                reference: '',
                paymentDate: '',
                advancePayment: false,
                status: AccountStatusEnum.enum.ACTIVE,
                plan: undefined,
                sector: undefined,
                description: '',
            })
        }
        setStep(1)
    }, [ client ])

    const filteredPlans = React.useMemo(() => {
        if (!selectedServiceId) return [];
        return plans.filter(plan => plan.service?.id === selectedServiceId);
    }, [ plans, selectedServiceId ]);

    if (!isMounted) {
        return null
    }

    const nextStep = () => setStep((prev) => prev + 1)
    const prevStep = () => setStep((prev) => prev - 1)

    const _onSubmit = (values: ClientFormData) => {
        setLoading(true)
        try {
            onSubmit(values)
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(_onSubmit)}
                className="space-y-4 overflow-y-auto max-h-[calc(80vh-10rem)] scrollbar-hide"
            >
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <h3 className="text-lg font-medium mb-4 md:col-span-2">Paso 1: Datos Personales</h3>
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} placeholder="Nombre" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input {...field} placeholder="Apellido" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="dni" render={({ field }) => (
                            <FormItem><FormLabel>DNI</FormLabel><FormControl><Input {...field} placeholder="DNI" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} placeholder="Teléfono (Opcional)" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} placeholder="Dirección (Opcional)" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="reference" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Referencia</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Referencia (Opcional)"
                                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} placeholder="Descripción adicional (Opcional)" className="resize-none" /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                )}

                {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <h3 className="text-lg font-medium mb-4 md:col-span-2">Paso 2: Detalles del Servicio</h3>
                        <FormItem className="md:col-span-2">
                            <FormLabel>Tipo de Servicio</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    const serviceId = value ? parseInt(value) : undefined;
                                    setSelectedServiceId(serviceId);
                                    form.setValue('plan', 0, { shouldValidate: true });
                                }}
                                value={selectedServiceId?.toString() ?? ''}
                            >
                                <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo de servicio" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {services.map((service) => (
                                        <SelectItem key={service.id} value={service.id.toString()}>
                                            {service.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                        <FormField control={form.control} name="plan" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Plan</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                                    value={field.value?.toString() ?? ''}
                                    disabled={!selectedServiceId}
                                >
                                    <FormControl><SelectTrigger><SelectValue placeholder={!selectedServiceId ? "Seleccione servicio primero" : "Seleccione un plan"} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {filteredPlans.map((plan) => (
                                            <SelectItem key={plan.id} value={plan.id.toString()}>
                                                {plan.name} - {plan.speed} Mbps (S/ {plan.price})
                                            </SelectItem>
                                        ))}
                                        {selectedServiceId && filteredPlans.length === 0 && (
                                            <p className="p-4 text-sm text-muted-foreground">No hay planes para este servicio.</p>
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="sector" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sector</FormLabel>
                                <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} defaultValue={field.value?.toString() ?? ''}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un sector" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {sectors.map((sector) => <SelectItem key={sector.id} value={sector.id.toString()}>{sector.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="installationDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Fecha Instalación</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(new Date(field.value), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                            initialFocus
                                            locale={es}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="paymentDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Fecha Próximo Pago</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(new Date(`${field.value}T00:00:00`), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            disabled={(date) => date < new Date("1900-01-01")}
                                            initialFocus
                                            locale={es}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estado Cuenta</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione estado" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {AccountStatusEnum.options.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="advancePayment" render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Pago Adelantado</FormLabel>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-background pb-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>

                    {step > 1 && (
                        <Button type="button" variant="secondary" onClick={prevStep}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                        </Button>
                    )}

                    {step === 1 && (
                        <Button type="button" onClick={nextStep}>
                            Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}

                    {step === 2 && (
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Guardando..." : "Guardar Cliente"}
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    )
}