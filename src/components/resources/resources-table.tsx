"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Edit, Trash2, MoreHorizontal, Power, PowerOff } from 'lucide-react';
import { Resource } from '@/hooks/use-resources-api';

interface ResourcesTableProps {
    resources: Resource[];
    isLoading: boolean;
    onEdit: (resource: Resource) => void;
    onDelete: (id: number) => Promise<void>;
    onToggleActive: (id: number) => Promise<void>;
}

export function ResourcesTable({
    resources,
    isLoading,
    onEdit,
    onDelete,
    onToggleActive
}: ResourcesTableProps) {
    const [ deleteDialog, setDeleteDialog ] = useState<{
        isOpen: boolean;
        resource: Resource | null;
    }>({ isOpen: false, resource: null });

    const handleDeleteClick = (resource: Resource) => {
        setDeleteDialog({ isOpen: true, resource });
    };

    const handleDeleteConfirm = async () => {
        if (deleteDialog.resource) {
            try {
                await onDelete(deleteDialog.resource.id);
                setDeleteDialog({ isOpen: false, resource: null });
            } catch (error) {
                console.error('Error deleting resource:', error);
            }
        }
    };

    const handleToggleActive = async (resource: Resource) => {
        try {
            await onToggleActive(resource.id);
        } catch (error) {
            console.error('Error toggling resource active state:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Cargando módulos...</p>
                </div>
            </div>
        );
    }

    if (resources.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay módulos</h3>
                    <p className="text-gray-500">Comienza agregando tu primer módulo del sistema.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Módulo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Código de Ruta
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descripción
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Orden
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {resources.map((resource) => (
                                <tr key={resource.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-purple-600">
                                                        {resource.displayName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {resource.displayName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {resource.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                                            {resource.routeCode}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {resource.description || (
                                                <span className="text-gray-400 italic">Sin descripción</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant="outline">
                                            {resource.orderIndex || 0}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={resource.isActive}
                                                onCheckedChange={() => handleToggleActive(resource)}
                                                className="data-[state=checked]:bg-green-600"
                                            />
                                            <Badge variant={resource.isActive ? "default" : "secondary"}>
                                                {resource.isActive ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(resource)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleActive(resource)}
                                                    className={resource.isActive ? "text-orange-600" : "text-green-600"}
                                                >
                                                    {resource.isActive ? (
                                                        <>
                                                            <PowerOff className="mr-2 h-4 w-4" />
                                                            Desactivar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Power className="mr-2 h-4 w-4" />
                                                            Activar
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteClick(resource)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dialog de confirmación de eliminación */}
            <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog({ isOpen: open, resource: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el módulo{' '}
                            <strong>{deleteDialog.resource?.displayName}</strong> y todos sus datos asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 