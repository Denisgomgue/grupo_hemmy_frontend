"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { PaymentSchema, type PaymentFormData, PaymentTypeEnum, PaymentStatusEnum } from "@/schemas/payment-schema"
import api from "@/lib/axios"
import type { Client } from "@/types/clients/client"
import type { Payment } from "@/types/payments/payment"
import { getPaymentTypeLabel } from "@/utils/payment-type-labels"

interface PaymentFormProps {
  payment?: Payment | null
  onSubmit: (values: PaymentFormData) => void
  isLoading?: boolean
  onCancel: () => void
}

export function PaymentForm({ payment, onSubmit, isLoading = false, onCancel }: PaymentFormProps) {
  const [ autoCalculateState, setAutoCalculateState ] = useState(true)
  const [ isPaymentDatePickerOpen, setIsPaymentDatePickerOpen ] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      client: payment?.client.id || undefined,
      amount: (payment?.amount !== undefined && payment?.amount !== null && !isNaN(parseFloat(String(payment.amount))))
        ? parseFloat(String(payment.amount))
        : 0,
      paymentDate: payment?.paymentDate || "",
      paymentType: payment?.paymentType || PaymentTypeEnum.Enum.TRANSFER,
      state: payment?.state || PaymentStatusEnum.Enum.PENDING,
      reference: payment?.reference || "",
      transfername: payment?.transfername || "",
      reconnection: payment?.reconnection || false,
      discount: payment?.discount ?? 0,
      dueDate: payment?.dueDate || format(new Date(), "yyyy-MM-dd")
    },
  })

  const watchedPaymentType = form.watch("paymentType")
  const watchedPaymentDate = form.watch("paymentDate")
  const watchedDueDate = form.watch("dueDate")
  const watchedClient = form.watch("client")

  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: [ "clients-minimal" ],
    queryFn: async (): Promise<{ data: Client[] }> => {
      const response = await api.get<Client[]>("/client") // Asume que /client devuelve Client[] directamente
      return { data: response.data } // Envuelve para que coincida con la expectativa de { data: Client[] }
    },
  })
  const clients = clientsData?.data || []

  // Actualizar fecha de vencimiento cuando se selecciona un cliente
  useEffect(() => {
    if (watchedClient && clients.length > 0) {
      const selectedClient = clients.find(client => client.id === watchedClient);
      if (selectedClient && selectedClient.paymentDate) {
        // Usar la fecha de pago del cliente como fecha de vencimiento
        form.setValue("dueDate", format(new Date(selectedClient.paymentDate), "yyyy-MM-dd"));
      }
    }
  }, [ watchedClient, clients, form ]);

  // Limpiar transfername cuando se cambia a un método de pago que no lo requiere
  useEffect(() => {
    const requiresTransferName =
      watchedPaymentType === PaymentTypeEnum.Enum.TRANSFER ||
      watchedPaymentType === PaymentTypeEnum.Enum.YAPE ||
      watchedPaymentType === PaymentTypeEnum.Enum.PLIN;

    if (!requiresTransferName) {
      form.setValue('transfername', '');
      form.clearErrors('transfername');
    }
  }, [ watchedPaymentType, form ]);

  // Calcular automáticamente el estado del pago
  useEffect(() => {
    if (!autoCalculateState) return;

    const calculatePaymentState = () => {
      const dueDate = watchedDueDate ? new Date(watchedDueDate) : null;
      const paymentDate = watchedPaymentDate ? new Date(watchedPaymentDate) : null;
      const today = new Date();

      // Si no hay fecha de vencimiento, mantener como pendiente
      if (!dueDate) {
        // form.setValue("state", PaymentStatusEnum.Enum.PENDING);
        return;
      }

      // Si hay fecha de pago
      if (paymentDate) {
        if (paymentDate > dueDate) {
          // form.setValue("state", PaymentStatusEnum.Enum.LATE_PAYMENT);
        } else {
          // form.setValue("state", PaymentStatusEnum.Enum.PAYMENT_DAILY);
        }
      }
      // Si no hay fecha de pago
      else {
        if (today > dueDate) {
          // form.setValue("state", PaymentStatusEnum.Enum.LATE_PAYMENT);
        } else {
          // form.setValue("state", PaymentStatusEnum.Enum.PENDING);
        }
      }
    };

    calculatePaymentState();
  }, [ watchedPaymentDate, watchedDueDate, form, autoCalculateState ]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Row 1: Client and Amount */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select disabled={isLoading} onValueChange={field.onChange} value={field.value?.toString() || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
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
                      value={field.value === null || field.value === undefined ? "" : String(field.value)}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? 0 : parseFloat(value))
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

        {/* Row 2: Payment Date and Payment Type */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Pago</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="date"
                      {...field}
                      value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
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
                    <SelectItem value={PaymentTypeEnum.Enum.CASH}>Efectivo</SelectItem>
                    <SelectItem value={PaymentTypeEnum.Enum.TRANSFER}>Transferencia</SelectItem>
                    <SelectItem value={PaymentTypeEnum.Enum.YAPE}>Yape</SelectItem>
                    <SelectItem value={PaymentTypeEnum.Enum.PLIN}>Plin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Transfer Name */}
        {(watchedPaymentType === PaymentTypeEnum.Enum.TRANSFER ||
          watchedPaymentType === PaymentTypeEnum.Enum.YAPE ||
          watchedPaymentType === PaymentTypeEnum.Enum.PLIN) && (
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="transfername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre/Referencia de Transfer</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Nombre del titular de la cuenta"
                      {...field}
                      value={field.value || ""}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Row 4: State and Reference */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="state"
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
                    <SelectItem value={PaymentStatusEnum.Enum.PENDING}>Pendiente</SelectItem>
                    <SelectItem value={PaymentStatusEnum.Enum.PAYMENT_DAILY}>Pagado</SelectItem>
                    <SelectItem value={PaymentStatusEnum.Enum.LATE_PAYMENT}>Atrasado</SelectItem>
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
                <FormLabel>Referencia Adicional (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: N° de factura, orden de servicio" {...field} value={field.value || ""} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 5: Discount and Due Date */}
        <div className="grid grid-cols-2 gap-6">
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
                      value={field.value === null || field.value === undefined ? "" : String(field.value)}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? 0 : parseFloat(value))
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
                      value={field.value ? format(new Date(field.value), "dd/MM/yyyy") : "Sin fecha de vencimiento"}
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

        {/* Opción para cálculo automático del estado */}
        <div className="flex items-center space-x-2 py-2">
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

        {/* Row 6: Reconnection */}
        <FormField
          control={form.control}
          name="reconnection"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
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

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6">
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
