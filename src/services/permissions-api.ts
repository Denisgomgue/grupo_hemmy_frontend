import axios from '@/lib/axios';

// Tipos para la API
export interface BackendRole {
    id: number;
    name: string;
    description?: string;
    allowAll: boolean;
    isPublic: boolean;
    role_has_permissions: BackendRoleHasPermission[];
}

export interface BackendPermission {
    id: number;
    name: string;
    displayName?: string;
    routeCode: string;
    actions: string[];
    restrictions: string[];
    isSubRoute: boolean;
    resourceId?: number;
    resource?: {
        id: number;
        routeCode: string;
        displayName: string;
        description?: string;
    };
    created_at: string;
    updated_at: string;
}

export interface BackendRoleHasPermission {
    id: number;
    name: string;
    routeCode: string;
    actions: string[];
    restrictions: string[];
    isSubRoute: boolean;
    permissionId: number;
    createdAt: string;
    updatedAt: string;
}

export interface ModuleConfig {
    id: string;
    name: string;
    basePermissions: string[];
    specificPermissions: Array<{
        id: string;
        name: string;
        category: string;
        description?: string;
    }>;
    components: Record<string, any>;
}

export interface RolePermissionMatrix {
    [ roleName: string ]: {
        [ module: string ]: {
            [ permission: string ]: boolean;
        };
    };
}

export class PermissionsAPI {
    // ===== ROLES =====
    static async getRoles(): Promise<BackendRole[]> {
        try {
            const response = await axios.get('/roles');
            return response.data;
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw new Error('Error al obtener roles');
        }
    }

    static async createRole(roleData: {
        name: string;
        description?: string;
        allowAll?: boolean;
        isPublic?: boolean;
        role_has_permissions: Array<{
            name: string;
            routeCode: string;
            actions: string[];
            restrictions: string[];
            isSubRoute: boolean;
            permissionId: number;
        }>;
    }): Promise<BackendRole> {
        try {
            const response = await axios.post('/roles', roleData);
            return response.data;
        } catch (error) {
            console.error('Error creating role:', error);
            throw new Error('Error al crear rol');
        }
    }

    static async updateRole(id: number, roleData: Partial<BackendRole>): Promise<BackendRole> {
        try {
            const response = await axios.patch(`/roles/${id}`, roleData);
            return response.data;
        } catch (error) {
            console.error('Error updating role:', error);
            throw new Error('Error al actualizar rol');
        }
    }

    static async deleteRole(id: number): Promise<void> {
        try {
            await axios.delete(`/roles/${id}`);
        } catch (error) {
            console.error('Error deleting role:', error);
            throw new Error('Error al eliminar rol');
        }
    }

    // ===== PERMISSIONS =====
    static async getPermissions(): Promise<BackendPermission[]> {
        try {
            const response = await axios.get('/permissions');
            return response.data;
        } catch (error) {
            console.error('Error fetching permissions:', error);
            throw new Error('Error al obtener permisos');
        }
    }

