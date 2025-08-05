"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, X } from 'lucide-react';
import { Resource, CreateResourceData, UpdateResourceData } from '@/hooks/use-resources-api';

interface AddResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    resource?: Resource | null; // Si se pasa, es modo edición
    createResource: (data: CreateResourceData) => Promise<Resource>;
    updateResource: (id: number, data: UpdateResourceData) => Promise<Resource>;
    checkRouteCodeExists: (routeCode: string) => boolean;
    checkDisplayNameExists: (displayName: string) => boolean;
}

export function AddResourceModal({
    isOpen,
    onClose,
    onSuccess,
    resource,
    createResource,
    updateResource,
    checkRouteCodeExists,
    checkDisplayNameExists
}: AddResourceModalProps) {
    const [ formData, setFormData ] = useState<CreateResourceData>({
        routeCode: '',
        displayName: '',
        description: '',
        isActive: true,
        orderIndex: 0
    });
    const [ isSubmitting, setIsSubmitting ] = useState(false);

    const isEditMode = !!resource;

    // Cargar datos del recurso si es modo edición
    useEffect(() => {
        if (resource) {
            setFormData({
                routeCode: resource.routeCode,
                displayName: resource.displayName,
                description: resource.description || '',
                isActive: resource.isActive,
                orderIndex: resource.orderIndex || 0
            });
        } else {
            // Resetear formulario si es modo creación
            setFormData({
                routeCode: '',
                displayName: '',
                description: '',
                isActive: true,
                orderIndex: 0
            });
        }
    }, [ resource, isOpen ]);

    const handleInputChange = (field: keyof CreateResourceData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [ field ]: value
        }));
    };

    const validateForm = (): boolean => {
        // Validar campos requeridos
        if (!formData.displayName.trim()) {
            toast.error('El nombre del módulo es requerido');
            return false;
        }

        if (!formData.routeCode.trim()) {
            toast.error('El código de ruta es requerido');
            return false;
        }

        // Validar formato del routeCode (solo letras minúsculas, números y guiones)
        if (!/^[a-z0-9-]+$/.test(formData.routeCode.trim())) {
            toast.error('El código de ruta solo puede contener letras minúsculas, números y guiones');
            return false;
        }

        // Validar unicidad del routeCode (solo en modo creación)
        if (!isEditMode && checkRouteCodeExists(formData.routeCode.trim())) {
            toast.error('Ya existe un módulo con ese código de ruta');
            return false;
        }

        // Validar unicidad del displayName (solo en modo creación)
        if (!isEditMode && checkDisplayNameExists(formData.displayName.trim())) {
            toast.error('Ya existe un módulo con ese nombre');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const cleanData = {
                routeCode: formData.routeCode.trim(),
                displayName: formData.displayName.trim(),
                description: formData.description?.trim() || undefined,
                isActive: formData.isActive,
                orderIndex: formData.orderIndex
            };

            if (isEditMode && resource) {
                await updateResource(resource.id, cleanData);
            } else {
                await createResource(cleanData);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving resource:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEditMode ? (
                            <>
                                <Edit className="h-5 w-5 text-blue-600" />
                                Editar Módulo
                            </>
                        ) : (
                            <>
                                <Plus className="h-5 w-5 text-purple-600" />
                                Agregar Nuevo Módulo
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Nombre del Módulo *</Label>
                        <Input
                            id="displayName"
                            value={formData.displayName}
                            onChange={(e) => handleInputChange('displayName', e.target.value)}
                            placeholder="Ej: Gestión de Usuarios"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500">
                            Nombre que aparecerá en la interfaz
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="routeCode">Código de Ruta *</Label>
                        <Input
                            id="routeCode"
                            value={formData.routeCode}
                            onChange={(e) => handleInputChange('routeCode', e.target.value)}
                            placeholder="Ej: user-management"
                            disabled={isSubmitting || isEditMode} // No permitir editar en modo edición
                        />
                        <p className="text-xs text-gray-500">
                            {isEditMode
                                ? 'El código de ruta no se puede modificar una vez creado'
                                : 'Identificador único del módulo (solo letras minúsculas, números y guiones)'
                            }
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Descripción opcional del módulo"
                            disabled={isSubmitting}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="orderIndex">Orden de Aparición</Label>
                        <Input
                            id="orderIndex"
                            type="number"
                            min="0"
                            value={formData.orderIndex}
                            onChange={(e) => handleInputChange('orderIndex', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500">
                            Número menor = aparece primero en la lista
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                            disabled={isSubmitting}
                        />
                        <Label htmlFor="isActive">Módulo Activo</Label>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !formData.displayName.trim() || !formData.routeCode.trim()}
                        >
                            {isEditMode ? (
                                <>
                                    <Edit className="h-4 w-4 mr-2" />
                                    {isSubmitting ? 'Actualizando...' : 'Actualizar Módulo'}
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {isSubmitting ? 'Creando...' : 'Crear Módulo'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 