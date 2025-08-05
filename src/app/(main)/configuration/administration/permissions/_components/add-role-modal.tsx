"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { usePermissionsAPI } from '@/hooks/use-permissions-api';

interface AddRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRoleCreated?: (role: any) => void;
}

export function AddRoleModal({ isOpen, onClose, onRoleCreated }: AddRoleModalProps) {
    const [ formData, setFormData ] = useState({
        name: '',
        description: '',
        allowAll: false,
        isPublic: false
    });
    const [ isLoading, setIsLoading ] = useState(false);

    const { createRole, loadRoles } = usePermissionsAPI();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('El nombre del rol es requerido');
            return;
        }

        setIsLoading(true);
        try {
            const newRole = await createRole({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                allowAll: formData.allowAll,
                isPublic: formData.isPublic,
                role_has_permissions: [] // Array vacío por defecto - se pueden agregar permisos después
            });

            toast.success('Rol creado exitosamente');

            // Recargar roles para actualizar la lista
            await loadRoles();

            // Limpiar formulario
            setFormData({
                name: '',
                description: '',
                allowAll: false,
                isPublic: false
            });

            // Cerrar modal
            onClose();

            // Notificar al componente padre
            if (onRoleCreated) {
                onRoleCreated(newRole);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al crear el rol';
            toast.error(errorMessage);
            console.error('Error creating role:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [ field ]: value
        }));
    };

    const handleClose = () => {
        // Limpiar formulario al cerrar
        setFormData({
            name: '',
            description: '',
            allowAll: false,
            isPublic: false
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Rol</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Rol *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Ingrese el nombre del rol"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Descripción del rol (opcional)"
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="allowAll"
                            checked={formData.allowAll}
                            onCheckedChange={(checked) => handleInputChange('allowAll', checked as boolean)}
                            disabled={isLoading}
                        />
                        <Label htmlFor="allowAll" className="text-sm">
                            Super Administrador (acceso total)
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isPublic"
                            checked={formData.isPublic}
                            onCheckedChange={(checked) => handleInputChange('isPublic', checked as boolean)}
                            disabled={isLoading}
                        />
                        <Label htmlFor="isPublic" className="text-sm">
                            Rol público
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !formData.name.trim()}
                        >
                            {isLoading ? 'Creando...' : 'Crear Rol'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 