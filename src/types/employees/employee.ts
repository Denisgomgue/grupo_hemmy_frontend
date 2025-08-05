import { Role } from "../roles/role";

export interface Employee {
    id: number;
    name: string;
    lastName: string;
    dni: string;
    phone?: string;
    roleId?: number;
    role?: Role;
    created_at: Date;
    updated_at: Date;
}

export interface CreateEmployeeData {
    name: string;
    lastName: string;
    dni: string;
    phone?: string;
    roleId: number;
}

export interface UpdateEmployeeData {
    name?: string;
    lastName?: string;
    dni?: string;
    phone?: string;
    roleId?: number;
}

export interface EmployeeSummary {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
}
