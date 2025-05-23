import { PaymentType } from "@/types/payments/payment"

export const paymentTypeLabels: Record<PaymentType, string> = {
    [ PaymentType.TRANSFER ]: "Transferencia",
    [ PaymentType.CASH ]: "Efectivo",
    [ PaymentType.YAPE ]: "Yape",
    [ PaymentType.PLIN ]: "Plin",
    [ PaymentType.OTHER ]: "Otro",
}

export function getPaymentTypeLabel(type: PaymentType): string {
    return paymentTypeLabels[ type ] || "Desconocido"
} 