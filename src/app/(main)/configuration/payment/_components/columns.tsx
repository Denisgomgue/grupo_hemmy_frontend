"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { ColumnDef } from "@tanstack/react-table"
import type { Payment, PaymentType } from "@/types/payments/payment"
import { PaymentStatusBadge } from "@/components/payment/payment-status-badge"
import { PaymentMethodIcon } from "@/components/payment/payment-method-icon"
import { Button } from "@/components/ui/button"

// Función para crear las columnas con el onClick handler
export const createBaseColumns = (onPaymentClick: (payment: Payment) => void): ColumnDef<Payment>[] => [
  {
    accessorKey: "client",
    header: "Cliente",
    cell: ({ row }) => {
      const client = row.original.client
      if (!client) {
        return <div className="text-muted-foreground">Cliente no disponible</div>
      }
      return (
        <div className="flex items-center justify-between gap-2 row">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent hover:text-purple-600 font-medium text-left underline decoration-dotted underline-offset-4"
            onClick={() => onPaymentClick(row.original)}
          >
            {client.name} {client.lastName}
          </Button>
          <PaymentStatusBadge status={row.original.status} />
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "paymentDate",
    header: "Fecha Pago",
    cell: ({ row }) => {
      const date = row.getValue("paymentDate") as string
      if (!date) return <div className="text-muted-foreground">No pagado</div>
      return <div>{format(new Date(date), "dd/MM/yyyy", { locale: es })}</div>
    },
  },
  {
    accessorKey: "dueDate",
    header: "Fecha Vencimiento",
    cell: ({ row }) => {
      const date = row.getValue("dueDate") as string
      if (!date) return <div className="text-muted-foreground">No definida</div>
      return <div>{format(new Date(date), "dd/MM/yyyy", { locale: es })}</div>
    },
  },
  {
    accessorKey: "paymentType",
    header: "Método",
    cell: ({ row }) => {
      const paymentType = row.getValue("paymentType") as string
      if (!paymentType) return <div className="text-muted-foreground">No definido</div>
      const methodLabels: Record<string, string> = {
        TRANSFER: "Transferencia",
        CASH: "Efectivo",
        YAPE: "Yape",
        PLIN: "Plin",
        OTHER: "Otro",
      }
      return (
        <div className="flex items-center gap-2">
          <PaymentMethodIcon method={paymentType as PaymentType} className="h-4 w-4" />
          <span>{methodLabels[ paymentType ] || paymentType}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "reference",
    header: "Código / Referencia",
    cell: ({ row }) => {
      const reference = row.getValue("reference") as string
      const code = row.original.code

      return (
        <div>
          <div className="font-medium">{code}</div>
          {reference && <div className="text-sm text-muted-foreground">{reference}</div>}
        </div>
      )
    },
  },
  {
    accessorKey: "reconnection",
    header: "Reconexión",
    cell: ({ row }) => {
      const reconnection = row.getValue("reconnection") as boolean
      return (
        <div className={`px-2 py-1 rounded-full text-xs font-medium w-md text-center ${reconnection
          ? "bg-orange-100 text-orange-800"
          : "bg-gray-100 text-gray-800"
          }`}>
          {reconnection ? "Sí" : "No"}
        </div>
      )
    },
  },
]

// Mantener la exportación original para compatibilidad
export const baseColumns = createBaseColumns(() => { })
