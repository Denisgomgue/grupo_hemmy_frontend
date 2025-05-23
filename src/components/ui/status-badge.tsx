import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PaymentStatus as ClientPaymentStatus } from "@/types/clients/client";
import { PaymentStatus as PaymentPaymentStatus } from "@/types/payments/payment";
import { getPaymentStatusLabel } from "@/utils/payment-status-labels"

type StatusTypes = ClientPaymentStatus | PaymentPaymentStatus | string;

interface StatusBadgeProps {
  status: StatusTypes;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: StatusTypes) => {
    // Cliente PaymentStatus
    if (status === "SUSPENDED") {
      return {
        label: "Suspendido",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      };
    }
    if (status === "EXPIRING") {
      return {
        label: "Por Vencer",
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      };
    }
    if (status === "EXPIRED") {
      return {
        label: "Vencido",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      };
    }
    if (status === "PAID") {
      return {
        label: "Pagado",
        variant: "success" as const,
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      };
    }

    // Payment PaymentStatus
    if (status === "PAYMENT_DAILY" || status === "PENDING" || status === "LATE_PAYMENT") {
      return {
        label: getPaymentStatusLabel(status as PaymentPaymentStatus),
        variant: status === "PAYMENT_DAILY" ? "success" : status === "PENDING" ? "secondary" : "destructive",
        className:
          status === "PAYMENT_DAILY"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
            : status === "PENDING"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      }
    }

    // Default case
    return {
      label: status || "Desconocido",
      variant: "outline" as const,
      className: "",
    };
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant as "success" | "destructive" | "outline" | "default" | "secondary" | "blue"}
      className={cn("font-medium", config.className)}
    >
      {config.label}
    </Badge>
  );
} 