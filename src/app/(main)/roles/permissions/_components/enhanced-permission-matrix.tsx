"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Shield, Settings, Plus, Eye, EyeOff, CheckCircle, XCircle, Edit, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissionsAPI } from '@/hooks/use-permissions-api';
import { EditRoleModal } from './edit-role-modal';
import { DeleteRoleModal } from './delete-role-modal';
import { EditModuleModal } from './edit-module-modal';
import { DeleteModuleModal } from './delete-module-modal';
import { AddModuleModal } from './add-module-modal';

interface EnhancedPermissionMatrixProps {
    onSaveChanges?: () => void;
    onResetChanges?: () => void;
    onChangesDetected?: (hasChanges: boolean) => void;
    hasChanges?: boolean;
    isSaving?: boolean;
}

export function EnhancedPermissionMatrix({
    onSaveChanges,
    onResetChanges,
    onChangesDetected,
    hasChanges = false,
    isSaving = false
}: EnhancedPermissionMatrixProps) {
    const [ selectedModule, setSelectedModule ] = useState('payments');
    const [ selectedRole, setSelectedRole ] = useState('admin');
    const [ openRoleMenu, setOpenRoleMenu ] = useState<string | null>(null);
    const [ openModuleMenu, setOpenModuleMenu ] = useState<string | null>(null);

    // Estados para modales
    const [ editRoleModal, setEditRoleModal ] = useState<{ isOpen: boolean; role: any }>({ isOpen: false, role: null });
    const [ deleteRoleModal, setDeleteRoleModal ] = useState<{ isOpen: boolean; role: any }>({ isOpen: false, role: null });
    const [ editModuleModal, setEditModuleModal ] = useState<{ isOpen: boolean; module: any }>({ isOpen: false, module: null });
    const [ deleteModuleModal, setDeleteModuleModal ] = useState<{ isOpen: boolean; module: any }>({ isOpen: false, module: null });
    const [ addModuleModal, setAddModuleModal ] = useState<{ isOpen: boolean }>({ isOpen: false });

    // Usar el hook de la API
    const {
        roles,
        modules,
        permissionMatrix: apiPermissionMatrix,
        isLoadingRoles,
        isLoadingModules,
        isLoadingMatrix,
        updateMatrixPermission,
        getMatrixPermissionStatus,
        updatePermissionMatrix,
        hasChanges: apiHasChanges,
        isSaving: apiIsSaving,
        setHasChanges,
        // Lógica de allowAll
        isRoleAllowAll,
        isRoleEditable,
        isRoleDeletable,
        getMatrixPermissionStatusWithAllowAll,
        updateMatrixPermissionWithAllowAll,
        // Funciones de módulos
        createModule
    } = usePermissionsAPI();

    // Obtener el módulo seleccionado
    const moduleConfig = modules.find(m => m.id === selectedModule);

    // Obtener el rol seleccionado
    const selectedRoleData = roles.find(r => r.name === selectedRole);

    // Efecto para detectar cambios
    useEffect(() => {
        if (onChangesDetected) {
            onChangesDetected(apiHasChanges);
        }
    }, [ apiHasChanges, onChangesDetected ]);

    // Efecto para cerrar menús al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.menu-container')) {
                setOpenRoleMenu(null);
                setOpenModuleMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handlePermissionChange = (roleName: string, module: string, permission: string, granted: boolean) => {
        updateMatrixPermissionWithAllowAll(roleName, module, permission, granted);
    };

    const handleSaveChanges = async () => {
        if (onSaveChanges) {
            onSaveChanges();
        } else {
            try {
                await updatePermissionMatrix(apiPermissionMatrix);
            } catch (error) {
                console.error('Error saving changes:', error);
            }
        }
    };

    const handleResetChanges = () => {
        if (onResetChanges) {
            onResetChanges();
        } else {
            // Recargar datos del backend
            window.location.reload();
        }
    };

    const handleAddRole = () => {
        // Verificar si hay un super admin
        const hasSuperAdmin = roles.some(role => isRoleAllowAll(role.name));
        if (hasSuperAdmin) {
            toast.info('Función de agregar rol en desarrollo');
        } else {
            toast.warning('Primero debe crear un Super Administrador');
        }
    };

    const handleAddModule = () => {
        setAddModuleModal({ isOpen: true });
    };

    const handleCreateModule = async (moduleData: {
        displayName: string;
        routeCode: string;
    }) => {
        try {
            // Solo enviar displayName y routeCode, sin permisos base
            const moduleDataForAPI: {
                displayName: string;
                routeCode: string;
            } = {
                displayName: moduleData.displayName,
                routeCode: moduleData.routeCode
            };

            await createModule(moduleDataForAPI);
            // El modal se cerrará automáticamente después de crear el módulo
        } catch (error) {
            console.error('Error creating module:', error);
            // El error ya se maneja en el hook
        }
    };

    const handleAddSpecificPermission = () => {
        toast.info('Función de agregar permiso específico en desarrollo');
    };

    const handleAddBasePermission = () => {
        toast.info('Función de agregar permiso base en desarrollo');
    };

    const handleRoleChange = (roleName: string) => {
        setSelectedRole(roleName);
        toast.info(`Rol cambiado a: ${roleName}`);
    };

    // Funciones para acciones de roles
    const handleEditRole = (roleName: string) => {
        if (isRoleAllowAll(roleName)) {
            toast.warning('No se puede editar el Super Administrador');
            return;
        }
        const role = roles.find(r => r.name === roleName);
        if (role) {
            setEditRoleModal({ isOpen: true, role });
        }
        setOpenRoleMenu(null);
    };

    const handleDeleteRole = (roleName: string) => {
        if (isRoleAllowAll(roleName)) {
            toast.warning('No se puede eliminar el Super Administrador');
            return;
        }
        const role = roles.find(r => r.name === roleName);
        if (role) {
            setDeleteRoleModal({ isOpen: true, role });
        }
        setOpenRoleMenu(null);
    };

    // Funciones para acciones de módulos
    const handleEditModule = (moduleId: string) => {
        const module = modules.find(m => m.id === moduleId);
        if (module) {
            setEditModuleModal({ isOpen: true, module });
        }
        setOpenModuleMenu(null);
    };

    const handleDeleteModule = (moduleId: string) => {
        const module = modules.find(m => m.id === moduleId);
        if (module) {
            setDeleteModuleModal({ isOpen: true, module });
        }
        setOpenModuleMenu(null);
    };

    // Funciones para manejar menús
    const toggleRoleMenu = (roleName: string) => {
        setOpenRoleMenu(openRoleMenu === roleName ? null : roleName);
        setOpenModuleMenu(null); // Cerrar otros menús
    };

    const toggleModuleMenu = (moduleId: string) => {
        setOpenModuleMenu(openModuleMenu === moduleId ? null : moduleId);
        setOpenRoleMenu(null); // Cerrar otros menús
    };

    const getPermissionStatus = (roleName: string, module: string, permission: string) => {
        return getMatrixPermissionStatusWithAllowAll(roleName, module, permission);
    };

    // Mostrar loading si los datos están cargando
    if (isLoadingRoles || isLoadingModules || isLoadingMatrix) {
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

    // Si no hay datos, mostrar mensaje
    if (!modules.length || !roles.length) {
        return (
            <Card className="p-6">
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No hay datos disponibles</p>
                    <Button onClick={() => window.location.reload()}>
                        Recargar
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div>
            <Card className="overflow-hidden">
                {/* Header con selector de módulos */}
                <div className="p-6 pb-0 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Módulo: {moduleConfig?.name || 'Seleccionar módulo'}
                        </h2>
                        {moduleConfig && (
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleModuleMenu(selectedModule)}
                                    className="p-2 h-8 w-8"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                                {openModuleMenu === selectedModule && (
                                    <div className="menu-container absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditModule(selectedModule)}
                                            className="w-full justify-start px-3 py-2 text-sm hover:bg-gray-50"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteModule(selectedModule)}
                                            className="w-full justify-start px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Eliminar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <div className="flex gap-1 bg-gray-50 rounded-lg p-1 overflow-x-auto">
                            <div className="flex gap-1 min-w-max">
                                {modules.map((module) => (
                                    <Button
                                        key={module.id}
                                        variant="ghost"
                                        onClick={() => setSelectedModule(module.id)}
                                        className={`
                                            px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap
                                            ${selectedModule === module.id
                                                ? "bg-white text-purple-600 shadow-sm border border-purple-200"
                                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                                            }
                                        `}
                                    >
                                        {module.name}
                                    </Button>
                                ))}
                                <Button
                                    variant="ghost"
                                    onClick={handleAddModule}
                                    className="px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-dashed border-purple-300 hover:border-purple-400 flex-shrink-0"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Agregar Módulo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

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
                            {/* Vista Desktop */}
                            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                                <div className="min-w-max">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left p-4 font-semibold text-gray-700">Rol</th>
                                                {moduleConfig?.basePermissions.map(permission => (
                                                    <th key={permission} className="text-center p-4 font-semibold text-gray-700">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span>{permission}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="text-center p-4 font-semibold text-gray-700">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleAddBasePermission}
                                                        className="text-violet-400 hover:text-violet-500 hover:bg-violet-50 border border-dashed border-violet-300 hover:border-violet-400 transition-all duration-200 text-xs opacity-70"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Nuevo Permiso
                                                    </Button>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roles.map(role => (
                                                <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 group">
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Users className="h-4 w-4 text-purple-600" />
                                                                <span className="font-medium text-gray-900">{role.name}</span>
                                                                {isRoleAllowAll(role.name) && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        Super Admin
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {!isRoleAllowAll(role.name) && (
                                                                <div className="relative">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => toggleRoleMenu(role.name)}
                                                                        className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <MoreVertical className="h-3 w-3" />
                                                                    </Button>
                                                                    {openRoleMenu === role.name && (
                                                                        <div className="menu-container absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[100px]">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleEditRole(role.name)}
                                                                                className="w-full justify-start px-2 py-1 text-xs hover:bg-gray-50"
                                                                            >
                                                                                <Edit className="h-3 w-3 mr-1" />
                                                                                Editar
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleDeleteRole(role.name)}
                                                                                className="w-full justify-start px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                            >
                                                                                <Trash2 className="h-3 w-3 mr-1" />
                                                                                Eliminar
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {moduleConfig?.basePermissions.map(permission => (
                                                        <td key={permission} className="text-center p-4">
                                                            <Checkbox
                                                                checked={getPermissionStatus(role.name, selectedModule, permission)}
                                                                onCheckedChange={(checked) =>
                                                                    handlePermissionChange(role.name, selectedModule, permission, checked as boolean)
                                                                }
                                                                disabled={isRoleAllowAll(role.name)}
                                                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="text-center p-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleAddBasePermission}
                                                            className="text-violet-400 hover:text-violet-500 hover:bg-violet-50 border border-dashed border-violet-300 hover:border-violet-400 transition-all duration-200 text-xs opacity-70"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Fila para agregar nuevo rol */}
                                            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                                <td className="p-4">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={handleAddRole}
                                                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-dashed border-purple-300 hover:border-purple-400 transition-all duration-200"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Agregar Rol
                                                    </Button>
                                                </td>
                                                {moduleConfig?.basePermissions.map(permission => (
                                                    <td key={permission} className="text-center p-4">
                                                        <div className="w-4 h-4"></div>
                                                    </td>
                                                ))}
                                                <td className="text-center p-4">
                                                    <div className="w-4 h-4"></div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Vista Mobile - Accordion */}
                            <div className="md:hidden">
                                <Accordion type="single" collapsible className="w-full">
                                    {roles.map(role => (
                                        <AccordionItem key={role.id} value={role.id.toString()}>
                                            <AccordionTrigger className="hover:no-underline">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-purple-600" />
                                                    <span className="font-medium text-gray-900">{role.name}</span>
                                                    {isRoleAllowAll(role.name) && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Super Admin
                                                        </span>
                                                    )}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-3 pt-2">
                                                    {moduleConfig?.basePermissions.map(permission => (
                                                        <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-sm font-medium text-gray-700">{permission}</span>
                                                            <Checkbox
                                                                checked={getPermissionStatus(role.name, selectedModule, permission)}
                                                                onCheckedChange={(checked) =>
                                                                    handlePermissionChange(role.name, selectedModule, permission, checked as boolean)
                                                                }
                                                                disabled={isRoleAllowAll(role.name)}
                                                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </TabsContent>

                        {/* Permisos Específicos */}
                        <TabsContent value="specific" className="mt-6">
                            {/* Vista Desktop */}
                            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                                <div className="min-w-max">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left p-4 font-semibold text-gray-700">Rol</th>
                                                {moduleConfig?.specificPermissions.map(permission => (
                                                    <th key={permission.id} className="text-center p-4 font-semibold text-gray-700">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span>{permission.name}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="text-center p-4 font-semibold text-gray-700">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleAddSpecificPermission}
                                                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-dashed border-purple-300 hover:border-purple-400 transition-all duration-200 text-xs"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Nuevo Permiso
                                                    </Button>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roles.map(role => (
                                                <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 group">
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Users className="h-4 w-4 text-purple-600" />
                                                                <span className="font-medium text-gray-900">{role.name}</span>
                                                                {isRoleAllowAll(role.name) && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        Super Admin
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {!isRoleAllowAll(role.name) && (
                                                                <div className="relative">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => toggleRoleMenu(role.name)}
                                                                        className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <MoreVertical className="h-3 w-3" />
                                                                    </Button>
                                                                    {openRoleMenu === role.name && (
                                                                        <div className="menu-container absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[100px]">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleEditRole(role.name)}
                                                                                className="w-full justify-start px-2 py-1 text-xs hover:bg-gray-50"
                                                                            >
                                                                                <Edit className="h-3 w-3 mr-1" />
                                                                                Editar
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleDeleteRole(role.name)}
                                                                                className="w-full justify-start px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                            >
                                                                                <Trash2 className="h-3 w-3 mr-1" />
                                                                                Eliminar
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {moduleConfig?.specificPermissions.map(permission => (
                                                        <td key={permission.id} className="text-center p-4">
                                                            <Checkbox
                                                                checked={getPermissionStatus(role.name, selectedModule, permission.id)}
                                                                onCheckedChange={(checked) =>
                                                                    handlePermissionChange(role.name, selectedModule, permission.id, checked as boolean)
                                                                }
                                                                disabled={isRoleAllowAll(role.name)}
                                                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="text-center p-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleAddSpecificPermission}
                                                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-dashed border-purple-300 hover:border-purple-400 transition-all duration-200 text-xs"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Fila para agregar nuevo rol */}
                                            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                                <td className="p-4">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={handleAddRole}
                                                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-dashed border-purple-300 hover:border-purple-400 transition-all duration-200"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Agregar Rol
                                                    </Button>
                                                </td>
                                                {moduleConfig?.specificPermissions.map(permission => (
                                                    <td key={permission.id} className="text-center p-4">
                                                        <div className="w-4 h-4"></div>
                                                    </td>
                                                ))}
                                                <td className="text-center p-4">
                                                    <div className="w-4 h-4"></div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Vista Mobile - Accordion */}
                            <div className="md:hidden">
                                <Accordion type="single" collapsible className="w-full">
                                    {roles.map(role => (
                                        <AccordionItem key={role.id} value={role.id.toString()}>
                                            <AccordionTrigger className="hover:no-underline">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-purple-600" />
                                                    <span className="font-medium text-gray-900">{role.name}</span>
                                                    {isRoleAllowAll(role.name) && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Super Admin
                                                        </span>
                                                    )}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-3 pt-2">
                                                    {moduleConfig?.specificPermissions.map(permission => (
                                                        <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-sm font-medium text-gray-700">{permission.name}</span>
                                                            <Checkbox
                                                                checked={getPermissionStatus(role.name, selectedModule, permission.id)}
                                                                onCheckedChange={(checked) =>
                                                                    handlePermissionChange(role.name, selectedModule, permission.id, checked as boolean)
                                                                }
                                                                disabled={isRoleAllowAll(role.name)}
                                                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </Card>

            {/* Modales */}
            <EditRoleModal
                isOpen={editRoleModal.isOpen}
                onClose={() => setEditRoleModal({ isOpen: false, role: null })}
                role={editRoleModal.role}
            />

            <DeleteRoleModal
                isOpen={deleteRoleModal.isOpen}
                onClose={() => setDeleteRoleModal({ isOpen: false, role: null })}
                role={deleteRoleModal.role}
            />

            <EditModuleModal
                isOpen={editModuleModal.isOpen}
                onClose={() => setEditModuleModal({ isOpen: false, module: null })}
                module={editModuleModal.module}
            />

            <DeleteModuleModal
                isOpen={deleteModuleModal.isOpen}
                onClose={() => setDeleteModuleModal({ isOpen: false, module: null })}
                module={deleteModuleModal.module}
            />

            <AddModuleModal
                isOpen={addModuleModal.isOpen}
                onClose={() => setAddModuleModal({ isOpen: false })}
                onCreateModule={handleCreateModule}
                existingModules={modules.map(module => ({
                    displayName: module.name,
                    routeCode: module.id
                }))}
            />
        </div>
    );
} 