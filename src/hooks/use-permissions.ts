"use client";

import { useState, useEffect } from 'react';
import { ROLES, DEFAULT_ROLE_PERMISSIONS, MODULE_CONFIG } from '@/config/module-config';

// Simular usuario actual (en producción vendría del contexto de autenticación)
const CURRENT_USER_ROLE = 'Administrador';

export interface PermissionState {
    [ module: string ]: {
        [ permission: string ]: boolean;
    };
}

export const usePermissions = () => {
    const [ permissions, setPermissions ] = useState<PermissionState>({});
    const [ currentRole, setCurrentRole ] = useState(CURRENT_USER_ROLE);
    const [ isLoading, setIsLoading ] = useState(true);

    // Función para cargar permisos
    const loadPermissions = () => {
        setIsLoading(true);

        // Simular delay de API
        setTimeout(() => {
            const rolePermissions = DEFAULT_ROLE_PERMISSIONS[ currentRole as keyof typeof DEFAULT_ROLE_PERMISSIONS ] || {};
            // Convertir el formato de permisos por rol al formato PermissionState
            const userPermissions: PermissionState = {};
            Object.entries(rolePermissions).forEach(([ module, permissions ]) => {
                userPermissions[ module ] = {};
                permissions.forEach(permission => {
                    userPermissions[ module ][ permission ] = true;
                });
            });
            setPermissions(userPermissions);
            setIsLoading(false);
        }, 500);
    };

    // Simular carga de permisos
    useEffect(() => {
        loadPermissions();
    }, [ currentRole ]);

    // Función para recargar permisos
    const refreshPermissions = () => {
        loadPermissions();
    };

    const hasPermission = (permission: string, module?: string): boolean => {
        if (isLoading) return false;

        if (module) {
            return permissions[ module ]?.[ permission ] || false;
        }

        // Buscar en todos los módulos
        return Object.values(permissions).some(modulePermissions =>
            modulePermissions[ permission ]
        );
    };

    const hasAnyPermission = (permissions: string[], module?: string): boolean => {
        return permissions.some(permission => hasPermission(permission, module));
    };

    const hasAllPermissions = (permissions: string[], module?: string): boolean => {
        return permissions.every(permission => hasPermission(permission, module));
    };

    const getModulePermissions = (module: string): string[] => {
        const modulePermissions = permissions[ module ] || {};
        return Object.keys(modulePermissions).filter(permission =>
            modulePermissions[ permission ]
        );
    };

    const updatePermission = (module: string, permission: string, granted: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [ module ]: {
                ...prev[ module ],
                [ permission ]: granted
            }
        }));
    };

    const updateRole = (roleName: string) => {
        setCurrentRole(roleName);
    };

    const getCurrentRole = () => currentRole;

    const getAvailableRoles = () => ROLES;

    return {
        permissions,
        currentRole,
        isLoading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        getModulePermissions,
        updatePermission,
        updateRole,
        getCurrentRole,
        getAvailableRoles,
        refreshPermissions
    };
};

// Hook específico para componentes de módulo
export const useModulePermissions = (module: string) => {
    const { hasPermission, getModulePermissions, isLoading } = usePermissions();

    const moduleConfig = MODULE_CONFIG[ module ];

    if (!moduleConfig) {
        return {
            canCreate: false,
            canRead: false,
            canUpdate: false,
            canDelete: false,
            canViewSummary: false,
            canViewActions: false,
            canViewFilters: false,
            specificPermissions: {},
            isLoading: true
        };
    }

    // Permisos base
    const canCreate = hasPermission('CREATE', module);
    const canRead = hasPermission('READ', module);
    const canUpdate = hasPermission('UPDATE', module);
    const canDelete = hasPermission('DELETE', module);
    const canViewSummary = hasPermission('VIEW_SUMMARY_CARDS', module);
    const canViewActions = hasPermission('VIEW_ACTIONS', module);
    const canViewFilters = hasPermission('VIEW_FILTERS', module);

    // Permisos específicos
    const specificPermissions = moduleConfig.specificPermissions.reduce((acc, permission) => {
        acc[ permission.id ] = hasPermission(permission.id, module);
        return acc;
    }, {} as Record<string, boolean>);

    return {
        canCreate,
        canRead,
        canUpdate,
        canDelete,
        canViewSummary,
        canViewActions,
        canViewFilters,
        specificPermissions,
        isLoading,
        moduleConfig
    };
}; 