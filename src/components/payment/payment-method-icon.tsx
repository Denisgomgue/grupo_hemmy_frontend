import { CreditCard, DollarSign, Landmark, HelpCircle } from "lucide-react"
import type { PaymentMethod } from "@/types/payments/payment"

interface PaymentMethodIconProps {
  method: PaymentMethod
  className?: string
}

export function PaymentMethodIcon({ method, className }: PaymentMethodIconProps) {
  switch (method) {
    case "CASH":
      return <DollarSign className={className} />
    case "TRANSFER":
      return <Landmark className={className} />
    case "CARD":
      return <CreditCard className={className} />
    default:
      return <HelpCircle className={className} />
  }
}
