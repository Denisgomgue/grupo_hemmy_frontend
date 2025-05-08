import { Plan } from "../plans/plan";
import { Sector } from "../sectors/sector"

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    INACTIVE = 'INACTIVE'
}

export interface Client {
    id: number;
    name: string;
    lastName: string;
    dni: string;
    phone: string;
    address: string;
    installationDate: string;
    reference: string;
    paymentDate: string;
    advancePayment: boolean;
    status: AccountStatus;
    description: string;    
    plan: Plan;
    sector: Sector;
}