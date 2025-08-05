import { Client } from "../clients/client"
import { Plan } from "../plans/plan"
import { Service } from "../services/service"

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAYMENT_DAILY = 'PAYMENT_DAILY',
    LATE_PAYMENT = 'LATE_PAYMENT',
    VOIDED = 'VOIDED'
}

export enum PaymentType {
    TRANSFER = 'TRANSFER',
    CASH = 'CASH',
    YAPE = 'YAPE',
    PLIN = 'PLIN',
    OTHER = 'OTHER'
}

export interface Payment {
    id: number;
    code: string;
    paymentDate?: string;
    reference?: string;
    reconnection: boolean;
    amount: number;
    baseAmount: number;
    reconnectionFee: number;
    status: PaymentStatus; // Cambiado de 'state' a 'status' para coincidir con el backend
    paymentType?: PaymentType;
    transfername?: string; // Cambiado de 'transferName' a 'transfername' para coincidir con el backend
    discount?: number;
    dueDate?: string;
    isVoided: boolean;
    voidedAt?: string;
    voidedReason?: string;
    engagementDate?: string;
    client?: Client;
    clientId?: number;
    // Información del plan y servicio actual del cliente
    currentPlan?: Plan;
    currentService?: Service;
    // Información del plan anterior (para cambios de plan)
    previousPlan?: Plan;
    previousService?: Service;
    // Indicador de cambio de plan
    isPlanChange?: boolean;
    created_at: Date;
    updated_at: Date;
    advancePayment?: boolean;
    // Campo adicional para mostrar el estado en español
    stateInSpanish?: string;
}
