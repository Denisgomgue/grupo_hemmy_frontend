import { Payment } from "../payments/payment";
import { Installation } from "../installations/installation";
import { Device } from "../devices/device";
import { Plan } from "../plans/plan";
import { Sector } from "../sectors/sector";

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    INACTIVE = 'INACTIVE'
}

export enum PaymentStatus {
    SUSPENDED = 'SUSPENDED',
    EXPIRED = 'EXPIRED',
    EXPIRING = 'EXPIRING',
    PAID = 'PAID'
}

export interface Client {
    id: number;
    name?: string;
    lastName?: string;
    dni: string;
    phone?: string;
    address?: string;
    description?: string;
    birthdate?: Date;
    status: AccountStatus;
    
    // Campos de instalación (para formulario unificado)
    installationDate?: string;
    reference?: string;
    ipAddress?: string;
    referenceImage?: string;
    plan?: Plan;
    sector?: Sector;
    
    // Campos de pago (para formulario unificado)
    paymentDate?: string;
    advancePayment?: boolean;
    paymentStatus?: PaymentStatus;
    
    // Campos de dispositivos (para formulario unificado)
    routerSerial?: string;
    decoSerial?: string;
    
    // Relaciones
    payments?: Payment[];
    installations?: Installation[];
    devices?: Device[];
    created_at: Date;
    updated_at: Date;
}