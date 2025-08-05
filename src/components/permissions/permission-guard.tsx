"use client";

import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionGuardProps {
    permission: string;
    module?: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
    requireAll?: boolean;
    permissions?: string[];
}

export function PermissionGuard({
    permission,
    module,
    fallback,
    children,
    requireAll = false,
    permissions = []
}: PermissionGuardProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

    // Si está cargando, mostrar fallback o nada
    if (isLoading) {
        return fallback || null;
    }

    // Si se pasan múltiples permisos
    if (permissions.length > 0) {
        const hasAccess = requireAll
            ? hasAllPermissions(permissions, module)
            : hasAnyPermission(permissions, module);

        if (!hasAccess) {
            return fallback || null;
        }
    } else {
        // Verificar permiso individual
        const fullPermission = module ? `${module}:${permission}` : permission;
        if (!hasPermission(permission, module)) {
            return fallback || null;
        }
    }

    return <>{children}</>;
}

// Componente de alto orden para envolver componentes
export function withPermission<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    permission: string,
    module?: string,
    fallback?: React.ReactNode
) {
    return function WithPermissionComponent(props: P) {
        return (
            <PermissionGuard permission={permission} module={module} fallback={fallback}>
                <WrappedComponent {...props} />
            </PermissionGuard>
        );
    };
}

// Hook para verificar permisos en componentes
export function usePermissionGuard() {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

    return {
        checkPermission: (permission: string, module?: string) => {
            if (isLoading) return false;
            return hasPermission(permission, module);
        },
        checkAnyPermission: (permissions: string[], module?: string) => {
            if (isLoading) return false;
            return hasAnyPermission(permissions, module);
        },
        checkAllPermissions: (permissions: string[], module?: string) => {
            if (isLoading) return false;
            return hasAllPermissions(permissions, module);
        },
        isLoading
    };
} 