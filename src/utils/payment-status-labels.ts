import { PaymentStatus } from "@/types/payments/payment"

export const paymentStatusLabels: Record<PaymentStatus, string> = {
    [ PaymentStatus.PAYMENT_DAILY ]: "Pagado",
    [ PaymentStatus.PENDING ]: "Pendiente",
    [ PaymentStatus.LATE_PAYMENT ]: "Atrasado",
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
    return paymentStatusLabels[ status ] || "Desconocido"
} 