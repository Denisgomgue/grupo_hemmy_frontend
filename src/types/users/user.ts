// Tipos para usuarios
export interface User {
    id: number;
    name?: string;
    surname?: string;
    documentType?: string;
    documentNumber?: string;
    username: string;
    email: string;
    phone?: string;
    password?: string;
    isActive: boolean;
    emailVerified?: boolean;
    allowAll?: boolean;
    isPublic?: boolean;
    address?: string;
    role?: Role;
    created_at: Date;
    updated_at: Date;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    allowAll: boolean;
    isPublic: boolean;
    role_has_permissions?: RoleHasPermission[];
    created_at: Date;
    updated_at: Date;
}

export interface RoleHasPermission {
    id: number;
    name: string;
    routeCode: string;
    actions: string[];
    restrictions: string[];
    isSubRoute: boolean;
    permissionId?: number;
    permission?: Permission;
    createdAt: Date;
    updatedAt: Date;
}

export interface Permission {
    id: number;
    name: string;
    routeCode: string;
    actions: string[];
    restrictions: string[];
    isSubRoute: boolean;
    created_at: Date;
    updated_at: Date;
}

// Tipos para formularios
export interface CreateUserData {
    name?: string;
    surname?: string;
    email: string;
    password: string;
    documentType?: string;
    documentNumber?: string;
    username: string;
    phone?: string;
    roleId?: number;
    isActive?: boolean;
}

export interface UpdateUserData {
    name?: string;
    surname?: string;
    email?: string;
    documentType?: string;
    documentNumber?: string;
    username?: string;
    phone?: string;
    roleId?: number;
    isActive?: boolean;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Tipo para el resumen de usuarios
export interface UserSummary {
    total: number;
    active: number;
    inactive: number;
    withRole: number;
    withoutRole: number;
    verified: number;
    unverified: number;
}

// Tipo para filtros de usuarios
export interface UserFilters {
    name?: string;
    email?: string;
    username?: string;
    isActive?: boolean;
    hasRole?: boolean;
    documentType?: string;
}

// Tipo para opciones de tipo de documento
export interface DocumentTypeOption {
    value: string;
    label: string;
}

// Tipo para opciones de roles
export interface RoleOption {
    value: number;
    label: string;
    description?: string;
}