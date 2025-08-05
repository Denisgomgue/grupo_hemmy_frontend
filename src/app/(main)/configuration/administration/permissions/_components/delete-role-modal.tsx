"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { usePermissionsAPI } from '@/hooks/use-permissions-api';
import { AlertTriangle } from 'lucide-react';

interface DeleteRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: {
        id: number;
        name: string;
        description?: string;
    } | null;
}

export function DeleteRoleModal({ isOpen, onClose, role }: DeleteRoleModalProps) {
    const [ confirmText, setConfirmText ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);

    const { deleteRole } = usePermissionsAPI();

    const handleDelete = async () => {
        if (!role) return;

        if (confirmText !== role.name) {
            toast.error('El texto de confirmación no coincide');
            return;
        }

        setIsLoading(true);
        try {
            await deleteRole(role.id);
            toast.success('Rol eliminado exitosamente');
            onClose();
            setConfirmText('');
        } catch (error) {
            toast.error('Error al eliminar el rol');
            console.error('Error deleting role:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setConfirmText('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Eliminar Rol
                    </DialogTitle>
                    <DialogDescription>
                        Esta acción no se puede deshacer. Se eliminarán todos los permisos asociados a este rol.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                            <strong>Rol a eliminar:</strong> {role?.name}
                        </p>
                        {role?.description && (
                            <p className="text-sm text-red-700 mt-1">
                                <strong>Descripción:</strong> {role.description}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm">
                            Escriba <strong>{role?.name}</strong> para confirmar
                        </Label>
                        <Input
                            id="confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={`Escriba "${role?.name}"`}
                            className="border-red-200 focus:border-red-500"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading || confirmText !== role?.name}
                    >
                        {isLoading ? 'Eliminando...' : 'Eliminar Rol'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 