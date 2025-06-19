import { Plan } from "../plans/plan";
import { Sector } from "../sectors/sector"

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    INACTIVE = 'INACTIVE'
}

export enum PaymentStatus {
    SUSPENDED = 'SUSPENDED',
    EXPIRING = 'EXPIRING',
    EXPIRED = 'EXPIRED',
    PAID = 'PAID'
}

export interface Client {
    id: number;
    name: string;
    lastName: string;
    dni: string;
    phone: string;
    address: string;
    installationDate?: string;
    reference?: string;
    referenceImage?: string | File | null;
    initialPaymentDate?: string;
    paymentDate?: string;
    advancePayment?: boolean;
    description?: string;
    routerSerial?: string;
    decoSerial?: string;
    ipAddress?: string;
    paymentStatus: PaymentStatus;
    status: AccountStatus;
    plan?: Plan;
    sector?: Sector;
}