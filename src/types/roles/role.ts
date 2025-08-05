import { Permission } from "../permissions/permission";

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

export interface Role {
    id: number;
    name: string;
    description?: string;
    allowAll: boolean;
    isPublic: boolean;
    role_has_permissions: RoleHasPermission[];
    employees?: any[];
    created_at: Date;
    updated_at: Date;
}

export interface CreateRoleData {
    name: string;
    description?: string;
    allowAll?: boolean;
    isPublic?: boolean;
    role_has_permissions: {
        name: string;
        routeCode: string;
        actions: string[];
        restrictions: string[];
        isSubRoute: boolean;
        permissionId: number;
    }[];
}

export interface UpdateRoleData {
    name?: string;
    description?: string;
    allowAll?: boolean;
    isPublic?: boolean;
    role_has_permissions?: {
        name: string;
        routeCode: string;
        actions: string[];
        restrictions: string[];
        isSubRoute: boolean;
        permissionId: number;
    }[];
}

export interface RoleSummary {
    total: number;
    active: number;
    inactive: number;
    publicRoles: number;
    privateRoles: number;
    rolesWithPermissions: number;
    rolesWithoutPermissions: number;
} 