import { Client } from "../clients/client";


export enum PaymentStatus {
    PENDING = 'PENDING',
    PAYMENT_DAILY = 'PAYMENT_DAILY',
    LATE_PAYMENT = 'LATE_PAYMENT'
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
    paymentDate: string;
    reference: string;
    reconnection: boolean;
    amount: number;
    state: PaymentStatus;
    paymentType: PaymentType;
    transfername?: string;
    discount?: number;
    dueDate?: string;
    client: Client;
    created_At: string;
    updated_At: string;
}
