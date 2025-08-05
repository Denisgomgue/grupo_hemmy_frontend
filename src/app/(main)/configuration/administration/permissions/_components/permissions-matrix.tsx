"use client";

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Settings } from 'lucide-react';
import { ModuleNavigation } from './module-navigation';
import { BasePermissionsTable } from './base-permissions-table';
import { SpecificPermissionsTable } from './specific-permissions-table';
import { BackendPermission } from '@/services/permissions-api';

interface Role {
    id: number;
    name: string;
}

interface ModuleConfig {
    id: string;
    name: string;
    basePermissions: string[];
    specificPermissions: Array<{
        id: string;
        name: string;
    }>;
}

interface PermissionsMatrixProps {
    roles: Role[];
    modules: any[]; // Usar any por ahora para evitar conflictos de tipos
    selectedModule: string;
    onModuleChange: (moduleId: string) => void;
    getPermissionStatus: (roleName: string, module: string, permission: string) => boolean;
    handlePermissionChange: (roleName: string, module: string, permission: string, granted: boolean) => void;
    isRoleAllowAll: (roleName: string) => boolean;
    onAddRole: () => void;
    onEditRole: (roleName: string) => void;
    onDeleteRole: (roleName: string) => void;
    onAddBasePermission: () => void;
    onAddSpecificPermission: () => void;
    isLoading?: boolean;
    resourcePermissions?: BackendPermission[];
}

export function PermissionsMatrix({
    roles,
    modules,
    selectedModule,
    onModuleChange,
    getPermissionStatus,
    handlePermissionChange,
    isRoleAllowAll,
    onAddRole,
    onEditRole,
    onDeleteRole,
    onAddBasePermission,
    onAddSpecificPermission,
    isLoading = false,
    resourcePermissions = []
}: PermissionsMatrixProps) {
    // Encontrar el módulo seleccionado y crear la configuración
    const selectedModuleData = modules.find(m => m.routeCode === selectedModule || m.id === selectedModule);

    // Crear configuración temporal para el módulo seleccionado usando los permisos del recurso
    const moduleConfig: ModuleConfig | undefined = selectedModuleData ? {
        id: selectedModuleData.id || selectedModuleData.routeCode,
        name: selectedModuleData.displayName || selectedModuleData.name,
        basePermissions: resourcePermissions
            .filter(p => !p.isSubRoute)
            .flatMap(p => p.actions || []),
        specificPermissions: resourcePermissions
            .filter(p => p.isSubRoute)
            .map(p => ({
                id: p.name,
                name: p.displayName || p.name
            }))
    } : undefined;

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando permisos...</p>
                    </div>
                </div>
            </Card>
        );
    }

    if (!modules.length || !roles.length) {
        return (
            <Card className="p-6">
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No hay datos disponibles</p>
                    <button onClick={() => window.location.reload()}>
                        Recargar
                    </button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            {/* Navegación de módulos */}
            <ModuleNavigation
                modules={modules}
                selectedModule={selectedModule}
                onModuleChange={onModuleChange}
                isLoading={isLoading}
            />

            {/* Tabla de permisos */}
            <div className="p-6">
                <Tabs defaultValue="base" className="w-full">
                    <TabsList className="flex w-full justify-between bg-violet-50 rounded-lg border border-violet-200 p-1">
                        <TabsTrigger
                            value="base"
                            className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-purple-200 data-[state=inactive]:text-violet-600 data-[state=inactive]:hover:text-violet-800 data-[state=inactive]:hover:bg-violet-100 transition-all duration-200 rounded-md font-medium w-full"
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Permisos Base
                        </TabsTrigger>
                        <TabsTrigger
                            value="specific"
                            className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-purple-200 data-[state=inactive]:text-violet-600 data-[state=inactive]:hover:text-violet-800 data-[state=inactive]:hover:bg-violet-100 transition-all duration-200 rounded-md font-medium w-full"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Permisos Específicos
                        </TabsTrigger>
                    </TabsList>

                    {/* Permisos Base */}
                    <TabsContent value="base" className="mt-6">
                        <BasePermissionsTable
                            roles={roles}
                            moduleConfig={moduleConfig}
                            selectedModule={selectedModule}
                            getPermissionStatus={getPermissionStatus}
                            handlePermissionChange={handlePermissionChange}
                            isRoleAllowAll={isRoleAllowAll}
                            onAddRole={onAddRole}
                            onEditRole={onEditRole}
                            onDeleteRole={onDeleteRole}
                            onAddBasePermission={onAddBasePermission}
                            isLoading={isLoading}
                        />
                    </TabsContent>

                    {/* Permisos Específicos */}
                    <TabsContent value="specific" className="mt-6">
                        <SpecificPermissionsTable
                            roles={roles}
                            moduleConfig={moduleConfig}
                            selectedModule={selectedModule}
                            getPermissionStatus={getPermissionStatus}
                            handlePermissionChange={handlePermissionChange}
                            isRoleAllowAll={isRoleAllowAll}
                            onAddRole={onAddRole}
                            onEditRole={onEditRole}
                            onDeleteRole={onDeleteRole}
                            onAddSpecificPermission={onAddSpecificPermission}
                            isLoading={isLoading}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </Card>
    );
} 