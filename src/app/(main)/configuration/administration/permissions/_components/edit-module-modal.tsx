"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { usePermissionsAPI } from '@/hooks/use-permissions-api';

interface EditModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    module: {
        id: string;
        name: string; // Este es el displayName del módulo
        icon?: string;
        basePermissions: string[];
        specificPermissions: Array<{
            id: string;
            name: string;
            category: string;
            description: string;
        }>;
    } | null;
}

export function EditModuleModal({ isOpen, onClose, module }: EditModuleModalProps) {
    const [ formData, setFormData ] = useState({
        routeCode: '',         // Código de ruta (identificador del módulo)
        displayName: '',       // Nombre de interfaz (para mostrar)
        selectedActions: [] as string[], // Acciones seleccionadas
    });
    const [ isLoading, setIsLoading ] = useState(false);

    const { updateModule, createSpecificPermission, deleteSpecificPermissionByAction, getBasePermissionByModule, getAllModuleActions, getPermissionsByModule } = usePermissionsAPI();

    // Actualizar formulario cuando cambia el módulo
    useEffect(() => {
        if (module) {
            // Cargar TODAS las acciones existentes del módulo
            const allExistingActions = getAllModuleActions(module.id);

            setFormData({
                routeCode: module.id, // routeCode es el id del módulo
                displayName: module.name, // module.name es el displayName
                selectedActions: allExistingActions, // Cargar TODAS las acciones existentes
            });
        }
    }, [ module, getAllModuleActions ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!module) return;

        setIsLoading(true);
        try {
            // 1. Obtener permisos actuales del módulo
            const currentPermissions = await getPermissionsByModule(module.id);
            const existingActions = getAllModuleActions(module.id);

            // 2. Actualizar displayName y routeCode en TODOS los permisos del módulo
            await updateModule(module.id, {
                name: formData.displayName,
                routeCode: formData.routeCode,
                basePermissions: formData.selectedActions
            });

            // 3. Manejar acciones: crear nuevas o eliminar existentes
            const actionsToAdd = formData.selectedActions.filter(action => !existingActions.includes(action));
            const actionsToRemove = existingActions.filter(action => !formData.selectedActions.includes(action));

            // 4. Crear nuevos permisos para acciones marcadas que no existían
            for (const action of actionsToAdd) {
                const actionName = getActionDisplayName(action);
                const permissionName = `${actionName} ${formData.displayName}`;

                await createSpecificPermission(module.id, {
                    name: permissionName,
                    category: action,
                    description: `Permiso específico para ${actionName.toLowerCase()} ${formData.displayName}`
                });
            }

            // 5. Eliminar permisos para acciones desmarcadas
            for (const action of actionsToRemove) {
                await deleteSpecificPermissionByAction(module.id, action);
            }

            toast.success('Módulo actualizado correctamente');
            onClose();
        } catch (error) {
            toast.error('Error al actualizar el módulo');
            console.error('Error updating module:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | string[]) => {
        setFormData(prev => ({
            ...prev,
            [ field ]: value
        }));
    };

    const toggleAction = (action: string) => {
        setFormData(prev => ({
            ...prev,
            selectedActions: prev.selectedActions.includes(action)
                ? prev.selectedActions.filter(a => a !== action)
                : [ ...prev.selectedActions, action ]
        }));
    };

    const getActionDisplayName = (action: string): string => {
        const actionNames: { [ key: string ]: string } = {
            'create': 'Crear',
            'read': 'Ver',
            'update': 'Actualizar',
            'delete': 'Eliminar'
        };
        return actionNames[ action ] || action;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Módulo: {module?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Nombre de Interfaz</Label>
                        <Input
                            id="displayName"
                            value={formData.displayName}
                            onChange={(e) => handleInputChange('displayName', e.target.value)}
                            placeholder="Ej: Pagos, Clientes, Usuarios"
                            required
                        />
                        <p className="text-xs text-gray-500">
                            Se actualizará en TODOS los permisos del módulo
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="routeCode">Código de Ruta</Label>
                        <Input
                            id="routeCode"
                            value={formData.routeCode}
                            onChange={(e) => handleInputChange('routeCode', e.target.value)}
                            placeholder="Ej: payments, clients, users"
                            required
                        />
                        <p className="text-xs text-gray-500">
                            Se actualizará en TODOS los permisos del módulo
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Permisos Base del Módulo</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {[ 'create', 'read', 'update', 'delete' ].map(action => (
                                <div key={action} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`action-${action}`}
                                        checked={formData.selectedActions.includes(action)}
                                        onCheckedChange={() => toggleAction(action)}
                                    />
                                    <Label htmlFor={`action-${action}`} className="text-sm capitalize">
                                        {getActionDisplayName(action)}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">
                            Marca para crear nuevos permisos específicos. Desmarca para eliminar permisos existentes.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 