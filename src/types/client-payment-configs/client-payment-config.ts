import { Installation } from "../installations/installation";

export enum PaymentStatus {
    SUSPENDED = 'SUSPENDED',
    EXPIRED = 'EXPIRED',
    EXPIRING = 'EXPIRING',
    PAID = 'PAID'
}

export interface ClientPaymentConfig {
    id: number;
    initialPaymentDate?: Date;
    installationId: number;
    advancePayment: boolean;
    paymentStatus: PaymentStatus;
    Installation?: Installation;
    created_at: Date;
    updated_at: Date;
} 