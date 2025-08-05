"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { format, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Search, User } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { calculateNextPaymentDate, cn, toFloat, getCurrentDateString, formatDateSafely, createDateFromString } from "@/lib/utils"
import { PaymentSchema, type PaymentFormData, PaymentTypeEnum } from "@/schemas/payment-schema"
import api from "@/lib/axios"
import type { Client } from "@/types/clients/client"
import type { Payment } from "@/types/payments/payment"
import { PaymentStatus } from "@/types/payments/payment"
import { getPaymentTypeLabel } from "@/utils/payment-type-labels"
import { getPaymentStatusLabel } from "@/utils/payment-status-labels"
import { toast } from "sonner"
import { SearchSelectInput, SearchSelectOption } from "@/components/ui/search-select-input"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon, AlertTriangle, HelpCircle } from "lucide-react"
import { z } from "zod"
import { usePaymentQuery } from "@/hooks/use-payment-query"
import { RegularizationNotification, PendingPostponementsNotification, useFloatingNotifications } from "@/components/ui/floating-notifications"



// Esquema dinámico para validación según el tipo de pago
const createPaymentSchema = (isPostponement: boolean) => {
  const baseSchema = PaymentSchema.omit({ engagementDate: true });

  if (isPostponement) {
    return baseSchema.extend({
      engagementDate: z.string({ required_error: "* La fecha de aplazamiento es requerida" }),
    });
  }

  return baseSchema.extend({
    engagementDate: z.string().optional(),
  });
};

interface PaymentFormProps {
  payment?: Payment | null
  onSubmit: (values: PaymentFormData) => void
  isLoading?: boolean
  onCancel: () => void
  preselectedClient?: Client
  hideClientSelection?: boolean
  paymentType?: "payment" | "postponement" | null
  isRegularizationMode?: boolean
}

interface ClientMinimal {
  id: number;
  name: string;
  lastName: string;
  dni: string;
  phone?: string;
  plan?: {
    price: number;
  };
  nextPaymentDate?: string;
}

