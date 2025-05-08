import type { Header } from "@/components/dataTable/card-table"
import type { Payment } from "@/types/payments/payment"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PaymentStatusBadge } from "@/components/payment/payment-status-badge"
import { PaymentMethodIcon } from "@/components/payment/payment-method-icon"

export const headers: Header[] = [
  {
    label: "Cliente",
    key: "client",
    render: (value: any) => (
      <div>
        <div className="font-medium">
          {value.name} {value.lastName}
        </div>
        <div className="text-sm text-muted-foreground">{value.dni}</div>
      </div>
    ),
  },
  {
    label: "Monto",
    key: "amount",
    render: (value: number) => {
      const formatted = new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
      }).format(value)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    label: "Fecha de Pago",
    key: "paymentDate",
    render: (value: string) => format(new Date(value), "dd/MM/yyyy", { locale: es }),
  },
  {
    label: "Método",
    key: "method",
    render: (value: string, item: Payment) => {
      const methodLabels: Record<string, string> = {
        CASH: "Efectivo",
        TRANSFER: "Transferencia",
        CARD: "Tarjeta",
        OTHER: "Otro",
      }
      return (
        <div className="flex items-center gap-2">
          <PaymentMethodIcon method={item.method} className="h-4 w-4" />
          <span>{methodLabels[value] || value}</span>
        </div>
      )
    },
  },
  {
    label: "Estado",
    key: "status",
    render: (value: string, item: Payment) => <PaymentStatusBadge status={item.status} />,
  },
  {
    label: "Código / Referencia",
    key: "reference",
    render: (value: string, item: Payment) => {
      const formattedId = `PAG-${item.id.toString().padStart(4, "0")}`
      return (
        <div>
          <div className="font-medium">{formattedId}</div>
          {value && <div className="text-sm text-muted-foreground">{value}</div>}
        </div>
      )
    },
  },
]
