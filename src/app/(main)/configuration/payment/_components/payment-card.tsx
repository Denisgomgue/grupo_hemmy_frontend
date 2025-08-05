"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { InfoCardShell } from "@/components/info-card-shell"
import { PaymentStatusBadge } from "@/components/payment/payment-status-badge"
import { PaymentMethodIcon } from "@/components/payment/payment-method-icon"
import type { Payment, PaymentType } from "@/types/payments/payment"
import { PaymentActionsDropdown } from "./payment-actions-dropdown"
import { Button } from "@/components/ui/button"

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

  const formattedPaymentDate = payment.paymentDate
    ? format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: es })
    : "No pagado"

  const formattedDueDate = payment.dueDate
    ? format(new Date(payment.dueDate), "dd/MM/yyyy", { locale: es })
    : "No definida"

  const methodLabels: Record<string, string> = {
    CASH: "Efectivo",
    TRANSFER: "Transferencia",
    YAPE: "Yape",
    PLIN: "Plin",
    OTHER: "Otro",
  }

  const formattedId = payment.code || `PAG-${payment.id.toString().padStart(4, "0")}`

  return (
    <InfoCardShell
      topSection={
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto hover:bg-transparent hover:text-purple-600 font-semibold text-left underline decoration-dotted underline-offset-4"
              onClick={() => onViewDetails?.(payment)}
            >
              {payment.client?.name} {payment.client?.lastName}
            </Button>
          </div>
          <PaymentActionsDropdown payment={payment} onEdit={onEdit} onDelete={onDelete} />
        </div>
      }
      middleSection={
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-muted-foreground">Monto</div>
            <div className="font-medium">{formattedAmount}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Fecha Pago</div>
            <div>{formattedPaymentDate}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Fecha Vencimiento</div>
            <div>{formattedDueDate}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Método</div>
            <div className="flex items-center gap-2">
              {payment.paymentType ? (
                <>
                  <PaymentMethodIcon method={payment.paymentType as PaymentType} className="h-4 w-4" />
                  <span>{methodLabels[ payment.paymentType as string ]}</span>
                </>
              ) : (
                <span className="text-muted-foreground">No definido</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Estado</div>
            <PaymentStatusBadge status={payment.status} />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Reconexión</div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${payment.reconnection
              ? "bg-orange-100 text-orange-800"
              : "bg-gray-100 text-gray-800"
              }`}>
              {payment.reconnection ? "Sí" : "No"}
            </div>
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
