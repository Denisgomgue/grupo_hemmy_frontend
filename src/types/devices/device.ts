export interface Device {
    id: number;
    serialNumber?: string;
    macAddress?: string;
    type: DeviceType;
    brand?: string;
    model?: string;
    status: DeviceStatus;
    assignedDate?: Date;
    useType: DeviceUseType;
    assignedInstallationId?: number;
    assignedEmployeeId?: number;
    assignedClientId?: number;
    notes?: string;
    created_at: Date;
    updated_at: Date;
    // Relaciones
    installation?: any;
    employee?: any;
    client?: any;
}

export enum DeviceType {
    ROUTER = 'router',
    DECO = 'deco',
    ONT = 'ont',
    SWITCH = 'switch',
    LAPTOP = 'laptop',
    CRIMPADORA = 'crimpadora',
    TESTER = 'tester',
    ANTENA = 'antena',
    FIBRA = 'fibra',
    CONECTOR = 'conector',
    OTRO = 'otro'
}

export enum DeviceStatus {
    STOCK = 'STOCK',
    ASSIGNED = 'ASSIGNED',
    SOLD = 'SOLD',
    MAINTENANCE = 'MAINTENANCE',
    LOST = 'LOST',
    USED = 'USED'
}

export enum DeviceUseType {
    CLIENT = 'CLIENT',
    EMPLOYEE = 'EMPLOYEE',
    COMPANY = 'COMPANY',
    CONSUMABLE = 'CONSUMABLE'
}

// Constantes para el formulario
export const DEVICE_TYPES = Object.values(DeviceType);
export const DEVICE_STATUS = Object.values(DeviceStatus);
export const DEVICE_USE_TYPES = Object.values(DeviceUseType);

export interface CreateDeviceDto {
    serialNumber: string;
    macAddress?: string;
    type: DeviceType;
    brand?: string;
    model?: string;
    status: DeviceStatus;
    assignedDate?: string;
    useType: DeviceUseType;
    notes?: string;
    assignedInstallationId?: number;
    assignedEmployeeId?: number;
    assignedClientId?: number;
}

export interface UpdateDeviceDto extends Partial<CreateDeviceDto> { }

export interface DeviceFilters {
    status?: DeviceStatus;
    type?: DeviceType;
    useType?: DeviceUseType;
    assignedClientId?: number;
    assignedEmployeeId?: number;
}

export interface DeviceSummary {
    total: number;
    active: number;
    offline: number;
    maintenance: number;
    error: number;
    inactive: number;
    sold: number;
    used: number;
    asignado: number;
    stock: number;
    mantenimiento: number;
    usado: number;
    perdido: number;
    vendido: number;
    byType: Record<DeviceType, number>;
    byLocation: Record<string, number>;
} 