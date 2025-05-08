import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PaymentStatus } from "@/types/payments/payment"

interface PaymentStatusBadgeProps {
  status: PaymentStatus
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return {
          label: "Pagado",
          variant: "success" as const,
          className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        }
      case "PENDING":
        return {
          label: "Pendiente",
          variant: "warning" as const,
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        }
      case "LATE":
        return {
          label: "Atrasado",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
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
    <Badge variant={config.variant} className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
