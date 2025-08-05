"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

interface AddModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateModule: (moduleData: {
        displayName: string;
        routeCode: string;
    }) => Promise<void>;
    existingModules?: Array<{ displayName: string; routeCode: string }>;
}

export function AddModuleModal({ isOpen, onClose, onCreateModule, existingModules = [] }: AddModuleModalProps) {
    const [ formData, setFormData ] = useState({
        displayName: '',
        routeCode: ''
    });
    const [ isSubmitting, setIsSubmitting ] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [ field ]: value
        }));
    };

    const validateForm = () => {
        if (!formData.displayName.trim()) {
            toast.error('El nombre del módulo es requerido');
            return false;
        }

        if (!formData.routeCode.trim()) {
            toast.error('El código de ruta es requerido');
            return false;
        }

        // Validar que el displayName sea único
        const displayNameExists = existingModules.some(
            module => module.displayName.toLowerCase() === formData.displayName.trim().toLowerCase()
        );
        if (displayNameExists) {
            toast.error('Ya existe un módulo con ese nombre');
            return false;
        }

        // Validar que el routeCode sea único
        const routeCodeExists = existingModules.some(
            module => module.routeCode.toLowerCase() === formData.routeCode.trim().toLowerCase()
        );
        if (routeCodeExists) {
            toast.error('Ya existe un módulo con ese código de ruta');
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
            await onCreateModule({
                displayName: formData.displayName.trim(),
                routeCode: formData.routeCode.trim()
            });

            // Limpiar formulario
            setFormData({
                displayName: '',
                routeCode: ''
            });

            onClose();
        } catch (error) {
            console.error('Error creating module:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                displayName: '',
                routeCode: ''
            });
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-purple-600" />
                        Agregar Nuevo Módulo
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Nombre del Módulo *</Label>
                        <Input
                            id="displayName"
                            value={formData.displayName}
                            onChange={(e) => handleInputChange('displayName', e.target.value)}
                            placeholder="Ej: Gestión de Clientes"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="routeCode">Código de Ruta *</Label>
                        <Input
                            id="routeCode"
                            value={formData.routeCode}
                            onChange={(e) => handleInputChange('routeCode', e.target.value)}
                            placeholder="Ej: clients"
                            disabled={isSubmitting}
                        />
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
                            <Plus className="h-4 w-4 mr-2" />
                            {isSubmitting ? 'Creando...' : 'Crear Módulo'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 