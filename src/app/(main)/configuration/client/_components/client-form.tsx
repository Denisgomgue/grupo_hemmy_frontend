"use client"

import React, { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
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
import { getAccountStatusLabel } from "@/utils/account-status-labels"
import { FileUpload } from "@/components/ui/file-upload"

// Función auxiliar para convertir cualquier valor a booleano
const convertToBoolean = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
        const lowercaseValue = value.toLowerCase();
        return lowercaseValue === '1' || lowercaseValue === 'true';
    }
    return false;
};

export interface ClientFormProps {
    client?: Client | null;
    onSubmit: (values: ClientFormData) => void;
    isLoading?: boolean;
    onCancel: () => void;
}

interface FileUploadProps {
    value: File | null | undefined;
    onChange: (file: File | null) => void;
    maxSize?: number;
}

export function ClientForm({ client, onSubmit, isLoading, onCancel }: ClientFormProps) {
    const [ isMounted, setIsMounted ] = useState(false)
    const [ step, setStep ] = useState(1)
    const [ isDniChecking, setIsDniChecking ] = useState(false);
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ isDniValid, setIsDniValid ] = useState(true);
    const submitAttemptRef = useRef<boolean>(false);
    const dniValidationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const onSubmitInvocationIdRef = useRef(0);
    const [ existingReferenceImageUrl, setExistingReferenceImageUrl ] = useState<string | null>(null);
    const [ currentInvocationId ] = useState(() => Math.random().toString(36).substring(7));

    const { plans, refreshPlans } = usePlans()
    const { sectors, refreshSector } = useSectors()
    const { services, refreshService } = useServices()

    const [ selectedServiceId, setSelectedServiceId ] = useState<number | null>(
        client?.plan?.service?.id || null
    )

    const form = useForm<ClientFormData>({
        resolver: zodResolver(ClientSchema),
        defaultValues: {
            id: client?.id,
            name: client?.name ?? '',
            lastName: client?.lastName ?? '',
            dni: client?.dni ?? '',
            phone: client?.phone ?? '',
            address: client?.address ?? '',
            installationDate: client?.installationDate ? format(new Date(client.installationDate), 'yyyy-MM-dd') : '',
            reference: client?.reference ?? '',
            paymentDate: client?.paymentDate ? format(new Date(client.paymentDate), 'yyyy-MM-dd') : '',
            advancePayment: convertToBoolean(client?.advancePayment),
            status: client?.status ?? AccountStatusEnum.enum.ACTIVE,
            plan: client?.plan?.id || 0,
            sector: client?.sector?.id,
            description: client?.description ?? '',
            paymentStatus: client?.paymentStatus,
            decoSerial: client?.decoSerial ?? '',
            routerSerial: client?.routerSerial ?? '',
            referenceImage: undefined
        },
        mode: "onChange"
    })

    useEffect(() => {
        refreshPlans()
        refreshSector()
        refreshService()
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (client) {
            const initialAdvancePayment = convertToBoolean(client.advancePayment);
            console.log('Valor inicial de advancePayment:', initialAdvancePayment, 'Valor original:', client.advancePayment);

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
                advancePayment: initialAdvancePayment,
                status: client.status,
                plan: client.plan?.id || 0,
                sector: client.sector?.id,
                description: client.description ?? '',
                paymentStatus: client.paymentStatus,
                decoSerial: client.decoSerial ?? '',
                routerSerial: client.routerSerial ?? '',
                referenceImage: undefined
            });
            setSelectedServiceId(client.plan?.service?.id || null);
            setIsDniValid(true);
            form.clearErrors('dni');

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''; // Usa tu URL base de API o déjala vacía si las rutas ya son absolutas desde el backend
            if (client.referenceImage && typeof client.referenceImage === 'string') {
                // Si referenceImage ya es una URL absoluta, úsala directamente.
                // Si es una ruta relativa al backend, construye la URL completa.
                if (client.referenceImage.startsWith('http://') || client.referenceImage.startsWith('https://')) {
                    setExistingReferenceImageUrl(client.referenceImage);
                } else if (baseUrl) {
                    setExistingReferenceImageUrl(`${baseUrl}/${client.referenceImage.replace(/^\//, '')}`);
                } else {
                    // Si no hay baseUrl y no es una URL absoluta, podría ser una ruta relativa al directorio public de Next.js
                    // Asegúrate de que comience con '/' si es el caso.
                    setExistingReferenceImageUrl(client.referenceImage.startsWith('/') ? client.referenceImage : `/${client.referenceImage}`);
                }
            } else {
                setExistingReferenceImageUrl(null);
            }

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
                plan: 0,
                sector: undefined,
                description: '',
                paymentStatus: undefined,
                decoSerial: '',
                routerSerial: '',
                referenceImage: undefined
            });
            setIsDniValid(false);
            setExistingReferenceImageUrl(null);
            setSelectedServiceId(null);
        }
        setStep(1);
        onSubmitInvocationIdRef.current = 0;
    }, [ client, form ]);

    const filteredPlans = React.useMemo(() => {
        if (!selectedServiceId) return [];
        return plans.filter(plan => plan.service?.id === selectedServiceId);
    }, [ plans, selectedServiceId ]);

    const checkDniExists = async (dni: string): Promise<boolean> => {
        try {
            const response = await api.get(`/client/validate-dni/${dni}`);
            return response.data.exists;
        } catch (error) {
            console.error('Error al verificar DNI:', error);
            return false;
        }
    };

    useEffect(() => {
        return () => {
            if (dniValidationTimeoutRef.current) {
                clearTimeout(dniValidationTimeoutRef.current);
            }
        };
    }, []);

    if (!isMounted) {
        return null;
    }

    const nextStep = () => {
        setStep(prev => Math.min(3, prev + 1));
    };

    const prevStep = () => {
        setStep(prev => Math.max(1, prev - 1));
    };

    const getFieldsForStep = (currentStep: number): (keyof ClientFormData)[] => {
        switch (currentStep) {
            case 1:
                return [ "name", "lastName", "dni", "phone", "address", "reference", "description" ];
            case 2:
                return [ "plan", "sector", "installationDate", "paymentDate", "status", "advancePayment", "decoSerial", "routerSerial" ];
            case 3:
                return [ "referenceImage" ];
            default:
                return [];
        }
    };

    const validateCurrentStep = async () => {
        const fieldsToValidate = getFieldsForStep(step);
        const results = await Promise.all(
            fieldsToValidate.map(field => form.trigger(field))
        );

        if (step === 1 && !isDniValid && !client) {
            toast.error("Por favor, ingrese un DNI válido");
            return false;
        }

        return results.every(result => result === true);
    };

    const validateDni = async (dni: string) => {
        if (!dni || dni.length !== 8) {
            form.setError('dni', {
                type: 'manual',
                message: 'El DNI debe contener exactamente 8 dígitos'
            });
            setIsDniValid(false);
            return;
        }

        if (!/^\d{8}$/.test(dni)) {
            form.setError('dni', {
                type: 'manual',
                message: 'El DNI solo debe contener números'
            });
            setIsDniValid(false);
            return;
        }

        if (client && client.dni === dni) {
            form.clearErrors('dni');
            setIsDniValid(true);
            return;
        }

        if (dniValidationTimeoutRef.current) {
            clearTimeout(dniValidationTimeoutRef.current);
        }

        dniValidationTimeoutRef.current = setTimeout(async () => {
            try {
                setIsDniChecking(true);
                const dniResponse = await api.get(`/client/validate-dni/${dni}`);

                if (dniResponse.data.exists) {
                    form.setError('dni', {
                        type: 'manual',
                        message: dniResponse.data.message || 'Este DNI ya está registrado'
                    });
                    setIsDniValid(false);
                } else {
                    form.clearErrors('dni');
                    setIsDniValid(true);
                }
            } catch (error: any) {
                console.error("Error al validar DNI:", error);
                setIsDniValid(false);
                if (error.response?.status === 400) {
                    form.setError('dni', {
                        type: 'manual',
                        message: error.response.data.message || 'DNI inválido'
                    });
                } else {
                    form.setError('dni', {
                        type: 'manual',
                        message: 'Error al validar el DNI'
                    });
                }
            } finally {
                setIsDniChecking(false);
            }
        }, 500);
    };

    const _onSubmit = async (values: ClientFormData) => {
        onSubmitInvocationIdRef.current += 1;
        const currentInvocationId = onSubmitInvocationIdRef.current;
        console.log(`[${currentInvocationId}] _onSubmit called. Client prop:`, client, 'Values:', values);

        if (submitAttemptRef.current && isSubmitting) {
            console.log(`[${currentInvocationId}] _onSubmit: Prevención de envío duplicado (flags ya en true).`);
            return;
        }

        if (step !== 3) {
            console.log(`[${currentInvocationId}] _onSubmit: step is ${step}, not 3. Returning.`);
            return;
        }

        try {
            setIsSubmitting(true);
            submitAttemptRef.current = true;

            console.log(`[${currentInvocationId}] _onSubmit: proceeding with submission logic.`);

            const isValid = await form.trigger();
            if (!isValid || !isDniValid) {
                toast.error("Por favor, complete todos los campos requeridos y asegúrese de que el DNI sea válido");
                setIsSubmitting(false);
                submitAttemptRef.current = false;
                console.log(`[${currentInvocationId}] _onSubmit: validation failed, flags reset.`);
                return;
            }

            const formData = new FormData();

            if (values.referenceImage instanceof File) {
                const timestamp = new Date().getTime();
                const fileExtension = values.referenceImage.name.split('.').pop();
                const newFileName = `client_image_${timestamp}.${fileExtension}`;
                const renamedFile = new File([ values.referenceImage ], newFileName, { type: values.referenceImage.type });
                formData.append('referenceImage', renamedFile);
            }

            const { referenceImage, advancePayment, ...restClientData } = values;

            // Manejar advancePayment de forma separada
            const boolAdvancePayment = convertToBoolean(advancePayment);
            formData.append('advancePayment', boolAdvancePayment ? '1' : '0');
            console.log(`[${currentInvocationId}] Enviando advancePayment como:`, boolAdvancePayment ? '1' : '0', 'Valor booleano:', boolAdvancePayment);

            // Manejar el resto de los campos
            Object.entries(restClientData).forEach(([ key, value ]) => {
                if (value !== undefined) {
                    formData.append(key, String(value));
                }
            });

            const isEditing = !!(client?.id || values?.id);
            const currentId = client?.id || values?.id;
            console.log(`[${currentInvocationId}] isEditing:`, isEditing, 'client.id:', client?.id, 'values.id:', values?.id);
            const endpoint = isEditing ? `/client/${currentId}` : '/client';
            const method = isEditing ? 'PATCH' : 'POST';

            console.log(`[${currentInvocationId}] API Call: ${method} ${endpoint}`);
            const response = await api({
                method,
                url: endpoint,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data) {
                const processedData = {
                    ...response.data,
                    advancePayment: convertToBoolean(response.data.advancePayment)
                };
                console.log(`[${currentInvocationId}] API call successful, datos procesados:`, processedData);
                await onSubmit(processedData);
                toast.success(isEditing ? "Cliente actualizado exitosamente" : "Cliente creado exitosamente");
            }
        } catch (error: any) {
            console.error(`[${currentInvocationId}] Error al guardar cliente (_onSubmit catch):`, error);
            toast.error(error.response?.data?.message || "Error al guardar el cliente");
        } finally {
            console.log(`[${currentInvocationId}] _onSubmit finally block. Resetting flags.`);
            setIsSubmitting(false);
            submitAttemptRef.current = false;
            console.log(`[${currentInvocationId}] _onSubmit finally block. Flags reset. isSubmitting:`, isSubmitting, 'submitAttemptRef:', submitAttemptRef.current);
        }
    };

    const handleDateChange = (field: "installationDate" | "paymentDate", date: Date | undefined) => {
        if (date) {
            const formattedDate = format(date, 'yyyy-MM-dd');
            form.setValue(field, formattedDate);

            if (field === "paymentDate") {
                const installDate = form.getValues("installationDate");
                if (installDate) {
                    const installDateTime = new Date(installDate).getTime();
                    const payDateTime = date.getTime();
                    if (installDateTime > payDateTime) {
                        form.setError("paymentDate", {
                            type: "manual",
                            message: "La fecha de pago no puede ser anterior a la fecha de instalación"
                        });
                    } else {
                        form.clearErrors("paymentDate");
                    }
                }
            }
        } else {
            form.setValue(field, '');
        }
        form.trigger(field);
    };

    const handleServiceChange = (serviceId: string) => {
        const numericId = parseInt(serviceId, 10);
        setSelectedServiceId(isNaN(numericId) ? null : numericId);
        form.setValue('plan', 0, { shouldValidate: true });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    console.log('Form onSubmit triggered. Step:', step, 'isSubmitting:', isSubmitting, 'submitAttemptRef:', submitAttemptRef.current, 'isDniValid:', isDniValid);

                    if (step !== 3) {
                        console.log('Form onSubmit: step is not 3, returning.');
                        return;
                    }
                    if (isSubmitting || submitAttemptRef.current) {
                        console.log('Form onSubmit: submission already in progress or attempted (isSubmitting:', isSubmitting, 'submitAttemptRef:', submitAttemptRef.current, '), returning.');
                        return;
                    }
                    if (!isDniValid) {
                        console.log('Form onSubmit: DNI is not valid, returning.');
                        toast.error("El DNI no es válido. No se puede guardar.");
                        return;
                    }

                    console.log('Form onSubmit: proceeding to call _onSubmit.');
                    setIsSubmitting(true);
                    submitAttemptRef.current = true;

                    try {
                        await _onSubmit(form.getValues());
                    } catch (error) {
                        console.error("Error calling _onSubmit from form handler:", error);
                        toast.error("Ocurrió un error inesperado al intentar guardar.");
                        setIsSubmitting(false);
                        submitAttemptRef.current = false;
                    }
                }}
                className="flex flex-col h-[calc(80vh-8rem)]"
                aria-label={client?.id ? "Formulario de edición de cliente" : "Formulario de nuevo cliente"}
            >
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                            <h3 className="text-lg font-medium mb-4 md:col-span-2">Paso 1: Datos Personales</h3>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Nombre"
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    form.trigger("name");
                                                }}
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
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Apellido"
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    form.trigger("lastName");
                                                }}
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
                                        <FormLabel>DNI</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="DNI (8 dígitos)"
                                                maxLength={8}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    field.onChange(value);
                                                    form.trigger("dni");
                                                }}
                                                onBlur={() => validateDni(field.value)}
                                                disabled={isDniChecking}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        {isDniChecking && (
                                            <p className="text-sm text-muted-foreground">
                                                Verificando DNI...
                                            </p>
                                        )}
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
                                                {...field}
                                                placeholder="Teléfono (mínimo 9 dígitos)"
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    field.onChange(value);
                                                    form.trigger("phone");
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                            <h3 className="text-lg font-medium mb-4 md:col-span-2">Paso 2: Detalles del Servicio</h3>
                            <FormItem className="md:col-span-2">
                                <FormLabel>Tipo de Servicio</FormLabel>
                                <Select
                                    onValueChange={handleServiceChange}
                                    value={selectedServiceId?.toString() ?? ''}
                                    disabled={isLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar servicio" />
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
                            <FormField
                                control={form.control}
                                name="installationDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha Instalación</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                    >
                                                        {field.value ? format(new Date(`${field.value}T00:00:00`), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(`${field.value}T00:00:00`) : undefined}
                                                    onSelect={handleDateChange.bind(null, "installationDate")}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    initialFocus
                                                    locale={es}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="paymentDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha Próximo Pago</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(
                                                                new Date(`${field.value}T12:00:00Z`),
                                                                "PPP",
                                                                { locale: es }
                                                            )
                                                        ) : (
                                                            <span>Seleccionar fecha</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(`${field.value}T12:00:00Z`) : undefined}
                                                    onSelect={handleDateChange.bind(null, "paymentDate")}
                                                    disabled={(date) => date < new Date("1900-01-01")}
                                                    initialFocus
                                                    locale={es}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            {!client || !client.initialPaymentDate
                                                ? "Esta fecha se establecerá como la fecha inicial de pago"
                                                : "La fecha de pago se calcula automáticamente basada en la fecha inicial de pago"}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado Cuenta</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccione estado" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {AccountStatusEnum.options.map((status) => (
                                                <SelectItem key={status} value={status}>{getAccountStatusLabel(status)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="advancePayment" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                    <FormControl>
                                        <Checkbox
                                            checked={convertToBoolean(field.value)}
                                            onCheckedChange={(checked) => {
                                                const boolValue = convertToBoolean(checked);
                                                field.onChange(boolValue);
                                                console.log('Checkbox onChange:', boolValue, 'Valor original:', checked);
                                            }}
                                            id="advancePaymentCheckbox"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel htmlFor="advancePaymentCheckbox">
                                            Pago Adelantado
                                        </FormLabel>
                                        <FormDescription>
                                            Marque esta opción si el cliente realiza pagos por adelantado
                                        </FormDescription>
                                    </div>
                                    <FormMessage className="ml-auto" />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="decoSerial" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Serie Decodificador</FormLabel>
                                    <FormControl><Input {...field} placeholder="Serie del Deco (Opcional)" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="routerSerial" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Serie Router</FormLabel>
                                    <FormControl><Input {...field} placeholder="Serie del Router (Opcional)" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="grid grid-cols-1 gap-6 p-2">
                            <h3 className="text-lg font-medium mb-4">Paso 3: Imagen de Referencia</h3>
                            <FormField
                                control={form.control}
                                name="referenceImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Imagen de Referencia</FormLabel>
                                        <FormControl>
                                            <FileUpload
                                                value={field.value}
                                                onChange={(file) => {
                                                    field.onChange(file);
                                                    form.trigger("referenceImage");
                                                }}
                                                maxSize={2 * 1024 * 1024}
                                                existingImageUrl={existingReferenceImageUrl}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Sube una imagen de referencia del lugar de instalación (opcional)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-between p-4 border-t bg-white">
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={step === 1 ? onCancel : prevStep}
                            disabled={isSubmitting}
                        >
                            {step === 1 ? "Cancelar" : (
                                <>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Anterior
                                </>
                            )}
                        </Button>
                    </div>

                    <div>
                        {step === 3 ? (
                            <Button
                                type="submit"
                                disabled={isSubmitting || submitAttemptRef.current || !isDniValid}
                            >
                                {isSubmitting ? "Guardando..." : (client?.id || form.getValues("id") ? "Actualizar Cliente" : "Guardar Cliente")}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    const isValid = await validateCurrentStep();
                                    if (!isValid) {
                                        toast.error("Por favor, complete todos los campos requeridos del paso actual");
                                        return;
                                    }
                                    nextStep();
                                }}
                                disabled={isSubmitting}
                            >
                                Siguiente <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </Form>
    )
}