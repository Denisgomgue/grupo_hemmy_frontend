export enum ServiceStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}


export interface Service {
    id: number;
    status: ServiceStatus;
    name: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}