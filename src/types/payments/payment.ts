import { string } from "zod";
import { Client } from "../clients/client";
import { Plan } from "../plans/plan";
import { Sector } from "../sectors/sector"

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAYMENT_DAILY = 'PAYMENT_DAILY',
    LATE_PAYMENT = 'LATE_PAYMENT'
}

export enum PaymentType {
    TRANSFER = 'TRANSFER',
    CASH = 'CASH',
    YAPE = 'YAPE',
    PLIN = 'PLIN'
}

export interface Payment {
    id: number;
    paymentDate: string;
    transfername: string;
    reference: string;
    reconnection: boolean;
    amount: number;
    state: PaymentStatus;
    paymentType?: PaymentType;
    discount: number;
    dueDate?: Date;
    client: Client;
    sector: Sector;
    created_At: Date;
    updated_At: Date;
}
