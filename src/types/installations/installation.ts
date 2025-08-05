import { Plan } from "../plans/plan";
import { Sector } from "../sectors/sector";
import { Device } from "../devices/device";
import { ClientPaymentConfig } from "../client-payment-configs/client-payment-config";


export interface Installation {
    id: number;
    clientId: number;
    installationDate: Date;
    reference?: string;
    ipAddress?: string;
    referenceImage?: string;
    plan: Plan;
    sector: Sector;
    devices?: Device[];
    paymentConfig?: ClientPaymentConfig;
    created_at: Date;
    updated_at: Date;
} 