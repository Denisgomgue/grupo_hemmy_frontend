import { RoleHasPermission } from "@/types/roles/role";

// Tipos para permisos
export interface Permission {
    id: number;
    name: string;
    routeCode: string;
    actions: string[];
    restrictions: string[];
    isSubRoute: boolean;
    role_has_permissions?: RoleHasPermission[];
    created_at: Date;
    updated_at: Date;
}

// Tipos para formularios
export interface CreatePermissionData {
    name: string;
    routeCode: string;
    actions: string[];
    restrictions: string[];
    isSubRoute: boolean;
}

export interface UpdatePermissionData {
    name?: string;
    routeCode?: string;
    actions?: string[];
    restrictions?: string[];
    isSubRoute?: boolean;
}

// Tipo para el resumen de permisos
export interface PermissionSummary {
    total: number;
    active: number;
    inactive: number;
    subRoutes: number;
    mainRoutes: number;
    permissionsWithActions: number;
    permissionsWithoutActions: number;
}

// Tipo para filtros de permisos
export interface PermissionFilters {
    name?: string;
    routeCode?: string;
    isSubRoute?: boolean;
    hasActions?: boolean;
    hasRestrictions?: boolean;
}

// Tipo para opciones de acciones
export interface ActionOption {
    value: string;
    label: string;
    description?: string;
}

// Tipo para opciones de restricciones
export interface RestrictionOption {
    value: string;
    label: string;
    description?: string;
}
