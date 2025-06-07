"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Search } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { cn, toFloat } from "@/lib/utils"
import { PaymentSchema, type PaymentFormData, PaymentTypeEnum } from "@/schemas/payment-schema"
import api from "@/lib/axios"
import type { Client } from "@/types/clients/client"
import type { Payment } from "@/types/payments/payment"
import { getPaymentTypeLabel } from "@/utils/payment-type-labels"
import { toast } from "sonner"

interface PaymentFormProps {
  payment?: Payment | null
  onSubmit: (values: PaymentFormData) => void
  isLoading?: boolean
  onCancel: () => void
  preselectedClient?: Client
  hideClientSelection?: boolean
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
  hideClientSelection = false
}: PaymentFormProps) {
  const [ autoCalculateState, setAutoCalculateState ] = useState(true);
  const [ isPaymentDatePickerOpen, setIsPaymentDatePickerOpen ] = useState(false);

  // Query para obtener clientes
  const { data: clientsResponse, isLoading: isLoadingClients } = useQuery<{ data: ClientMinimal[]; total: number }>({
    queryKey: [ 'clients' ],
    queryFn: async () => {
      try {
        const response = await api.get('/client', {
          params: {
            minimal: true,
            limit: 100
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

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      client: payment?.client?.id || preselectedClient?.id,
      amount: toFloat(payment?.amount || 0),
      paymentDate: payment?.paymentDate ? format(new Date(payment.paymentDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      paymentType: payment?.paymentType || PaymentTypeEnum.Enum.TRANSFER,
      reference: payment?.reference || "",
      transfername: payment?.transfername || "",
      reconnection: payment?.reconnection || false,
      discount: toFloat(payment?.discount || 0),
      dueDate: payment?.dueDate ? format(new Date(payment.dueDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
    },
  });

  const watchedPaymentType = form.watch("paymentType");
  const watchedClient = form.watch("client");
  const watchedReconnection = form.watch("reconnection");
  const watchedDiscount = form.watch("discount");

  // Efecto para actualizar fecha de vencimiento
  useEffect(() => {
    const updateDueDate = async () => {
      if (!watchedClient) return;

      try {
        const response = await api.get(`/client/${watchedClient}`);
        const client = response.data;

        if (client.paymentDate || client.initialPaymentDate) {
          const baseDate = client.paymentDate ? new Date(client.paymentDate) : new Date(client.initialPaymentDate);
          baseDate.setUTCHours(5, 0, 0, 0);
          const formattedDate = format(baseDate, "yyyy-MM-dd");
          form.setValue("dueDate", formattedDate);
        }
      } catch (error) {
        console.error('Error al obtener fecha de pago:', error);
      }
    };

    updateDueDate();
  }, [ watchedClient ]);

  // Efecto para actualizar el monto cuando se selecciona un cliente
  useEffect(() => {
    const selectedClient = clients.find(client => client.id === Number(watchedClient));
    if (selectedClient?.plan?.price) {
      const baseAmount = toFloat(selectedClient.plan.price);
      const reconnectionFee = watchedReconnection ? 10 : 0;
      const discount = toFloat(watchedDiscount || 0);
      const totalAmount = toFloat(baseAmount + reconnectionFee - discount);
      form.setValue("amount", totalAmount);
    }
  }, [ watchedClient, watchedReconnection, watchedDiscount, clients ]);

  const handleSubmit = async (values: PaymentFormData) => {
    try {
      await onSubmit(values);
      toast.success(
        payment?.id
          ? "El pago se ha actualizado correctamente"
          : "El pago se ha registrado correctamente"
      );
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast.error(
        "Hubo un problema al procesar el pago. Por favor, intente nuevamente."
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!hideClientSelection && (
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    disabled={isLoading || isLoadingClients || preselectedClient !== undefined}
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                    }}
                    value={field.value ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente">
                          {field.value && (preselectedClient || clients.length > 0) ? (() => {
                            if (preselectedClient) {
                              return `${preselectedClient.name} ${preselectedClient.lastName}`;
                            }
                            const selectedClient = clients.find(c => c.id === field.value);
                            return selectedClient
                              ? `${selectedClient.name} ${selectedClient.lastName}`
                              : "Seleccionar cliente";
                          })() : "Seleccionar cliente"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem
                          key={client.id}
                          value={client.id.toString()}
                          className={'hover:bg-slate-200 cursor-pointer'}
                        >
                          {client.name} {client.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Pago</FormLabel>
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
                    <div className="absolute left-0 z-50 mt-2 rounded-md border bg-popover p-0 shadow-md">
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
        </div>

        {(watchedPaymentType === PaymentTypeEnum.Enum.TRANSFER ||
          watchedPaymentType === PaymentTypeEnum.Enum.YAPE ||
          watchedPaymentType === PaymentTypeEnum.Enum.PLIN) && (
            <FormField
              control={form.control}
              name="transfername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Nombre/Referencia de {watchedPaymentType.charAt(0) + watchedPaymentType.slice(1).toLowerCase()}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        watchedPaymentType === PaymentTypeEnum.Enum.TRANSFER
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Vencimiento (Automática)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      className="bg-muted/50"
                      value={field.value ? format(new Date(field.value), "dd/MM/yyyy", { locale: es }) : "Sin fecha de vencimiento"}
                      disabled={true}
                      readOnly
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Esta fecha se toma automáticamente del próximo pago programado del cliente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? (payment && payment.id ? "Actualizando..." : "Guardando...")
              : (payment && payment.id ? "Actualizar Pago" : "Guardar Pago")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
