"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EnhancedPermissionMatrix } from "./enhanced-permission-matrix";
import { usePermissionsAPI } from "@/hooks/use-permissions-api";
import { MainContainer } from "@/components/layout/main-container";
import { HeaderActions } from "@/components/layout/header-actions";
import { ReloadButton } from "@/components/layout/reload-button";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function PermissionsPage() {
    const [ hasChanges, setHasChanges ] = useState(false);
    const [ isSaving, setIsSaving ] = useState(false);

    // Usar el hook de la API real
    const {
        roles,
        modules,
        permissionMatrix,
        isLoadingRoles,
        isLoadingModules,
        isLoadingMatrix,
        loadAllData,
        hasChanges: apiHasChanges,
        isSaving: apiIsSaving
    } = usePermissionsAPI();

    const handleReload = () => {
        loadAllData();
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            // Simular guardado en API
            await new Promise(resolve => setTimeout(resolve, 1000));
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

    // Estado de carga combinado
    const isLoading = isLoadingRoles || isLoadingModules || isLoadingMatrix;

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

            <EnhancedPermissionMatrix
                onSaveChanges={handleSaveChanges}
                onResetChanges={handleResetChanges}
                onChangesDetected={handleChangesDetected}
                hasChanges={hasChanges || apiHasChanges}
                isSaving={isSaving || apiIsSaving}
            />
        </MainContainer>
    );
} 