"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, CreditCard, DollarSign, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, toFloat, transformPaymentDataForBackend, validatePaymentData, getCurrentDateString } from "@/lib/utils";
import { PaymentTypeEnum } from "@/schemas/payment-schema";
import { getPaymentTypeLabel } from "@/utils/payment-type-labels";
import { toast } from "sonner";
import api from "@/lib/axios";
import { z } from "zod";

// Esquema específico para pago adelantado
const AdvancePaymentSchema = z.object({
    clientId: z.number().min(1, "Cliente es requerido"),
    amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
    paymentDate: z.string().min(1, "Fecha de pago es requerida"),
    paymentType: z.string().min(1, "Método de pago es requerido"),
    reference: z.string().optional(),
    transfername: z.string().optional(),
    dueDate: z.string().optional(),
});

type AdvancePaymentFormData = z.infer<typeof AdvancePaymentSchema>;

interface AdvancePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess?: () => void;
    onPaymentCancel?: () => void;
    clientId: number;
    clientName: string;
    clientLastName: string;
    planPrice: number;
    planName: string;
    initialPaymentDate?: string;
}

export function AdvancePaymentModal({
    isOpen,
    onClose,
    onPaymentSuccess,
    onPaymentCancel,
    clientId,
    clientName,
    clientLastName,
    planPrice,
    planName,
    initialPaymentDate
}: AdvancePaymentModalProps) {
    // Debug: Log de los datos recibidos
    console.log("🔍 AdvancePaymentModal - Datos recibidos:", {
        clientId,
        clientName,
        clientLastName,
        planPrice,
        planName,
        initialPaymentDate
    });

    // Validar que los datos requeridos estén presentes
    if (!clientId || !clientName || !clientLastName || typeof planPrice !== 'number' || planPrice <= 0) {
        console.error("❌ Datos inválidos para el modal de pago adelantado:", {
            clientId,
            clientName,
            clientLastName,
            planPrice,
            planName
        });
        return null;
    }
    const [ isPaymentDatePickerOpen, setIsPaymentDatePickerOpen ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(false);



    const form = useForm<AdvancePaymentFormData>({
        resolver: zodResolver(AdvancePaymentSchema),
        defaultValues: {
            clientId: clientId,
            amount: typeof planPrice === 'number' ? planPrice : 0,
            paymentDate: getCurrentDateString(),
            paymentType: "",
            reference: "",
            transfername: "",
            dueDate: initialPaymentDate || getCurrentDateString(),
        },
    });

    // Debug: Log de los valores por defecto del formulario
    console.log("🔍 AdvancePaymentModal - Valores por defecto del formulario:", {
        clientId: form.getValues("clientId"),
        amount: form.getValues("amount"),
        planPrice,
        planName
    });

    const watchedPaymentType = form.watch("paymentType");

    const handleSubmit = async (values: AdvancePaymentFormData) => {
        try {
            setIsLoading(true);

            // Debug: Log de los valores del formulario
            console.log("🔍 AdvancePaymentModal - Valores del formulario:", values);
            console.log("🔍 AdvancePaymentModal - Props del modal:", {
                clientId,
                planPrice,
                planName
            });

            // Preparar datos del pago usando la función de transformación
            const rawPaymentData = {
                clientId: clientId, // Mantener clientId para la transformación
                amount: values.amount,
                baseAmount: typeof planPrice === 'number' ? planPrice : 0,
                paymentDate: values.paymentDate,
                dueDate: values.dueDate,
                paymentType: values.paymentType,
                reference: values.reference || "",
                transfername: values.transfername || "",
                status: "PAYMENT_DAILY", // Pago adelantado siempre es pagado
                advancePayment: true,
                reconnection: false,
                discount: 0,
            };

            // Transformar datos para el backend
            const paymentData = transformPaymentDataForBackend(rawPaymentData);

            // Validar que el cliente sea correcto
            if (!validatePaymentData(paymentData)) {
                toast.error("Datos de cliente inválidos. Por favor, verifique la información.");
                return;
            }

            // Debug: Verificar que el clientId sea correcto
            console.log("🔍 AdvancePaymentModal - Verificación de clientId:", {
                formClientId: values.clientId,
                propsClientId: clientId,
                paymentDataClient: paymentData.client,
                type: typeof paymentData.client
            });

            // Debug: Log de los datos que se van a enviar
            console.log("🚀 AdvancePaymentModal - Datos a enviar al backend:", paymentData);
            console.log("🔍 AdvancePaymentModal - URL de la petición:", "/payments");
            console.log("🔍 AdvancePaymentModal - Método:", "POST");

            // Crear el pago
            const response = await api.post("/payments", paymentData);
            console.log("✅ AdvancePaymentModal - Respuesta del backend:", response.data);
            console.log("🔍 AdvancePaymentModal - Cliente en la respuesta:", response.data.client);

            toast.success("Pago adelantado registrado correctamente");

            // Llamar callback de éxito si existe
            if (onPaymentSuccess) {
                onPaymentSuccess();
            }

            onClose();
        } catch (error: any) {
            console.error("❌ Error al registrar pago adelantado:", error);
            toast.error(error.response?.data?.message || "Error al registrar el pago adelantado");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        // Llamar callback de cancelación si existe
        if (onPaymentCancel) {
            onPaymentCancel();
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-w-[95vw] w-full">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        Pago Adelantado
                    </DialogTitle>
                    <DialogDescription>
                        Complete los datos del pago adelantado para {clientName} {clientLastName}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Información del Cliente y Plan */}
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium">Cliente</span>
                                        </div>
                                        <p className="text-lg font-semibold">{clientName} {clientLastName}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium">Plan</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-lg font-semibold">{planName}</p>
                                            <Badge variant="default" className="bg-green-600">
                                                S/. {typeof planPrice === 'number' ? planPrice.toFixed(2) : '0.00'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Campos del formulario */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto del Pago</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">S/.</span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="pl-10"
                                                    {...field}
                                                    value={field.value === null || field.value === undefined ? "" : toFloat(field.value).toFixed(2)}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(toFloat(value));
                                                    }}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Pago</FormLabel>
                                        <FormControl>
                                            <Popover open={isPaymentDatePickerOpen} onOpenChange={setIsPaymentDatePickerOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                                        disabled={isLoading}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? format(new Date(field.value), "PPP", { locale: es }) : "Seleccionar fecha"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                field.onChange(format(date, "yyyy-MM-dd"));
                                                            }
                                                            setIsPaymentDatePickerOpen(false);
                                                        }}
                                                        disabled={(date) => date < new Date("1900-01-01")}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="paymentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Método de Pago</FormLabel>
                                        <Select disabled={isLoading} onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar método" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={PaymentTypeEnum.Enum.TRANSFER}>
                                                    {getPaymentTypeLabel(PaymentTypeEnum.Enum.TRANSFER as any)}
                                                </SelectItem>
                                                <SelectItem value={PaymentTypeEnum.Enum.CASH}>
                                                    {getPaymentTypeLabel(PaymentTypeEnum.Enum.CASH as any)}
                                                </SelectItem>
                                                <SelectItem value={PaymentTypeEnum.Enum.YAPE}>
                                                    {getPaymentTypeLabel(PaymentTypeEnum.Enum.YAPE as any)}
                                                </SelectItem>
                                                <SelectItem value={PaymentTypeEnum.Enum.PLIN}>
                                                    {getPaymentTypeLabel(PaymentTypeEnum.Enum.PLIN as any)}
                                                </SelectItem>
                                                <SelectItem value={PaymentTypeEnum.Enum.OTHER}>
                                                    {getPaymentTypeLabel(PaymentTypeEnum.Enum.OTHER as any)}
                                                </SelectItem>
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
                                        <FormLabel>Referencia (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: N° de factura, orden de servicio" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Campo de transfername - solo visible para transferencias */}
                        {(watchedPaymentType === PaymentTypeEnum.Enum.TRANSFER ||
                            watchedPaymentType === PaymentTypeEnum.Enum.YAPE ||
                            watchedPaymentType === PaymentTypeEnum.Enum.PLIN) && (
                                <FormField
                                    control={form.control}
                                    name="transfername"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Nombre/Referencia de {(watchedPaymentType || "").charAt(0) + (watchedPaymentType || "").slice(1).toLowerCase()}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={
                                                        watchedPaymentType === PaymentTypeEnum.Enum.TRANSFER
                                                            ? "Ej: Nombre del titular de la cuenta"
                                                            : "Ej: N° de Operación Yape/Plin"
                                                    }
                                                    {...field}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Registrando..." : "Registrar Pago Adelantado"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 