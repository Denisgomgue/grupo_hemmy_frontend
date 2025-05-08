export interface Profile {
    id: number;
    name: string;
    description: string;
    allowAll: boolean;
    isPublic: boolean;
    accesses?: Access[];
    createdAt?: string;
    updatedAt?: string;
    role_has_permissions?: RoleHasPermission[];
}

export interface Access {
    id: number;
    name: string;
    routeCode: string;
    actions: string[];
    restrictions: string[];
    isSubRoute: boolean;
    enabled: boolean;
    permissionId?: number;
    selectedActions: string[];
    selectedRestrictions: string[];
}

export interface ProfileDTO {
    id?: number;
    name: string;
    description: string;
    allowAll: boolean;
    isPublic: boolean;
    role_has_permissions: RoleHasPermission[];
}

export interface RoleHasPermission {
    id?: number;
    name: string;
    routeCode: string;
    actions: string[];
    restrictions: string[];
    isSubRoute: boolean;
    permissionId: number;
    createdAt?: string;
    updatedAt?: string;
}