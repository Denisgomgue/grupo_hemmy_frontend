"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { ColumnDef } from "@tanstack/react-table"
import type { Payment, PaymentType } from "@/types/payments/payment"
import { PaymentStatusBadge } from "@/components/payment/payment-status-badge"
import { PaymentMethodIcon } from "@/components/payment/payment-method-icon"

export const baseColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "client",
    header: "Cliente",
    cell: ({ row }) => {
      const client = row.original.client
      return (
        <div>
          <div className="font-medium">
            {client.name} {client.lastName}
          </div>
          <div className="text-sm text-muted-foreground">{client.dni}</div>
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
      return <div>{format(new Date(date), "dd/MM/yyyy", { locale: es })}</div>
    },
  },
  {
    accessorKey: "paymentType",
    header: "Método",
    cell: ({ row }) => {
      const paymentType = row.getValue("paymentType") as string
      const methodLabels: Record<string, string> = {
        TRANSFER: "Transferencia",
        CASH: "Efectivo",
        YAPE: "Yape",
        PLIN: "Plin",
      }
      return (
        <div className="flex items-center gap-2">
          <PaymentMethodIcon method={paymentType as PaymentType} className="h-4 w-4" />
          <span>{methodLabels[paymentType] || paymentType}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => <PaymentStatusBadge status={row.original.state} />,
  },
  {
    accessorKey: "reference",
    header: "Código / Referencia",
    cell: ({ row }) => {
      const reference = row.getValue("reference") as string
      const id = row.original.id
      const formattedId = `PAG-${id.toString().padStart(4, "0")}`

      return (
        <div>
          <div className="font-medium">{formattedId}</div>
          {reference && <div className="text-sm text-muted-foreground">{reference}</div>}
        </div>
      )
    },
  },
]
