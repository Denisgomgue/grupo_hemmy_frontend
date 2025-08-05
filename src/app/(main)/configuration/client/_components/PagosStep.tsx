import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CreditCard, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ClientPaymentConfigFormData, PaymentStatusEnum } from "@/schemas/client-payment-config-schema";

interface PagosStepProps {
    values: Partial<ClientPaymentConfigFormData>;
    onChange: (field: keyof ClientPaymentConfigFormData, value: any) => void;
    onGenerarPago: () => void;
    onValidationChange?: (isValid: boolean) => void;
    selectedPlan?: any;
    isEditMode?: boolean; // Nueva prop para modo edición
}

interface ValidationErrors {
    initialPaymentDate?: string;
}

export default function PagosStep({
    values,
    onChange,
    onGenerarPago,
    onValidationChange,
    selectedPlan,
    isEditMode = false
}: PagosStepProps) {
    const [ errors, setErrors ] = useState<ValidationErrors>({});
    const [ touched, setTouched ] = useState<Record<string, boolean>>({});

    // Función para validar todos los campos obligatorios
    const validateAllFields = () => {
        const newErrors: ValidationErrors = {};

        if (!values.initialPaymentDate) {
            newErrors.initialPaymentDate = "La fecha de próximo pago es obligatoria";
        }

        return newErrors;
    };

    // Efecto para validar en tiempo real
    useEffect(() => {
        const newErrors = validateAllFields();
        setErrors(newErrors);

        // Notificar si el formulario es válido
        const isValid = Object.keys(newErrors).length === 0;
        if (onValidationChange) {
            onValidationChange(isValid);
        }
    }, [ values.initialPaymentDate ]);

    // Manejar blur de campos
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [ field ]: true }));
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "PAID":
                return "default";
            case "EXPIRING":
                return "secondary";
            case "SUSPENDED":
                return "destructive";
            case "EXPIRED":
                return "destructive";
            default:
                return "outline";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PAID":
                return "Pagado";
            case "EXPIRING":
                return "Por vencer";
            case "SUSPENDED":
                return "Suspendido";
            case "EXPIRED":
                return "Vencido";
            default:
                return "Desconocido";
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Configuración de Pagos</h3>
                <p className="text-sm text-muted-foreground">
                    Configure las opciones de pago y facturación del cliente
                </p>
            </div>

            {/* Card - Fecha de Próximo Pago */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <label className="text-sm font-medium text-foreground">
                            Fecha de Próximo Pago <span className="text-red-500">*</span>
                        </label>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal bg-background hover:bg-accent ${errors.initialPaymentDate && touched.initialPaymentDate ? "border-red-500" : ""}`}
                                onBlur={() => handleBlur("initialPaymentDate")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {values.initialPaymentDate ? (
                                    format(new Date(values.initialPaymentDate), "PPP", { locale: es })
                                ) : (
                                    <span>Seleccione fecha de pago</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                variant="payment-date"
                                mode="single"
                                defaultMonth={
                                    values.initialPaymentDate
                                        ? new Date(values.initialPaymentDate)
                                        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                                }
                                selected={values.initialPaymentDate ? new Date(values.initialPaymentDate) : undefined}
                                onSelect={(date) => {
                                    onChange("initialPaymentDate", date);
                                    handleBlur("initialPaymentDate");
                                }}
                                disabled={(date) => {
                                    // En modo edición, permitir todas las fechas
                                    if (isEditMode) {
                                        return false;
                                    }
                                    // En modo creación, deshabilitar fechas anteriores al primer día del mes actual
                                    const today = new Date();
                                    const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                                    return date < firstDayOfCurrentMonth;
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.initialPaymentDate && touched.initialPaymentDate && (
                        <div className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            {errors.initialPaymentDate}
                        </div>
                    )}
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        {isEditMode
                            ? "Puede modificar la fecha de pago según sea necesario"
                            : "La fecha debe ser desde el mes actual hacia adelante"
                        }
                    </p>
                </div>
            </div>

            {/* Card - Pago Adelantado */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <label className="text-sm font-medium text-foreground">
                            Pago Adelantado
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Switch
                                checked={values.advancePayment === true}
                                onCheckedChange={(checked) => onChange("advancePayment", checked)}
                                disabled={isEditMode}
                            />
                            <span className={`text-sm font-medium ${isEditMode ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {values.advancePayment === true ? "Sí" : "No"}
                            </span>
                        </div>
                        {values.advancePayment === true && (
                            <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Activado</span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        {isEditMode
                            ? "El pago adelantado no se puede modificar en modo edición"
                            : values.advancePayment === true
                                ? "Después de crear el cliente, se abrirá automáticamente el formulario de pago adelantado"
                                : "El cliente pagará según el cronograma regular"
                        }
                    </p>
                </div>
            </div>

            {/* Información del Plan Seleccionado */}


            {/* Card - Información de Pago Adelantado (Solo visible cuando advancePayment es true) */}
            {values.advancePayment === true && (
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200 dark:border-violet-800 rounded-lg p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            <span className="text-sm font-medium text-violet-900 dark:text-violet-100">
                                Pago Adelantado Activado
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                                <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-2 h-2 bg-violet-600 rounded-full"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-violet-900 dark:text-violet-100 mb-1">
                                        Registro de Primer Pago
                                    </p>
                                    <p className="text-xs text-violet-700 dark:text-violet-300">
                                        Al completar el registro del cliente, se abrirá automáticamente un modal para configurar el primer pago adelantado con el monto del plan seleccionado.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                        Configuración Automática
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        El valor de <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">advancePayment</code> se guardará como <code className="bg-green-100 dark:bg-green-900 px-1 rounded">true</code> en la tabla <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">client_payment_config</code>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-violet-200 dark:border-violet-700">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                    Pago adelantado configurado
                                </span>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 