    // Nuevo método para obtener permisos por ID de recurso
    static async getPermissionsByResourceId(resourceId: number): Promise<BackendPermission[]> {
        try {
            const response = await axios.get(`/permissions/resource/${resourceId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching permissions by resource ID:', error);
            throw new Error('Error al obtener permisos del recurso');
        }
    }

    // Nuevo método para obtener permisos por routeCode de recurso
    static async getPermissionsByResourceRouteCode(routeCode: string): Promise<BackendPermission[]> {
        try {
            const response = await axios.get(`/permissions/resource/route/${routeCode}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching permissions by resource routeCode:', error);
            throw new Error('Error al obtener permisos del recurso');
        }
    }

    static async createPermission(permissionData: {
        name: string;
        routeCode: string;
        actions?: string[];
        restrictions?: string[];
        isSubRoute?: boolean;
        resourceId?: number;
    }): Promise<BackendPermission> {
        try {
            const response = await axios.post('/permissions', permissionData);
            return response.data;
        } catch (error) {
            console.error('Error creating permission:', error);
            throw new Error('Error al crear permiso');
        }
    }

    static async updatePermission(id: number, permissionData: Partial<BackendPermission>): Promise<BackendPermission> {
        try {
            const response = await axios.patch(`/permissions/${id}`, permissionData);
            return response.data;
        } catch (error) {
            console.error('Error updating permission:', error);
            throw new Error('Error al actualizar permiso');
        }
    }

    static async deletePermission(id: number): Promise<void> {
        try {
            await axios.delete(`/permissions/${id}`);
        } catch (error) {
            console.error('Error deleting permission:', error);
            throw new Error('Error al eliminar permiso');
        }
    }

    // ===== ROLE-PERMISSION RELATIONS =====
    static async getRolePermissions(roleId: number): Promise<BackendRoleHasPermission[]> {
        try {
            const response = await axios.get(`/role-has-permissions?roleId=${roleId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching role permissions:', error);
            throw new Error('Error al obtener permisos del rol');
        }
    }

    static async updateRolePermissions(roleId: number, permissions: Array<{
        name: string;
        routeCode: string;
        actions: string[];
        restrictions: string[];
        isSubRoute: boolean;
        permissionId: number;
    }>): Promise<void> {
        try {
            // Primero eliminamos todos los permisos del rol
            const currentPermissions = await this.getRolePermissions(roleId);
            for (const permission of currentPermissions) {
                await axios.delete(`/role-has-permissions/${permission.id}`);
            }

            // Luego creamos los nuevos permisos
            for (const permission of permissions) {
                await axios.post('/role-has-permissions', {
                    ...permission,
                    roleId
                });
            }
        } catch (error) {
            console.error('Error updating role permissions:', error);
            throw new Error('Error al actualizar permisos del rol');
        }
    }

    // ===== MODULES =====
    static async getModules(): Promise<ModuleConfig[]> {
        try {
            const permissions = await this.getPermissions();
            return this.extractModulesFromPermissions(permissions);
        } catch (error) {
            console.error('Error extracting modules:', error);
            throw new Error('Error al obtener módulos');
        }
    }

    static async getPermissionsByModule(moduleId: string): Promise<BackendPermission[]> {
        try {
            const permissions = await this.getPermissions();
            return permissions.filter(p => p.routeCode === moduleId);
        } catch (error) {
            console.error('Error fetching permissions by module:', error);
            throw new Error('Error al obtener permisos del módulo');
        }
    }

    // ===== UTILITY FUNCTIONS =====
    private static extractModulesFromPermissions(permissions: BackendPermission[]): ModuleConfig[] {
        const modules = new Map<string, ModuleConfig>();

        permissions.forEach(permission => {
            // Validar que el permiso tenga datos válidos
            if (!permission || !permission.routeCode) {
                return; // Saltar permisos inválidos
            }

            const routeCode = permission.routeCode;

            if (!modules.has(routeCode)) {
                modules.set(routeCode, {
                    id: routeCode,
                    name: permission.displayName || this.formatRouteCode(routeCode),
                    basePermissions: [],
                    specificPermissions: [],
                    components: {}
                });
            }

            const module = modules.get(routeCode)!;

            // Clasificar permisos
            if (this.isBasePermission(permission)) {
                // Agregar las acciones individuales del permiso base
                if (permission.actions && Array.isArray(permission.actions)) {
                    module.basePermissions.push(...permission.actions);
                }
            } else {
                // Permisos específicos (isSubRoute = true)
                if (permission.actions && permission.actions.length > 0) {
                    module.specificPermissions.push({
                        id: permission.name,
                        name: permission.name,
                        category: permission.actions[ 0 ] || 'ACTION',
                        description: `Permiso específico para ${permission.name}`
                    });
                }
            }
        });

        return Array.from(modules.values());
    }

    private static formatRouteCode(routeCode: string): string {
        return routeCode.replace(/([A-Z])/g, ' $1').trim();
    }

    private static isBasePermission(permission: BackendPermission): boolean {
        // Un permiso es base si NO es subRoute y tiene acciones CRUD
        const baseActions = [ 'create', 'read', 'update', 'delete' ];
        return !permission.isSubRoute && permission.actions && permission.actions.some(action => baseActions.includes(action));
    }

    // ===== MATRIX OPERATIONS =====
    static async getRolePermissionMatrix(): Promise<RolePermissionMatrix> {
        try {
            const roles = await this.getRoles();
            const matrix: RolePermissionMatrix = {};

            for (const role of roles) {
                matrix[ role.name ] = {};

                role.role_has_permissions.forEach(rhp => {
                    const module = rhp.routeCode;
                    if (!matrix[ role.name ][ module ]) {
                        matrix[ role.name ][ module ] = {};
                    }

                    // Validar que actions exista y sea un array
                    if (rhp.actions && Array.isArray(rhp.actions)) {
                        rhp.actions.forEach(action => {
                            matrix[ role.name ][ module ][ action ] = true;
                        });
                    }
                });
            }

            return matrix;
        } catch (error) {
            console.error('Error building permission matrix:', error);
            throw new Error('Error al construir matriz de permisos');
        }
    }

    static async updateRolePermissionMatrix(matrix: RolePermissionMatrix): Promise<void> {
        try {
            const roles = await this.getRoles();

            for (const role of roles) {
                const rolePermissions = matrix[ role.name ];
                if (rolePermissions) {
                    const permissionsToUpdate = this.matrixToPermissions(rolePermissions);
                    await this.updateRolePermissions(role.id, permissionsToUpdate);
                }
            }
        } catch (error) {
            console.error('Error updating permission matrix:', error);
            throw new Error('Error al actualizar matriz de permisos');
        }
    }

    private static matrixToPermissions(matrix: Record<string, Record<string, boolean>>): Array<{
        name: string;
        routeCode: string;
        actions: string[];
        restrictions: string[];
        isSubRoute: boolean;
        permissionId: number;
    }> {
        const permissions: Array<{
            name: string;
            routeCode: string;
            actions: string[];
            restrictions: string[];
            isSubRoute: boolean;
            permissionId: number;
        }> = [];

        Object.entries(matrix).forEach(([ module, modulePermissions ]) => {
            const actions = Object.keys(modulePermissions).filter(action => modulePermissions[ action ]);

            if (actions.length > 0) {
                permissions.push({
                    name: `${module} permissions`,
                    routeCode: module,
                    actions,
                    restrictions: [],
                    isSubRoute: false,
                    permissionId: 0 // Esto se asignará en el backend
                });
            }
        });

        return permissions;
    }

    // ===== MODULE OPERATIONS =====
    // Crear un nuevo módulo (permiso base)
    static async createModule(moduleData: {
        name: string;
        routeCode: string;
        basePermissions: string[];
        displayName?: string;
        resourceId?: number;
    }): Promise<BackendPermission> {
        try {
            const response = await axios.post('/permissions', {
                name: moduleData.name,
                displayName: moduleData.displayName || moduleData.name,
                routeCode: moduleData.routeCode,
                actions: moduleData.basePermissions,
                restrictions: [],
                isSubRoute: false,
                resourceId: moduleData.resourceId
            });
            return response.data;
        } catch (error) {
            console.error('Error creating module:', error);
            throw new Error('Error al crear módulo');
        }
    }

    // Actualizar un módulo (permiso)
    static async updateModule(moduleId: string, moduleData: {
        name: string;
        routeCode: string;
        basePermissions: string[];
        displayName?: string;
        resourceId?: number;
    }): Promise<BackendPermission> {
        try {
            // Primero obtener el permiso actual
            const permissions = await this.getPermissions();
            const currentPermission = permissions.find(p => p.routeCode === moduleId);

            if (!currentPermission) {
                throw new Error('Módulo no encontrado');
            }

            // Si el routeCode cambió, necesitamos actualizar todos los permisos del módulo
            if (moduleData.routeCode !== moduleId) {
                // Obtener todos los permisos del módulo actual
                const modulePermissions = permissions.filter(p => p.routeCode === moduleId);

                // Actualizar cada permiso con el nuevo routeCode
                for (const permission of modulePermissions) {
                    await axios.patch(`/permissions/${permission.id}`, {
                        routeCode: moduleData.routeCode
                    });
                }

                // Retornar el permiso base actualizado
                const updatedPermission = await axios.patch(`/permissions/${currentPermission.id}`, {
                    name: moduleData.name,
                    displayName: moduleData.displayName || moduleData.name,
                    routeCode: moduleData.routeCode,
                    actions: moduleData.basePermissions,
                    restrictions: [],
                    isSubRoute: false,
                    resourceId: moduleData.resourceId
                });
                return updatedPermission.data;
            } else {
                // Si solo cambió el nombre o acciones, actualizar solo el permiso base
                const response = await axios.patch(`/permissions/${currentPermission.id}`, {
                    name: moduleData.name,
                    displayName: moduleData.displayName || moduleData.name,
                    routeCode: moduleData.routeCode,
                    actions: moduleData.basePermissions,
                    restrictions: [],
                    isSubRoute: false,
                    resourceId: moduleData.resourceId
                });
                return response.data;
            }
        } catch (error) {
            console.error('Error updating module:', error);
            throw new Error('Error al actualizar módulo');
        }
    }

    // Eliminar un módulo (permiso)
    static async deleteModule(moduleId: string): Promise<void> {
        try {
            // Primero obtener el permiso actual
            const permissions = await this.getPermissions();
            const currentPermission = permissions.find(p => p.routeCode === moduleId);

            if (!currentPermission) {
                throw new Error('Módulo no encontrado');
            }

            await axios.delete(`/permissions/${currentPermission.id}`);
        } catch (error) {
            console.error('Error deleting module:', error);
            throw new Error('Error al eliminar módulo');
        }
    }

    // Crear un permiso específico para un módulo
    static async createSpecificPermission(moduleId: string, permissionData: {
        name: string;
        category: string;
        description: string;
        resourceId?: number;
    }): Promise<BackendPermission> {
        try {
            const response = await axios.post('/permissions', {
                name: permissionData.name,
                routeCode: moduleId,
                actions: [ permissionData.category.toLowerCase() ],
                restrictions: [],
                isSubRoute: true,
                resourceId: permissionData.resourceId
            });
            return response.data;
        } catch (error) {
            console.error('Error creating specific permission:', error);
            throw new Error('Error al crear permiso específico');
        }
    }

    // Eliminar un permiso específico
    static async deleteSpecificPermission(permissionId: number): Promise<void> {
        try {
            await axios.delete(`/permissions/${permissionId}`);
        } catch (error) {
            console.error('Error deleting specific permission:', error);
            throw new Error('Error al eliminar permiso específico');
        }
    }
} 