"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { InfoCardShell } from "@/components/info-card-shell"
import { PaymentStatusBadge } from "@/components/payment/payment-status-badge"
import { PaymentMethodIcon } from "@/components/payment/payment-method-icon"
import type { Payment, PaymentType } from "@/types/payments/payment"
import { PaymentActionsDropdown } from "./payment-actions-dropdown"

interface PaymentCardProps {
  payment: Payment
  onEdit: (payment: Payment) => void
  onDelete?: (paymentId: string) => void
  onViewDetails?: (payment: Payment) => void
}

export function PaymentCard({ payment, onEdit, onDelete, onViewDetails }: PaymentCardProps) {
  const formattedAmount = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(payment.amount)

  const formattedDate = format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: es })

  const methodLabels: Record<string, string> = {
    CASH: "Efectivo",
    TRANSFER: "Transferencia",
    CARD: "Tarjeta",
    OTHER: "Otro",
  }

  const formattedId = `PAG-${payment.id.toString().padStart(4, "0")}`

  return (
    <InfoCardShell
      topSection={
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="font-semibold">
              {payment.client.name} {payment.client.lastName}
            </div>
            <div className="text-sm text-muted-foreground">({payment.client.dni})</div>
          </div>
          <PaymentActionsDropdown payment={payment} onEdit={onEdit} onDelete={onDelete} onViewDetails={onViewDetails} />
        </div>
      }
      middleSection={
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-muted-foreground">Monto</div>
            <div className="font-medium">{formattedAmount}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Fecha</div>
            <div>{formattedDate}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Método</div>
            <div className="flex items-center gap-2">
              <PaymentMethodIcon method={payment.paymentType as PaymentType} className="h-4 w-4" />
              <span>{methodLabels[payment.paymentType as string]}</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Estado</div>
            <PaymentStatusBadge status={payment.state} />
          </div>
        </div>
      }
      bottomSection={
        <div>
          <div className="text-sm text-muted-foreground">Código / Referencia</div>
          <div className="font-medium">{formattedId}</div>
          {payment.reference && <div className="text-sm text-muted-foreground">{payment.reference}</div>}
        </div>
      }
    />
  )
}
