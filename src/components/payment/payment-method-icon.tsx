import { CreditCard, DollarSign, Landmark, HelpCircle } from "lucide-react"
import type { PaymentType } from "@/types/payments/payment"

interface PaymentMethodIconProps {
  method: PaymentType
  className?: string
}

export function PaymentMethodIcon({ method, className }: PaymentMethodIconProps) {
  switch (method) {
    case "CASH":
      return <DollarSign className={className} />
    case "TRANSFER":
      return <Landmark className={className} />
    case "YAPE":
      return <CreditCard className={className} />
    case "PLIN":
      return <CreditCard className={className} />
    default:
      return <HelpCircle className={className} />
  }
}
