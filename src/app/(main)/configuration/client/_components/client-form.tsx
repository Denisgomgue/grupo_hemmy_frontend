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
            ipAddress: client?.ipAddress ?? '',
            referenceImage: undefined
        },
        mode: "onChange"
    });

    const isEditing = !!client?.id;

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (client?.referenceImage) {
            setExistingReferenceImageUrl(`/uploads/clients/${client.referenceImage}`);
        }
    }, [ client?.referenceImage ]);

    useEffect(() => {
        if (isMounted) {
            refreshPlans()
            refreshSector()
            refreshService()
        }
    }, [ isMounted, refreshPlans, refreshSector, refreshService ])

    // Función para validar DNI contra la base de datos
    const checkDniExists = async (dni: string): Promise<boolean> => {
        try {
            const response = await api.get(`/client/validate-dni/${dni}`, {
                params: { excludeId: client?.id } // Excluir el cliente actual si estamos editando
            });
            return !response.data.valid; // Invertimos porque queremos saber si existe
        } catch (error) {
            console.error('Error al verificar DNI:', error);
            return false;
        }
    };

    const nextStep = () => {
        setStep(step + 1)
    }

    const prevStep = () => {
        setStep(step - 1)
    }

    const getFieldsForStep = (currentStep: number): (keyof ClientFormData)[] => {
        switch (currentStep) {
            case 1:
                return [ 'name', 'lastName', 'dni', 'phone', 'address', 'description', 'birthdate', 'status' ]
            case 2:
                return [ 'installationDate', 'plan', 'sector', 'reference', 'ipAddress', 'referenceImage' ]
            case 3:
                return [ 'paymentDate', 'advancePayment', 'routerSerial', 'decoSerial' ]
            default:
                return []
        }
    }

    const validateCurrentStep = async () => {
        const fieldsForStep = getFieldsForStep(step)
        const isValid = await form.trigger(fieldsForStep as any)

        // Validación especial para DNI en el paso 1
        if (step === 1 && form.getValues('dni')) {
            const dniValue = form.getValues('dni');
            if (dniValue.length === 8) {
                setIsDniChecking(true);
                try {
                    const exists = await checkDniExists(dniValue);
                    setIsDniValid(!exists);
                    if (exists) {
                        toast.error('Este DNI ya está registrado');
                        return false;
                    }
                } catch (error) {
                    setIsDniValid(true);
                } finally {
                    setIsDniChecking(false);
                }
            }
        }

        return isValid && isDniValid;
    }

    // Función para validar DNI con debounce
    const validateDni = async (dni: string) => {
        // Limpiar timeout anterior
        if (dniValidationTimeoutRef.current) {
            clearTimeout(dniValidationTimeoutRef.current);
        }

        // Si el DNI no tiene 8 dígitos, no validar
        if (dni.length !== 8) {
            setIsDniValid(true);
            setIsDniChecking(false);
            return;
        }

        // Esperar 500ms antes de validar
        dniValidationTimeoutRef.current = setTimeout(async () => {
            setIsDniChecking(true);
            try {
                const exists = await checkDniExists(dni);
                setIsDniValid(!exists);
                if (exists) {
                    form.setError('dni', {
                        type: 'manual',
                        message: 'Este DNI ya está registrado'
                    });
                } else {
                    form.clearErrors('dni');
                }
            } catch (error) {
                console.error('Error al validar DNI:', error);
                setIsDniValid(true);
                form.setError('dni', {
                    type: 'manual',
                    message: 'Error al validar el DNI'
                });
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

            const endpoint = isEditing ? `/client/${client.id}` : '/client';
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

    // Función para validar y formatear IPv4
    const formatIPv4 = (value: string) => {
        // Eliminar caracteres no numéricos ni puntos
        let cleanValue = value.replace(/[^\d.]/g, '');

        // Dividir en octetos
        let octets = cleanValue.split('.');

        // Procesar cada octeto
        octets = octets.map((octet, index) => {
            if (octet === '') return '';

            // Convertir a número
            let num = parseInt(octet, 10);

            // Si es el último octeto que se está escribiendo, permitir números parciales
            if (index === octets.length - 1 && value.endsWith(octet)) {
                return octet;
            }

            // Limitar a 255
            if (num > 255) num = 255;
            return num.toString();
        });

        // Reconstruir la dirección IP
        return octets.join('.');
    };

    const handleIPChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
        const formattedValue = formatIPv4(e.target.value);
        onChange(formattedValue);
    };

    if (!isMounted) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {isEditing ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
                    </h2>
                    <p className="text-muted-foreground">
                        {isEditing ? 'Actualiza la información del cliente' : 'Complete la información del cliente'}
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(_onSubmit)} className="space-y-8">
                    {/* Step 1: Información del Cliente */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Información del Cliente</h3>
                                <p className="text-sm text-muted-foreground">
                                    Complete los datos básicos del cliente
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombres *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ingrese los nombres" {...field} />
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
                                            <FormLabel>Apellidos *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ingrese los apellidos" {...field} />
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
                                                    placeholder="12345678"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                                                        field.onChange(value);
                                                        validateDni(value);
                                                    }}
                                                    className={cn(
                                                        isDniChecking && "animate-pulse",
                                                        !isDniValid && "border-red-500"
                                                    )}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            {isDniChecking && (
                                                <p className="text-sm text-muted-foreground">Verificando DNI...</p>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="999 999 999"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                                        const formatted = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
                                                        field.onChange(formatted);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Dirección *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ingrese la dirección completa" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Descripción</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Información adicional del cliente"
                                                    {...field}
                                                />
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
                                                        <SelectValue placeholder="Seleccione un estado" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(AccountStatusEnum.enum).map(([ key, value ]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {getAccountStatusLabel(value)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={async () => {
                                        const isValid = await validateCurrentStep();
                                        if (isValid) {
                                            nextStep();
                                        }
                                    }}
                                    disabled={isDniChecking}
                                >
                                    Siguiente
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Información de Instalación */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Información de Instalación</h3>
                                <p className="text-sm text-muted-foreground">
                                    Complete los datos de la instalación
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="installationDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Instalación</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(new Date(field.value), "PPP", { locale: es })
                                                            ) : (
                                                                <span>Seleccione una fecha</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => handleDateChange("installationDate", date)}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="plan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Plan *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione un plan" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {plans.map((plan) => (
                                                        <SelectItem key={plan.id} value={plan.id.toString()}>
                                                            {plan.name} - ${plan.price}
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
                                    name="sector"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sector *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione un sector" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {sectors.map((sector) => (
                                                        <SelectItem key={sector.id} value={sector.id.toString()}>
                                                            {sector.name}
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
                                    name="reference"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Referencia</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Referencia de ubicación" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="ipAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dirección IP</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="192.168.1.1"
                                                    {...field}
                                                    onChange={(e) => handleIPChange(e, field.onChange)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="referenceImage"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Imagen de Referencia</FormLabel>
                                            <FormControl>
                                                <FileUpload
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    maxSize={2 * 1024 * 1024} // 2MB
                                                    accept="image/*"
                                                    existingImageUrl={existingReferenceImageUrl}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Anterior
                                </Button>
                                <Button
                                    type="button"
                                    onClick={async () => {
                                        const isValid = await validateCurrentStep();
                                        if (isValid) {
                                            nextStep();
                                        }
                                    }}
                                >
                                    Siguiente
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Información de Pagos y Dispositivos */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Información de Pagos y Dispositivos</h3>
                                <p className="text-sm text-muted-foreground">
                                    Complete los datos de pagos y dispositivos
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="paymentDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Pago</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(new Date(field.value), "PPP", { locale: es })
                                                            ) : (
                                                                <span>Seleccione una fecha</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => handleDateChange("paymentDate", date)}
                                                        disabled={(date) =>
                                                            date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="advancePayment"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Pago Adelantado
                                                </FormLabel>
                                                <FormDescription>
                                                    Marque si el cliente tiene pago adelantado
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="routerSerial"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Serial del Router</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Serial del router" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="decoSerial"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Serial del Deco</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Serial del deco" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Anterior
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || isLoading}
                                    onClick={async () => {
                                        const isValid = await validateCurrentStep();
                                        if (!isValid) {
                                            return;
                                        }
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                                            {isEditing ? 'Actualizando...' : 'Creando...'}
                                        </>
                                    ) : (
                                        <>
                                            {isEditing ? 'Actualizar Cliente' : 'Crear Cliente'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </Form>
        </div>
    )
}