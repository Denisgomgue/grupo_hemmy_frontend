"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

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

interface PaymentFormProps {
  payment?: Payment | null
  onSubmit: (values: PaymentFormData) => void
  isLoading?: boolean
  onCancel: () => void
}

export function PaymentForm({ payment, onSubmit, isLoading = false, onCancel }: PaymentFormProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      client: payment?.client.id || undefined,
      amount: payment?.amount ?? null,
      paymentDate: payment?.paymentDate || format(new Date(), "yyyy-MM-dd"),
      paymentType: payment?.paymentType || PaymentTypeEnum.Enum.TRANSFER,
      state: payment?.state || PaymentStatusEnum.Enum.PENDING,
      reference: payment?.reference || "",
      transfername: payment?.transfername || "",
      reconnection: payment?.reconnection || false,
      discount: payment?.discount ?? null,
      dueDate: payment?.dueDate || undefined,
    },
  })

  const watchedPaymentType = form.watch("paymentType")

  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients-minimal"],
    queryFn: async (): Promise<{ data: Client[] }> => {
      const response = await api.get<Client[]>("/client") // Asume que /client devuelve Client[] directamente
      return { data: response.data } // Envuelve para que coincida con la expectativa de { data: Client[] }
    },
  })
  const clients = clientsData?.data || []

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Row 1: Client and Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select
                  disabled={isLoading || isLoadingClients}
                  onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                  value={field.value?.toString() || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingClients ? "Cargando clientes..." : "Seleccionar cliente"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} {client.lastName} - {client.dni}
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
                        field.onChange(value === "" ? null : parseFloat(value))
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Pago</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                      disabled={isLoading}
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
                    {Object.values(PaymentTypeEnum.Enum).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()} {/* Capitalize */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Conditional: Transfer Name */}
        {(watchedPaymentType === PaymentTypeEnum.Enum.TRANSFER ||
          watchedPaymentType === PaymentTypeEnum.Enum.YAPE ||
          watchedPaymentType === PaymentTypeEnum.Enum.PLIN) && (
          <FormField
            control={form.control}
            name="transfername"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre/Referencia de {watchedPaymentType.charAt(0) + watchedPaymentType.slice(1).toLowerCase()}</FormLabel>
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Row 3: State and Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Row 4: Discount and Due Date */}
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
                      value={field.value === null || field.value === undefined ? "" : String(field.value)}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? null : parseFloat(value))
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
                <FormLabel>Fecha de Vencimiento (Opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : undefined)}
                      disabled={isLoading}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 5: Reconnection */}
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

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (payment ? "Actualizando..." : "Guardando...") : (payment ? "Actualizar Pago" : "Guardar Pago")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
