"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { usePermissionsAPI } from '@/hooks/use-permissions-api';

interface EditRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: {
        id: number;
        name: string;
        description?: string;
        allowAll?: boolean;
        isPublic?: boolean;
    } | null;
}

export function EditRoleModal({ isOpen, onClose, role }: EditRoleModalProps) {
    const [ formData, setFormData ] = useState({
        name: '',
        description: '',
        allowAll: false,
        isPublic: false
    });
    const [ isLoading, setIsLoading ] = useState(false);

    const { updateRole } = usePermissionsAPI();

    // Actualizar formulario cuando cambia el rol
    useEffect(() => {
        if (role) {
            setFormData({
                name: role.name,
                description: role.description || '',
                allowAll: role.allowAll || false,
                isPublic: role.isPublic || false
            });
        }
    }, [role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!role) return;

        setIsLoading(true);
        try {
            await updateRole(role.id, formData);
            toast.success('Rol actualizado exitosamente');
            onClose();
        } catch (error) {
            toast.error('Error al actualizar el rol');
            console.error('Error updating role:', error);
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Rol</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Rol</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Ingrese el nombre del rol"
                            required
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
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="allowAll"
                            checked={formData.allowAll}
                            onCheckedChange={(checked) => handleInputChange('allowAll', checked as boolean)}
                        />
                        <Label htmlFor="allowAll">Super Administrador (acceso total)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isPublic"
                            checked={formData.isPublic}
                            onCheckedChange={(checked) => handleInputChange('isPublic', checked as boolean)}
                        />
                        <Label htmlFor="isPublic">Rol público</Label>
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