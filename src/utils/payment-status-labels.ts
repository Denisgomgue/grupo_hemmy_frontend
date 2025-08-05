import { PaymentStatus } from "@/types/payments/payment"

export const paymentStatusLabels: Record<PaymentStatus, string> = {
    [ PaymentStatus.PENDING ]: "Pendiente",
    [ PaymentStatus.PAYMENT_DAILY ]: "Al día",
    [ PaymentStatus.LATE_PAYMENT ]: "Atrasado",
    [ PaymentStatus.VOIDED ]: "Anulado",
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
    return paymentStatusLabels[ status ] || "Desconocido"
} 