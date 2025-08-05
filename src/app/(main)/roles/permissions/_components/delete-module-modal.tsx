"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { usePermissionsAPI } from '@/hooks/use-permissions-api';
import { AlertTriangle } from 'lucide-react';

interface DeleteModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    module: {
        id: string;
        name: string;
        basePermissions: string[];
        specificPermissions: Array<{
            id: string;
            name: string;
        }>;
    } | null;
}

export function DeleteModuleModal({ isOpen, onClose, module }: DeleteModuleModalProps) {
    const [ confirmText, setConfirmText ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);

    const { deleteModule } = usePermissionsAPI();

    const handleDelete = async () => {
        if (!module) return;

        if (confirmText !== module.name) {
            toast.error('El texto de confirmación no coincide');
            return;
        }

        setIsLoading(true);
        try {
            await deleteModule(module.id);
            onClose();
            setConfirmText('');
        } catch (error) {
            toast.error('Error al eliminar el módulo');
            console.error('Error deleting module:', error);
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
                        Eliminar Módulo
                    </DialogTitle>
                    <DialogDescription>
                        Esta acción no se puede deshacer. Se eliminarán todos los permisos asociados a este módulo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                            <strong>Módulo a eliminar:</strong> {module?.name}
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                            <strong>Permisos base:</strong> {module?.basePermissions.join(', ')}
                        </p>
                        <p className="text-sm text-red-700">
                            <strong>Permisos específicos:</strong> {module?.specificPermissions.length || 0}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm">
                            Escriba <strong>{module?.name}</strong> para confirmar
                        </Label>
                        <Input
                            id="confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={`Escriba "${module?.name}"`}
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
                        disabled={isLoading || confirmText !== module?.name}
                    >
                        {isLoading ? 'Eliminando...' : 'Eliminar Módulo'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 