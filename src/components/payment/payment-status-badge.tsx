import { getPaymentStatusLabel } from "@/utils/payment-status-labels"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PaymentStatus } from "@/types/payments/payment"

interface PaymentStatusBadgeProps {
  status: PaymentStatus
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case "PAYMENT_DAILY":
        return {
          label: getPaymentStatusLabel(status),
          variant: "success" as const,
          className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-fit",
        }
      case "PENDING":
        return {
          label: getPaymentStatusLabel(status),
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 w-fit",
        }
      case "LATE_PAYMENT":
        return {
          label: getPaymentStatusLabel(status),
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 w-fit",
        }
      case "VOIDED":
        return {
          label: getPaymentStatusLabel(status),
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 w-fit",
        }
      default:
        return {
          label: "Desconocido",
          variant: "outline" as const,
          className: "",
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant as "success" | "destructive" | "outline" | "default" | "secondary" | "blue"} className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
