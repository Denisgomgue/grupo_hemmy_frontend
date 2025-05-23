import { PaymentStatus } from "@/types/clients/client"

export const clientPaymentStatusLabels: Record<PaymentStatus, string> = {
    [ PaymentStatus.PAID ]: "Pagado",
    [ PaymentStatus.EXPIRING ]: "Por vencer",
    [ PaymentStatus.SUSPENDED ]: "Suspendido",
    [ PaymentStatus.EXPIRED ]: "Vencido"
}

export function getClientPaymentStatusLabel(status: PaymentStatus): string {
    return clientPaymentStatusLabels[ status ] || "Desconocido"
} 