export function PaymentForm({
  payment,
  onSubmit,
  isLoading = false,
  onCancel,
  preselectedClient,
  hideClientSelection = false,
  paymentType = null,
  isRegularizationMode = false
}: PaymentFormProps) {
  const [ autoCalculateState, setAutoCalculateState ] = useState(true);
  const [ isPaymentDatePickerOpen, setIsPaymentDatePickerOpen ] = useState(false);
  const [ isEngagementDatePickerOpen, setIsEngagementDatePickerOpen ] = useState(false);
  const [ clientSearchQuery, setClientSearchQuery ] = useState("");
  const [ isCommitmentMode, setIsCommitmentMode ] = useState(false);
  const [ pendingPostponements, setPendingPostponements ] = useState<Payment[]>([]);
  const [ shouldRegularize, setShouldRegularize ] = useState(false);
  const [ selectedPendingPayment, setSelectedPendingPayment ] = useState<Payment | null>(null);

  const { getPendingPostponements, updatePayment } = usePaymentQuery();

  // Query para obtener clientes
  const { data: clientsResponse, isLoading: isLoadingClients } = useQuery<{ data: ClientMinimal[]; total: number }>({
    queryKey: [ 'clients', clientSearchQuery ],
    queryFn: async () => {
      try {
        const response = await api.get('/client', {
          params: {
            limit: 100,
            search: clientSearchQuery || undefined
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        return { data: [], total: 0 };
      }
    },
    enabled: !hideClientSelection,
  });

  const clients = useMemo(() => {
    return clientsResponse?.data || [];
  }, [ clientsResponse?.data ]);

  // Convertir clientes a opciones para SearchSelectInput
  const clientOptions: SearchSelectOption[] = useMemo(() => {
    return clients.map(client => ({
      value: client.id,
      label: `${client.name} ${client.lastName}`,
      description: undefined, // ✅ No mostrar DNI ni teléfono por seguridad
      icon: <User className="h-4 w-4 text-muted-foreground" />
    }));
  }, [ clients ]);



  // Calcular monto por defecto basado en el plan del cliente
  const getDefaultAmount = () => {
    if (payment?.amount) return payment.amount;
    if (preselectedClient?.plan?.price) return Number(preselectedClient.plan.price);
    return 0;
  };

  // Calcular monto base por defecto
  const getDefaultBaseAmount = () => {
    if (payment?.baseAmount) return payment.baseAmount;
    if (preselectedClient?.plan?.price) return Number(preselectedClient.plan.price);
    return 0;
  };

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(createPaymentSchema(paymentType === "postponement")),
    defaultValues: {
      id: payment?.id,
      code: payment?.code || "",
      paymentDate: payment?.paymentDate ? formatDateSafely(payment.paymentDate) : getCurrentDateString(),
      reference: payment?.reference || "",
      reconnection: payment?.reconnection || false,
      amount: getDefaultAmount(),
      baseAmount: getDefaultBaseAmount(),
      reconnectionFee: payment?.reconnectionFee || 0,
      status: payment?.status || "PENDING",
      paymentType: payment?.paymentType || undefined,
      transfername: payment?.transfername || "",
      discount: payment?.discount || 0,
      dueDate: payment?.dueDate ? formatDateSafely(payment.dueDate) : "",
      engagementDate: payment?.engagementDate ? formatDateSafely(payment.engagementDate) : "",
      clientId: payment?.clientId || preselectedClient?.id || 0,
      advancePayment: payment?.advancePayment || false,
    },
  });

  const watchedClient = form.watch("clientId");
  const watchedStatus = form.watch("status");
  const watchedEngagementDate = form.watch("engagementDate");

  // Determinar si estamos en modo compromiso basado en el paymentType o el estado
  useEffect(() => {
    if (shouldRegularize && selectedPendingPayment) {
      // Modo regularización: cargar datos del aplazamiento pendiente
      setIsCommitmentMode(false);
      setAutoCalculateState(false);

      // Pre-llenar campos con datos del aplazamiento
      if (selectedPendingPayment) {
        form.setValue("amount", selectedPendingPayment.amount);
        form.setValue("dueDate", selectedPendingPayment.dueDate ? format(new Date(selectedPendingPayment.dueDate), "yyyy-MM-dd") : "");
        form.setValue("engagementDate", selectedPendingPayment.engagementDate ? format(new Date(selectedPendingPayment.engagementDate), "yyyy-MM-dd") : "");
        // NO establecer paymentDate - debe ser completado por el usuario
        form.setValue("status", "PENDING"); // Mantener como PENDING hasta regularizar
      }

      console.log('Modo regularización activado para pago ID:', selectedPendingPayment?.id);
    } else if (paymentType === "postponement") {
      setIsCommitmentMode(true);
      // Configurar automáticamente el estado como PENDING
      form.setValue("status", "PENDING");
      // Configurar fecha de pago como día actual usando la función consistente
      form.setValue("paymentDate", getCurrentDateString());
      // Asegurar que autoCalculateState esté desactivado para mostrar el campo de estado
      setAutoCalculateState(false);
      console.log('Configurando aplazamiento - Status:', form.getValues("status"));
    } else if (paymentType === "payment") {
      setIsCommitmentMode(false);
      // Para pagos normales, mantener la lógica automática
      setAutoCalculateState(true);
    } else {
      // Fallback a la lógica automática si no se especifica paymentType
      const isCommitment = watchedStatus === "PENDING" && !!watchedEngagementDate;
      setIsCommitmentMode(isCommitment);
    }
  }, [ paymentType, watchedStatus, watchedEngagementDate, form, shouldRegularize, selectedPendingPayment ]);

  // Actualizar el resolver cuando cambie el tipo de pago
  useEffect(() => {
    form.clearErrors();
    form.trigger();
  }, [ paymentType, form ]);

  // Efecto para actualizar el monto cuando se selecciona un cliente (solo para nuevos pagos)
  useEffect(() => {
    if (!payment?.id && preselectedClient?.plan?.price) {
      const planPrice = Number(preselectedClient.plan.price);
      form.setValue("amount", planPrice);
      form.setValue("baseAmount", planPrice);
      // Log removido para limpieza
    }
  }, [ preselectedClient, payment?.id, form ]);

  // Efecto para cargar aplazamientos pendientes cuando se selecciona un cliente
  useEffect(() => {
    const selectedClientId = form.watch("clientId");
    if (selectedClientId) {
      const loadPendingPostponements = async () => {
        try {
          const postponements = await getPendingPostponements(selectedClientId);
          setPendingPostponements(postponements);

          // Si hay aplazamientos pendientes y estamos en modo creación (no edición)
          if (postponements.length > 0 && !payment?.id) {
            console.log('🔔 PaymentForm: Encontrados aplazamientos pendientes:', postponements.length)
            setShouldRegularize(true);
            setSelectedPendingPayment(postponements[ 0 ]); // Usar el primer aplazamiento pendiente
          } else {
            setShouldRegularize(false);
            setSelectedPendingPayment(null);
          }
        } catch (error) {
          console.error('Error cargando aplazamientos pendientes:', error);
          setPendingPostponements([]);
          setShouldRegularize(false);
          setSelectedPendingPayment(null);
        }
      };
      loadPendingPostponements();
    } else {
      setPendingPostponements([]);
      setShouldRegularize(false);
      setSelectedPendingPayment(null);
    }
  }, [ form.watch("clientId"), getPendingPostponements, payment?.id ]);

  // Estado para almacenar el monto base del plan
  const [ baseAmount, setBaseAmount ] = useState(0);

  // 🎯 EFECTO PRINCIPAL: Se ejecuta cuando cambia el cliente seleccionado
  // Este useEffect llama a updateDueDate() para calcular automáticamente la fecha de vencimiento
  useEffect(() => {
    /**
     * 🎯 FUNCIÓN PRINCIPAL: Calcula y establece automáticamente la fecha de vencimiento
     * Esta función se ejecuta cada vez que se selecciona un cliente en el formulario
     * 
     * 📋 LÓGICA DE CÁLCULO:
     * 1. Sin pagos previos: Usa initialPaymentDate de clientPaymentConfig
     * 2. Con pagos previos: Calcula desde initialPaymentDate sumando meses según cantidad de pagos
     * 
     * 📅 Ejemplo: Si initialPaymentDate es 17/10/2025
     * - Primer pago: 17/10/2025
     * - Segundo pago: 17/11/2025 (1 mes después)
     * - Tercer pago: 17/12/2025 (2 meses después)
     */
    const updateDueDate = async () => {
      // 🔍 PASO 0: Verificar que hay un cliente seleccionado
      if (!watchedClient) return;

      // 🔍 PASO 0.1: Solo recalcular si es un nuevo pago (no edición)
      if (payment?.id) return;

      try {
        // 🔍 PASO 1: Obtener la instalación del cliente
        // URL: GET /installations?clientId=${watchedClient}&limit=1
        const installationResponse = await api.get(`/installations?clientId=${watchedClient}&limit=1`);

        if (installationResponse.data.length > 0) {
          // 🔍 PASO 1.1: Encontrar la instalación específica para este cliente
          const installation = installationResponse.data.find((inst: any) => inst.client?.id === Number(watchedClient));

          if (installation?.id) {
            // 🔍 PASO 2: Obtener la configuración de pago (clientPaymentConfig)
            // URL: GET /client-payment-config?installationId=${installation.id}&limit=1
            const paymentConfigResponse = await api.get(`/client-payment-config?installationId=${installation.id}&limit=1`);

            if (paymentConfigResponse.data.length > 0) {
              // 🔍 PASO 2.1: Encontrar la configuración específica
              const paymentConfig = paymentConfigResponse.data.find((config: any) => config.installationId === installation.id);

              if (paymentConfig?.initialPaymentDate) {
                // 🔍 PASO 3: Obtener los pagos previos del cliente
                // URL: GET /payments?client=${watchedClient}&limit=1&order=dueDate:DESC
                const paymentsResponse = await api.get(`/payments?client=${watchedClient}&limit=1&order=dueDate:DESC`);

                if (paymentsResponse.data.length > 0) {
                  // 🎯 CASO A: Hay pagos previos - calcular desde initialPaymentDate
                  // ✅ SOLUCIÓN: Usar createDateFromString para evitar problemas de zona horaria
                  const baseDate = createDateFromString(paymentConfig.initialPaymentDate);
                  const numberOfPayments = paymentsResponse.data.length;

                  // 🔢 CALCULO: Sumar meses según la cantidad de pagos existentes
                  let nextDueDate = new Date(baseDate);
                  for (let i = 0; i < numberOfPayments; i++) {
                    nextDueDate = calculateNextPaymentDate(nextDueDate);
                  }

                  // 📝 ESTABLECER LA FECHA en el formulario (formato YYYY-MM-DD)
                  const formattedDate = format(nextDueDate, "yyyy-MM-dd");
                  form.setValue("dueDate", formattedDate);
                } else {
                  // 🎯 CASO B: Es el primer pago - usar initialPaymentDate directamente
                  // ✅ SOLUCIÓN: Usar createDateFromString para evitar problemas de zona horaria
                  const baseDate = createDateFromString(paymentConfig.initialPaymentDate);
                  const formattedDate = format(baseDate, "yyyy-MM-dd");

                  // 📊 LOGS PARA DEBUGGING


                  form.setValue("dueDate", formattedDate);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener fecha de vencimiento:', error);
      }
    };

    updateDueDate();
  }, [ watchedClient, form, payment?.id ]);

  // Efecto para obtener el monto base del plan cuando se selecciona un cliente
  useEffect(() => {
    const getBaseAmount = async () => {
      if (!watchedClient) return;

      // Solo recalcular el monto base si estamos creando un nuevo pago
      // Si estamos editando un pago existente, mantener el monto original
      if (payment?.id) return;

      try {
        // Obtener la instalación del cliente para obtener el plan
        const installationResponse = await api.get(`/installations?clientId=${watchedClient}&limit=1`);

        if (installationResponse.data.length > 0) {
          // Buscar la instalación específica para este cliente
          const installation = installationResponse.data.find((inst: any) => inst.client?.id === Number(watchedClient));

          if (installation?.plan?.price) {
            // Guardar el monto base del plan
            const planPrice = toFloat(installation.plan.price);
            setBaseAmount(planPrice);

            // Calcular monto total inicial
            const reconnectionFee = form.watch("reconnection") ? 10 : 0;
            const discount = toFloat(form.watch("discount") || 0);
            const totalAmount = toFloat(planPrice + reconnectionFee - discount);

            form.setValue("amount", totalAmount);
          }
        }
      } catch (error) {
        console.error('Error al obtener monto base:', error);
      }
    };

    getBaseAmount();
  }, [ watchedClient, form, payment?.id ]);

  // Efecto para recalcular el monto cuando cambian descuento o reconexión
  useEffect(() => {
    // Solo recalcular automáticamente si estamos creando un nuevo pago o en modo regularización
    // Si estamos editando un pago existente, permitir cambios manuales
    if (payment?.id && !shouldRegularize) return;

    if (baseAmount > 0) {
      const reconnectionFee = form.watch("reconnection") ? 10 : 0;
      const discount = toFloat(form.watch("discount") || 0);
      const totalAmount = toFloat(baseAmount + reconnectionFee - discount);

      form.setValue("amount", totalAmount);
    }
  }, [ baseAmount, payment?.id, shouldRegularize, form.watch("reconnection"), form.watch("discount") ]);

  // Efecto para limpiar campos cuando cambia el cliente
  useEffect(() => {
    if (watchedClient) {
      // Solo limpiar campos si estamos creando un nuevo pago
      // Si estamos editando un pago existente, mantener los valores originales
      if (!payment?.id) {
        form.setValue("amount", 0);
        form.setValue("dueDate", "");
        setBaseAmount(0);
      }
    }
  }, [ watchedClient, form, payment?.id ]);



  const handleRegularize = async (values: PaymentFormData) => {
    try {
      if (!selectedPendingPayment) {
        toast.error("No hay aplazamiento pendiente para regularizar");
        return;
      }

      // Validar campos requeridos para regularización
      if (!values.paymentDate) {
        toast.error("La fecha de pago es requerida para regularizar el aplazamiento");
        return;
      }
      if (!values.paymentType) {
        toast.error("El método de pago es requerido para regularizar el aplazamiento");
        return;
      }
      if (!values.reference) {
        toast.error("La referencia de pago es requerida para regularizar el aplazamiento");
        return;
      }

      // Calcular el monto total para regularización
      const reconnectionFee = values.reconnection ? 10 : 0;
      const discount = toFloat(values.discount || 0);
      const totalAmount = toFloat(baseAmount + reconnectionFee - discount);

      // Actualizar el aplazamiento pendiente
      await updatePayment(selectedPendingPayment.id, {
        paymentDate: values.paymentDate,
        paymentType: values.paymentType,
        reference: values.reference,
        transfername: values.transfername,
        discount: values.discount || 0,
        reconnection: values.reconnection || false,
        amount: totalAmount, // Usar el monto calculado
        baseAmount: baseAmount
      });

      toast.success("Aplazamiento regularizado correctamente");
      onCancel(); // Cerrar el formulario
    } catch (error) {
      console.error("Error regularizando aplazamiento:", error);
      toast.error("Error al regularizar el aplazamiento");
    }
  };

  const handleSubmit = async (values: PaymentFormData) => {
    try {
      // Lógica específica para regularización de aplazamientos
      if (shouldRegularize && selectedPendingPayment) {
        // Validar campos requeridos para regularización
        if (!values.paymentDate) {
          toast.error("La fecha de pago es requerida para regularizar el aplazamiento");
          return;
        }
        if (!values.paymentType) {
          toast.error("El método de pago es requerido para regularizar el aplazamiento");
          return;
        }
        if (!values.reference) {
          toast.error("La referencia de pago es requerida para regularizar el aplazamiento");
          return;
        }

        console.log('Regularizando aplazamiento pendiente:', selectedPendingPayment.id);
        // El backend se encargará de calcular el status final
      } else if (paymentType === "postponement") {
        // Para aplazamientos, forzar el estado como PENDING sin importar la lógica automática
        values.status = 'PENDING';
        // Asegurar que tenga fecha de pago (día actual)
        if (!values.paymentDate) {
          values.paymentDate = format(new Date(), "yyyy-MM-dd");
        }
        // Validar que tenga fecha de aplazamiento
        if (!values.engagementDate) {
          toast.error("La fecha de aplazamiento es requerida");
          return;
        }
        // Asegurar que no se aplique la lógica automática para aplazamientos
        console.log('Aplazamiento configurado como PENDING:', values.status);
      } else {
        // Lógica normal para pagos (solo si NO es aplazamiento)
        if (autoCalculateState) {
          const today = new Date();
          const dueDate = values.dueDate ? new Date(values.dueDate) : null;
          const paymentDate = values.paymentDate ? new Date(values.paymentDate) : null;
          const engagementDate = values.engagementDate ? new Date(values.engagementDate) : null;

          // Lógica de cálculo automático del estado
          if (paymentDate) {
            // Si hay fecha de pago, verificar si está a tiempo
            if (dueDate && paymentDate <= dueDate) {
              values.status = 'PAYMENT_DAILY';
            } else {
              values.status = 'LATE_PAYMENT';
            }
          } else if (engagementDate) {
            // Si hay fecha de compromiso pero no fecha de pago
            if (today <= engagementDate) {
              values.status = 'PENDING';
            } else {
              values.status = 'LATE_PAYMENT';
            }
          } else if (dueDate) {
            // Si hay fecha de vencimiento pero no fecha de pago
            if (today <= dueDate) {
              values.status = 'PENDING';
            } else {
              values.status = 'LATE_PAYMENT';
            }
          } else {
            // Sin fechas específicas, por defecto pendiente
            values.status = 'PENDING';
          }
        }

        // Lógica adicional para manejar estados de client_payment_config
        if (values.status === 'PENDING' && values.engagementDate) {
          // Si es un pago pendiente con fecha de compromiso, 
          // el backend debería manejar la actualización de client_payment_config
          console.log('Pago pendiente con fecha de compromiso:', values.engagementDate);
        }
      }



      await onSubmit(values);
      toast.success(
        shouldRegularize && selectedPendingPayment
          ? "Aplazamiento regularizado correctamente"
          : payment?.id
            ? `El ${paymentType === "postponement" ? "aplazamiento" : "pago"} se ha actualizado correctamente`
            : `El ${paymentType === "postponement" ? "aplazamiento" : "pago"} se ha registrado correctamente`
      );
    } catch (error: any) {
      console.error('Error al procesar el pago:', error);

      // 🎯 MEJORA: Extraer mensaje específico del backend
      let errorMessage = "Hubo un problema al procesar el pago. Por favor, intente nuevamente.";

      if (error.response?.data?.message) {
        // Mensaje específico del backend (ej: validación de un pago por mes)
        errorMessage = error.response.data.message;
      } else if (error.message && error.message.includes('aplazamientos pendientes')) {
        // Error específico de aplazamientos
        errorMessage = error.message;
      } else if (error.response?.status === 500) {
        // Error interno del servidor
        errorMessage = "Error interno del servidor. Por favor, contacte al administrador.";
      } else if (error.response?.status === 400) {
        // Error de validación
        errorMessage = "Datos inválidos. Por favor, verifique la información.";
      } else if (error.response?.status === 404) {
        // Recurso no encontrado
        errorMessage = "Cliente o recurso no encontrado.";
      }

      toast.error(errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 relative">

        {/* Alerta informativa para modo compromiso */}
        {isCommitmentMode && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    {paymentType === "postponement" ? "Registro de Aplazamiento" : "Modo Compromiso de Pago"}
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {paymentType === "postponement"
                      ? "Estás registrando un aplazamiento de pago. Se guardará como PENDING con fecha de aplazamiento."
                      : "Estás registrando un compromiso de pago con fecha alternativa. No se generará boleta ya que no es un pago real, solo un registro de compromiso."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notificaciones flotantes - Solo para creación, no para edición */}
        {!payment?.id && shouldRegularize && selectedPendingPayment && (
          <RegularizationNotification
            pendingPayment={selectedPendingPayment}
            onClose={() => setShouldRegularize(false)}
          />
        )}

        {!payment?.id && pendingPostponements.length > 0 && !shouldRegularize && (
          <PendingPostponementsNotification
            postponements={pendingPostponements}
            paymentType={paymentType}
            onClose={() => setPendingPostponements([])}
          />
        )}



        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {!hideClientSelection && (
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <SearchSelectInput
                      value={field.value}
                      onChange={(value) => field.onChange(Number(value))}
                      onSearch={setClientSearchQuery}
                      options={clientOptions}
                      placeholder="Buscar por nombre, apellido o DNI..."
                      disabled={isLoading || isLoadingClients || preselectedClient !== undefined}
                      isLoading={isLoadingClients}
                      emptyMessage="No hay clientes disponibles"
                      noResultsMessage="No se encontraron clientes"
                      error={!!form.formState.errors.clientId}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Monto del Pago
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Monto = Plan Base + Reconexión (S/. 10) - Descuento</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
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
              <FormItem className="flex flex-col mt-3">
                <FormLabel>Fecha de Pago</FormLabel>
                <FormDescription className="text-xs text-muted-foreground">
                  Se permiten fechas pasadas para pagos atrasados. Múltiples pagos en la misma fecha solo se permiten para aplazamientos, reconexiones o pagos con descuentos especiales.
                </FormDescription>
                <div className="relative">
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      onClick={() => setIsPaymentDatePickerOpen(!isPaymentDatePickerOpen)}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(`${field.value}T12:00:00`), "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </FormControl>

                  {isPaymentDatePickerOpen && (
                    <div className="absolute left-0 z-[9999] mt-2 rounded-md border bg-popover p-0 shadow-lg">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(`${field.value}T12:00:00`) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // Asegurarnos de que la fecha se mantenga en UTC
                            const formattedDate = format(date, 'yyyy-MM-dd');
                            field.onChange(formattedDate);
                          } else {
                            field.onChange('');
                          }
                          setIsPaymentDatePickerOpen(false);
                        }}
                        disabled={(date) => {
                          // Permitir fechas pasadas para pagos atrasados
                          // Solo deshabilitar fechas muy antiguas (antes de 2020) y fechas futuras
                          return date < new Date("2020-01-01") || date > new Date();
                        }}
                        initialFocus
                        locale={es}
                      />
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>



        {/* Campos que se ocultan en modo compromiso */}
        {!isCommitmentMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pago</FormLabel>
                  <Select disabled={isLoading} onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PaymentTypeEnum.Enum.TRANSFER}>{getPaymentTypeLabel(PaymentTypeEnum.Enum.TRANSFER as any)}</SelectItem>
                      <SelectItem value={PaymentTypeEnum.Enum.CASH}>{getPaymentTypeLabel(PaymentTypeEnum.Enum.CASH as any)}</SelectItem>
                      <SelectItem value={PaymentTypeEnum.Enum.YAPE}>{getPaymentTypeLabel(PaymentTypeEnum.Enum.YAPE as any)}</SelectItem>
                      <SelectItem value={PaymentTypeEnum.Enum.PLIN}>{getPaymentTypeLabel(PaymentTypeEnum.Enum.PLIN as any)}</SelectItem>
                      <SelectItem value={PaymentTypeEnum.Enum.OTHER}>{getPaymentTypeLabel(PaymentTypeEnum.Enum.OTHER as any)}</SelectItem>
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
                  <FormLabel>Referencia Adicional </FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: N° de factura, orden de servicio" {...field} value={field.value || ""} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Campo de transfername - solo visible si no es modo compromiso */}
        {!isCommitmentMode && (form.watch("paymentType") === PaymentTypeEnum.Enum.TRANSFER ||
          form.watch("paymentType") === PaymentTypeEnum.Enum.YAPE ||
          form.watch("paymentType") === PaymentTypeEnum.Enum.PLIN) && (
            <FormField
              control={form.control}
              name="transfername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Nombre/Referencia de {(form.watch("paymentType") || "").charAt(0) + (form.watch("paymentType") || "").slice(1).toLowerCase()}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        form.watch("paymentType") === PaymentTypeEnum.Enum.TRANSFER
                          ? "Ej: Nombre del titular de la cuenta"
                          : "Ej: N° de Operación Yape/Plin"
                      }
                      {...field}
                      value={field.value || ""}
                      disabled={isLoading}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

        {/* Campos de descuento y reconexión - solo visibles si no es modo compromiso */}
        {!isCommitmentMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descuento (Opcional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">S/.</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10"
                        {...field}
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Si el campo está vacío, establecer a 0
                          if (value === "") {
                            field.onChange(0);
                          } else {
                            field.onChange(toFloat(value));
                          }
                        }}
                        onBlur={(e) => {
                          // Al perder el foco, formatear con 2 decimales si hay valor
                          const value = e.target.value;
                          if (value !== "") {
                            field.onChange(toFloat(value));
                          }
                        }}
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 
              🎯 CAMPO DE FECHA DE VENCIMIENTO (AUTOMÁTICA)
              
              📍 UBICACIÓN: Este campo se encuentra en el formulario de pago
              📍 ORIGEN: La fecha se calcula automáticamente en la función updateDueDate()
              📍 LÓGICA: 
                - Sin pagos previos: Usa initialPaymentDate de clientPaymentConfig
                - Con pagos previos: Suma meses al initialPaymentDate según cantidad de pagos
              
              🔧 FUNCIONAMIENTO:
              1. Se ejecuta updateDueDate() cuando se selecciona un cliente
              2. Se calcula la fecha según la lógica de pagos previos
              3. Se establece en el formulario con form.setValue("dueDate", formattedDate)
              4. Se muestra aquí en formato dd/MM/yyyy
              
              📅 EJEMPLO: Si initialPaymentDate es 17/10/2025 y hay 2 pagos previos
              - Fecha calculada: 17/12/2025 (2 meses después)
              - Se muestra en el input: "17/12/2025"
            */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Vencimiento (Automática)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          className="bg-muted/50"
                          value={field.value ? format(createDateFromString(field.value), "dd/MM/yyyy", { locale: es }) : "Sin fecha de vencimiento"}
                          disabled={true}
                          readOnly
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        )}

        {/* Campo de Estado - Solo visible cuando autoCalculateState está desactivado */}
        {!autoCalculateState && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado del Pago</FormLabel>
                  <Select disabled={isLoading} onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">{getPaymentStatusLabel(PaymentStatus.PENDING)}</SelectItem>
                      <SelectItem value="PAYMENT_DAILY">{getPaymentStatusLabel(PaymentStatus.PAYMENT_DAILY)}</SelectItem>
                      <SelectItem value="LATE_PAYMENT">{getPaymentStatusLabel(PaymentStatus.LATE_PAYMENT)}</SelectItem>
                      <SelectItem value="VOIDED">{getPaymentStatusLabel(PaymentStatus.VOIDED)}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Fecha de Compromiso - Visible cuando el estado es PENDING o cuando es un aplazamiento */}
            {(form.watch("status") === "PENDING" || paymentType === "postponement") && (
              <FormField
                control={form.control}
                name="engagementDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      {paymentType === "postponement" ? "Fecha de Aplazamiento *" : "Fecha de Compromiso"}
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          onClick={() => setIsEngagementDatePickerOpen(!isEngagementDatePickerOpen)}
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(`${field.value}T12:00:00`), "PPP", { locale: es }) : (paymentType === "postponement" ? "Seleccionar fecha de aplazamiento" : "Seleccionar fecha de compromiso")}
                        </Button>
                      </FormControl>

                      {isEngagementDatePickerOpen && (
                        <div className="absolute left-0 z-[9999] mt-2 rounded-md border bg-popover p-0 shadow-lg">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(`${field.value}T12:00:00`) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const formattedDate = format(date, 'yyyy-MM-dd');
                                field.onChange(formattedDate);
                              } else {
                                field.onChange('');
                              }
                              setIsEngagementDatePickerOpen(false);
                            }}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                            locale={es}
                          />
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {/* Switch de cálculo automático - solo visible para pagos normales */}
        {paymentType !== "postponement" && (
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-calculate-state"
              checked={autoCalculateState}
              onCheckedChange={setAutoCalculateState}
              disabled={isLoading}
            />
            <label htmlFor="auto-calculate-state" className="text-sm cursor-pointer">
              Calcular estado automáticamente basado en fechas
            </label>
          </div>
        )}

        {/* Campo de reconexión - solo visible si no es modo compromiso */}
        {!isCommitmentMode && (
          <FormField
            control={form.control}
            name="reconnection"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Cargo por Reconexión</FormLabel>
                  <FormDescription>
                    Marcar si este pago incluye un cargo por reconexión del servicio.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    aria-readonly
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>

          {/* Botón de Regularizar - Solo visible cuando hay aplazamiento pendiente */}
          {shouldRegularize && selectedPendingPayment ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    onClick={() => handleRegularize(form.getValues())}
                    disabled={isLoading || !form.watch("paymentDate") || !form.watch("paymentType") || !form.watch("reference")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? "Regularizando..." : "Regularizar Aplazamiento"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Complete fecha de pago, método de pago y referencia para regularizar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            /* Botón normal de Guardar/Actualizar - Deshabilitado si hay aplazamiento pendiente */
            <Button
              type="submit"
              disabled={isLoading || shouldRegularize}
              className={shouldRegularize ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isLoading
                ? (payment && payment.id ? "Actualizando..." : "Guardando...")
                : (payment && payment.id
                  ? `Actualizar ${paymentType === "postponement" ? "Aplazamiento" : "Pago"}`
                  : `Guardar ${paymentType === "postponement" ? "Aplazamiento" : "Pago"}`)}
            </Button>
          )}
        </div>

        {/* Botón de confirmar pago pendiente - Solo visible cuando se está editando un pago pendiente */}
        {payment?.id && payment?.status === 'PENDING' && (
          <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-yellow-800">Pago Pendiente</h4>
                <p className="text-sm text-yellow-600">
                  Este pago está marcado como pendiente.
                  {payment.engagementDate && (
                    <> Fecha de compromiso: {format(new Date(payment.engagementDate), "dd/MM/yyyy", { locale: es })}</>
                  )}
                </p>
              </div>
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  // Cambiar a modo regularización
                  setShouldRegularize(true);
                  setSelectedPendingPayment(payment);
                  // Pre-llenar fecha de pago con la fecha actual
                  form.setValue("paymentDate", format(new Date(), "yyyy-MM-dd"));
                  // Mostrar campos de regularización
                  setIsCommitmentMode(false);
                }}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Regularizar Pago
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  )
}
