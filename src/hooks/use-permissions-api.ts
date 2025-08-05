"use client";

import { useState, useEffect, useCallback } from 'react';
import { PermissionsAPI, BackendRole, BackendPermission, ModuleConfig, RolePermissionMatrix } from '@/services/permissions-api';
import { toast } from 'sonner';

export const usePermissionsAPI = () => {
    // Estados para datos
    const [ roles, setRoles ] = useState<BackendRole[]>([]);
    const [ permissions, setPermissions ] = useState<BackendPermission[]>([]);
    const [ modules, setModules ] = useState<ModuleConfig[]>([]);
    const [ permissionMatrix, setPermissionMatrix ] = useState<RolePermissionMatrix>({});
    const [ permissionsByResource, setPermissionsByResource ] = useState<Record<string, BackendPermission[]>>({});

    // Estados de carga
    const [ isLoadingRoles, setIsLoadingRoles ] = useState(false);
    const [ isLoadingPermissions, setIsLoadingPermissions ] = useState(false);
    const [ isLoadingModules, setIsLoadingModules ] = useState(false);
    const [ isLoadingMatrix, setIsLoadingMatrix ] = useState(false);
    const [ isLoadingResourcePermissions, setIsLoadingResourcePermissions ] = useState(false);

    // Estados de operaciones
    const [ isSaving, setIsSaving ] = useState(false);
    const [ hasChanges, setHasChanges ] = useState(false);

    // ===== CARGAR DATOS =====

    // Cargar roles
    const loadRoles = useCallback(async () => {
        setIsLoadingRoles(true);
        try {
            const data = await PermissionsAPI.getRoles();
            setRoles(data);
            return data;
        } catch (error) {
            toast.error('Error al cargar roles');
            console.error('Error loading roles:', error);
            return [];
        } finally {
            setIsLoadingRoles(false);
        }
    }, []);

    // Cargar permisos
    const loadPermissions = useCallback(async () => {
        setIsLoadingPermissions(true);
        try {
            const data = await PermissionsAPI.getPermissions();
            setPermissions(data);
            return data;
        } catch (error) {
            toast.error('Error al cargar permisos');
            console.error('Error loading permissions:', error);
            return [];
        } finally {
            setIsLoadingPermissions(false);
        }
    }, []);

    // Cargar permisos por recurso
    const loadPermissionsByResource = useCallback(async (routeCode: string) => {
        setIsLoadingResourcePermissions(true);
        try {
            const data = await PermissionsAPI.getPermissionsByResourceRouteCode(routeCode);
            setPermissionsByResource(prev => ({
                ...prev,
                [ routeCode ]: data
            }));
            return data;
        } catch (error) {
            toast.error('Error al cargar permisos del recurso');
            console.error('Error loading resource permissions:', error);
            return [];
        } finally {
            setIsLoadingResourcePermissions(false);
        }
    }, []);

    // Cargar módulos
    const loadModules = useCallback(async () => {
        setIsLoadingModules(true);
        try {
            const data = await PermissionsAPI.getModules();
            setModules(data);
            return data;
        } catch (error) {
            toast.error('Error al cargar módulos');
            console.error('Error loading modules:', error);
            return [];
        } finally {
            setIsLoadingModules(false);
        }
    }, []);

    // Cargar matriz de permisos
    const loadPermissionMatrix = useCallback(async () => {
        setIsLoadingMatrix(true);
        try {
            const data = await PermissionsAPI.getRolePermissionMatrix();
            setPermissionMatrix(data);
            return data;
        } catch (error) {
            toast.error('Error al cargar matriz de permisos');
            console.error('Error loading permission matrix:', error);
            return {};
        } finally {
            setIsLoadingMatrix(false);
        }
    }, []);

    // Cargar todos los datos
    const loadAllData = useCallback(async () => {
        try {
            await Promise.all([
                loadRoles(),
                loadPermissions(),
                loadModules(),
                loadPermissionMatrix()
            ]);
        } catch (error) {
            console.error('Error loading all data:', error);
        }
    }, [ loadRoles, loadPermissions, loadModules, loadPermissionMatrix ]);

    // ===== OPERACIONES CRUD =====

    // Crear rol
    const createRole = useCallback(async (roleData: any): Promise<BackendRole> => {
        try {
            const newRole = await PermissionsAPI.createRole(roleData);
            await loadRoles();
            toast.success('Rol creado exitosamente');
            return newRole;
        } catch (error) {
            toast.error('Error al crear rol');
            throw error;
        }
    }, [ loadRoles ]);

    // Actualizar rol
    const updateRole = useCallback(async (id: number, roleData: any): Promise<BackendRole> => {
        try {
            const updatedRole = await PermissionsAPI.updateRole(id, roleData);
            await loadRoles();
            toast.success('Rol actualizado exitosamente');
            return updatedRole;
        } catch (error) {
            toast.error('Error al actualizar rol');
            throw error;
        }
    }, [ loadRoles ]);

    // Eliminar rol
    const deleteRole = useCallback(async (id: number): Promise<void> => {
        try {
            await PermissionsAPI.deleteRole(id);
            await loadRoles();
            toast.success('Rol eliminado exitosamente');
        } catch (error) {
            toast.error('Error al eliminar rol');
            throw error;
        }
    }, [ loadRoles ]);

    // Crear permiso
    const createPermission = useCallback(async (permissionData: any): Promise<BackendPermission> => {
        try {
            const newPermission = await PermissionsAPI.createPermission(permissionData);
            await loadPermissions();
            toast.success('Permiso creado exitosamente');
            return newPermission;
        } catch (error) {
            toast.error('Error al crear permiso');
            throw error;
        }
    }, [ loadPermissions ]);

    // Actualizar permiso
    const updatePermission = useCallback(async (id: number, permissionData: any): Promise<BackendPermission> => {
        try {
            const updatedPermission = await PermissionsAPI.updatePermission(id, permissionData);
            await loadPermissions();
            toast.success('Permiso actualizado exitosamente');
            return updatedPermission;
        } catch (error) {
            toast.error('Error al actualizar permiso');
            throw error;
        }
    }, [ loadPermissions ]);

    // Eliminar permiso
    const deletePermission = useCallback(async (id: number): Promise<void> => {
        try {
            await PermissionsAPI.deletePermission(id);
            await loadPermissions();
            toast.success('Permiso eliminado exitosamente');
        } catch (error) {
            toast.error('Error al eliminar permiso');
            throw error;
        }
    }, [ loadPermissions ]);

    // ===== OPERACIONES DE MÓDULOS =====

    // Crear módulo
    const createModule = useCallback(async (moduleData: any): Promise<BackendPermission> => {
        try {
            const newModule = await PermissionsAPI.createModule(moduleData);
            await loadModules();
            toast.success('Módulo creado exitosamente');
            return newModule;
        } catch (error) {
            toast.error('Error al crear módulo');
            throw error;
        }
    }, [ loadModules ]);

    // Actualizar módulo
    const updateModule = useCallback(async (moduleId: string, moduleData: any): Promise<BackendPermission> => {
        try {
            const updatedModule = await PermissionsAPI.updateModule(moduleId, moduleData);
            await loadModules();
            toast.success('Módulo actualizado exitosamente');
            return updatedModule;
        } catch (error) {
            toast.error('Error al actualizar módulo');
            throw error;
        }
    }, [ loadModules ]);

    // Eliminar módulo
    const deleteModule = useCallback(async (moduleId: string): Promise<void> => {
        try {
            await PermissionsAPI.deleteModule(moduleId);
            await loadModules();
            toast.success('Módulo eliminado exitosamente');
        } catch (error) {
            toast.error('Error al eliminar módulo');
            throw error;
        }
    }, [ loadModules ]);

    // Crear permiso específico
    const createSpecificPermission = useCallback(async (moduleId: string, permissionData: any): Promise<BackendPermission> => {
        try {
            const newPermission = await PermissionsAPI.createSpecificPermission(moduleId, permissionData);
            await loadPermissions();
            toast.success('Permiso específico creado exitosamente');
            return newPermission;
        } catch (error) {
            toast.error('Error al crear permiso específico');
            throw error;
        }
    }, [ loadPermissions ]);

    // Eliminar permiso específico
    const deleteSpecificPermission = useCallback(async (permissionId: number): Promise<void> => {
        try {
            await PermissionsAPI.deleteSpecificPermission(permissionId);
            await loadPermissions();
            toast.success('Permiso específico eliminado exitosamente');
        } catch (error) {
            toast.error('Error al eliminar permiso específico');
            throw error;
        }
    }, [ loadPermissions ]);

    // ===== OPERACIONES DE MATRIZ =====

    // Actualizar matriz de permisos
    const updatePermissionMatrix = useCallback(async (matrix: RolePermissionMatrix): Promise<void> => {
        setIsSaving(true);
        try {
            await PermissionsAPI.updateRolePermissionMatrix(matrix);
            await loadPermissionMatrix();
            setHasChanges(false);
            toast.success('Matriz de permisos actualizada exitosamente');
        } catch (error) {
            toast.error('Error al actualizar matriz de permisos');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [ loadPermissionMatrix ]);

    // Actualizar permiso individual en la matriz
    const updateMatrixPermission = useCallback((roleName: string, module: string, permission: string, granted: boolean) => {
        setPermissionMatrix(prev => {
            const newMatrix = { ...prev };

            if (!newMatrix[ roleName ]) {
                newMatrix[ roleName ] = {};
            }
            if (!newMatrix[ roleName ][ module ]) {
                newMatrix[ roleName ][ module ] = {};
            }

            if (granted) {
                newMatrix[ roleName ][ module ][ permission ] = true;
            } else {
                delete newMatrix[ roleName ][ module ][ permission ];
            }

            return newMatrix;
        });
        setHasChanges(true);
    }, []);

    // Obtener estado de permiso en la matriz
    const getMatrixPermissionStatus = useCallback((roleName: string, module: string, permission: string): boolean => {
        return permissionMatrix[ roleName ]?.[ module ]?.[ permission ] || false;
    }, [ permissionMatrix ]);

    // ===== UTILIDADES =====

    // Obtener módulo por ID
    const getModuleById = useCallback((moduleId: string): ModuleConfig | undefined => {
        return modules.find(module => module.id === moduleId);
    }, [ modules ]);

    // Obtener rol por nombre
    const getRoleByName = useCallback((roleName: string): BackendRole | undefined => {
        return roles.find(role => role.name === roleName);
    }, [ roles ]);

    // Obtener permisos por módulo
    const getPermissionsByModule = useCallback((moduleId: string): BackendPermission[] => {
        return permissions.filter(permission => permission.routeCode === moduleId);
    }, [ permissions ]);

    // Obtener permiso base por módulo
    const getBasePermissionByModule = useCallback((moduleId: string): BackendPermission | undefined => {
        return permissions.find(permission =>
            permission.routeCode === moduleId && !permission.isSubRoute
        );
    }, [ permissions ]);

    // Obtener todas las acciones de un módulo
    const getAllModuleActions = useCallback((moduleId: string): string[] => {
        const modulePermissions = getPermissionsByModule(moduleId);
        const actions: string[] = [];

        modulePermissions.forEach(permission => {
            if (permission.actions && Array.isArray(permission.actions)) {
                actions.push(...permission.actions);
            }
        });

        return [ ...new Set(actions) ]; // Eliminar duplicados
    }, [ getPermissionsByModule ]);

    // ===== LÓGICA DE ALLOWALL =====

    // Verificar si un rol tiene allowAll
    const isRoleAllowAll = useCallback((roleName: string): boolean => {
        const role = getRoleByName(roleName);
        return role?.allowAll || false;
    }, [ getRoleByName ]);

    // Verificar si un rol es editable
    const isRoleEditable = useCallback((roleName: string): boolean => {
        return !isRoleAllowAll(roleName);
    }, [ isRoleAllowAll ]);

    // Verificar si un rol es eliminable
    const isRoleDeletable = useCallback((roleName: string): boolean => {
        return !isRoleAllowAll(roleName);
    }, [ isRoleAllowAll ]);

    // Obtener estado de permiso considerando allowAll
    const getMatrixPermissionStatusWithAllowAll = useCallback((roleName: string, module: string, permission: string): boolean => {
        if (isRoleAllowAll(roleName)) {
            return true; // Los roles con allowAll tienen todos los permisos
        }
        return getMatrixPermissionStatus(roleName, module, permission);
    }, [ isRoleAllowAll, getMatrixPermissionStatus ]);

    // Actualizar permiso considerando allowAll
    const updateMatrixPermissionWithAllowAll = useCallback((roleName: string, module: string, permission: string, granted: boolean) => {
        // No permitir cambiar permisos de roles con allowAll
        if (isRoleAllowAll(roleName)) {
            toast.warning('No se pueden modificar los permisos del Super Administrador');
            return;
        }

        updateMatrixPermission(roleName, module, permission, granted);
    }, [ updateMatrixPermission, isRoleAllowAll ]);

    // ===== INICIALIZACIÓN =====

    useEffect(() => {
        loadAllData();
    }, [ loadAllData ]);

    return {
        // Datos
        roles,
        permissions,
        modules,
        permissionMatrix,
        permissionsByResource,

        // Estados de carga
        isLoadingRoles,
        isLoadingPermissions,
        isLoadingModules,
        isLoadingMatrix,
        isLoadingResourcePermissions,
        isSaving,
        hasChanges,

        // Operaciones CRUD
        createRole,
        updateRole,
        deleteRole,
        createPermission,
        updatePermission,
        deletePermission,

        // Operaciones de módulos
        createModule,
        updateModule,
        deleteModule,
        createSpecificPermission,
        deleteSpecificPermission,

        // Operaciones de matriz
        updatePermissionMatrix,
        updateMatrixPermission,
        getMatrixPermissionStatus,

        // Lógica de allowAll
        isRoleAllowAll,
        isRoleEditable,
        isRoleDeletable,
        getMatrixPermissionStatusWithAllowAll,
        updateMatrixPermissionWithAllowAll,

        // Utilidades
        getModuleById,
        getRoleByName,
        getPermissionsByModule,
        getBasePermissionByModule,
        getAllModuleActions,

        // Recarga de datos
        loadRoles,
        loadPermissions,
        loadModules,
        loadPermissionMatrix,
        loadPermissionsByResource,
        loadAllData,

        // Control de cambios
        setHasChanges
    };
}; 