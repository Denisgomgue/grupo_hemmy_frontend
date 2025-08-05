"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MainContainer } from "@/components/layout/main-container";
import { HeaderActions } from "@/components/layout/header-actions";
import { ReloadButton } from "@/components/layout/reload-button";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { usePermissionsAPI } from "@/hooks/use-permissions-api";
import { useResourcesAPI } from "@/hooks/use-resources-api";
import { PermissionsMatrix } from "./_components/permissions-matrix";
import { EditRoleModal } from "./_components/edit-role-modal";
import { DeleteRoleModal } from "./_components/delete-role-modal";
import { AddRoleModal } from "./_components/add-role-modal";
import { PermissionsSummaryCards } from "./_components/permissions-summary-cards";

export default function Page() {
    const [ selectedModule, setSelectedModule ] = useState('payments');
    const [ hasChanges, setHasChanges ] = useState(false);
    const [ isSaving, setIsSaving ] = useState(false);

    // Estados para modales
    const [ editRoleModal, setEditRoleModal ] = useState<{ isOpen: boolean; role: any }>({ isOpen: false, role: null });
    const [ deleteRoleModal, setDeleteRoleModal ] = useState<{ isOpen: boolean; role: any }>({ isOpen: false, role: null });
    const [ addRoleModal, setAddRoleModal ] = useState<{ isOpen: boolean }>({ isOpen: false });

    // Usar el hook de la API de permisos
    const {
        roles,
        modules,
        permissionMatrix: apiPermissionMatrix,
        permissionsByResource,
        isLoadingRoles,
        isLoadingModules,
        isLoadingMatrix,
        isLoadingResourcePermissions,
        updateMatrixPermission,
        getMatrixPermissionStatus,
        updatePermissionMatrix,
        loadPermissionsByResource,
        hasChanges: apiHasChanges,
        isSaving: apiIsSaving,
        setHasChanges: setApiHasChanges,
        // Lógica de allowAll
        isRoleAllowAll,
        isRoleEditable,
        isRoleDeletable,
        getMatrixPermissionStatusWithAllowAll,
        updateMatrixPermissionWithAllowAll,
        // Funciones de módulos
        createModule,
        loadAllData
    } = usePermissionsAPI();

    // Usar el hook de la API de recursos
    const { resources, isLoading: isLoadingResources } = useResourcesAPI();

    // Establecer el primer recurso como seleccionado cuando se cargan los recursos
    useEffect(() => {
        if (resources.length > 0 && !resources.find(r => r.routeCode === selectedModule)) {
            const firstActiveResource = resources.find(r => r.isActive);
            if (firstActiveResource) {
                setSelectedModule(firstActiveResource.routeCode);
            }
        }
    }, [ resources, selectedModule ]);

    // Cargar permisos del recurso seleccionado
    useEffect(() => {
        if (selectedModule && resources.length > 0) {
            loadPermissionsByResource(selectedModule);
        }
    }, [ selectedModule, resources, loadPermissionsByResource ]);

    const handleReload = () => {
        loadAllData();
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await updatePermissionMatrix(apiPermissionMatrix);
            toast.success('Permisos guardados correctamente');
            setHasChanges(false);
        } catch (error) {
            toast.error('Error al guardar permisos');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetChanges = () => {
        setHasChanges(false);
        toast.info('Cambios restablecidos');
    };

    const handleChangesDetected = (hasChanges: boolean) => {
        setHasChanges(hasChanges);
    };

    const handlePermissionChange = (roleName: string, module: string, permission: string, granted: boolean) => {
        updateMatrixPermissionWithAllowAll(roleName, module, permission, granted);
    };

    const getPermissionStatus = (roleName: string, module: string, permission: string) => {
        return getMatrixPermissionStatusWithAllowAll(roleName, module, permission);
    };

    // Funciones para acciones de roles
    const handleAddRole = () => {
        setAddRoleModal({ isOpen: true });
    };

    const handleEditRole = (roleName: string) => {
        if (isRoleAllowAll(roleName)) {
            toast.warning('No se puede editar el Super Administrador');
            return;
        }
        const role = roles.find(r => r.name === roleName);
        if (role) {
            setEditRoleModal({ isOpen: true, role });
        }
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
    };

    const handleAddBasePermission = () => {
        toast.info('Función de agregar permiso base en desarrollo');
    };

    const handleAddSpecificPermission = () => {
        toast.info('Función de agregar permiso específico en desarrollo');
    };

    // Estado de carga combinado
    const isLoading = isLoadingRoles || isLoadingModules || isLoadingMatrix || isLoadingResources || isLoadingResourcePermissions;

    // Calcular estadísticas para las tarjetas de resumen
    const permissionsSummary = {
        totalRoles: roles.length,
        totalResources: resources.length,
        activeRoles: roles.filter(r => !isRoleAllowAll(r.name)).length,
        inactiveRoles: 0 // Por ahora 0, se puede ajustar según la lógica de negocio
    };

    // Obtener permisos del recurso seleccionado
    const selectedResourcePermissions = permissionsByResource[ selectedModule ] || [];

    return (
        <MainContainer>
            <HeaderActions title="Gestión de Permisos Granular">
                <div className="flex items-center gap-4">
                    <ReloadButton
                        onClick={handleReload}
                        isLoading={isLoading}
                    />
                    <Button
                        variant="outline"
                        onClick={handleResetChanges}
                        disabled={!hasChanges}
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restablecer
                    </Button>

                    <Button
                        onClick={handleSaveChanges}
                        disabled={!hasChanges || isSaving}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </HeaderActions>

            {/* Summary Cards */}
            <PermissionsSummaryCards
                summary={permissionsSummary}
                isLoading={isLoading}
            />

            {/* Permissions Matrix */}
            <PermissionsMatrix
                roles={roles}
                modules={resources} // Cambiar modules por resources
                selectedModule={selectedModule}
                onModuleChange={setSelectedModule}
                getPermissionStatus={getPermissionStatus}
                handlePermissionChange={handlePermissionChange}
                isRoleAllowAll={isRoleAllowAll}
                onAddRole={handleAddRole}
                onEditRole={handleEditRole}
                onDeleteRole={handleDeleteRole}
                onAddBasePermission={handleAddBasePermission}
                onAddSpecificPermission={handleAddSpecificPermission}
                isLoading={isLoading}
                resourcePermissions={selectedResourcePermissions}
            />

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

            <AddRoleModal
                isOpen={addRoleModal.isOpen}
                onClose={() => setAddRoleModal({ isOpen: false })}
                onRoleCreated={(newRole) => {
                    // El modal ya recarga los roles automáticamente
                    console.log('Nuevo rol creado:', newRole);
                }}
            />
        </MainContainer>
    );
} 