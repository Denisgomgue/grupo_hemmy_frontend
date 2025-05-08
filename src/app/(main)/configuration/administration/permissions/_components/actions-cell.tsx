"use client";

import React, { useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Permission } from "@/types/permissions/permission";
import api from "@/lib/axios";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { FormPermission } from "./form-permission";
import { usePermissions } from "@/hooks/usePermission";
import Can from "@/components/permission/can";
import { toast } from "sonner";

interface ActionsCellProps {
    rowData: Permission;
}

export const ActionsCell: React.FC<ActionsCellProps> = ({ rowData }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { refreshPermissions } = usePermissions();

    const handleDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/permissions/${rowData.id}`);
            toast.success("Se elimino el permiso correctamente");
            await refreshPermissions();
        } catch (error) {
            toast.error("Ocurrió un error al eliminar el permiso");
            console.error("Error eliminando el permiso:", error);
        } finally {
            setLoading(false);
            setShowDeleteDialog(false);
        }
    };

    const handleSave = async (updatedPermission: Permission) => {
        setLoading(true);
        try {
            await api.patch(`/permissions/${updatedPermission.id}`, updatedPermission);
            toast.success("Se actualizo el permiso correctamente");
            await refreshPermissions();
        } catch (error) {
            toast.error("Ocurrió un error al actualizar el permiso");
            console.error("Error actualizando el permiso:", error);
        } finally {
            setDialogOpen(false);
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Can action="editar-permiso" subject="configuracion-permiso">
                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={() => setDialogOpen(true)}
                            >
                                <FaPencilAlt />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar</p>
                        </TooltipContent>
                    </Tooltip>
                </Can>
                <Can action="eliminar-permiso" subject="configuracion-permiso">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Eliminar</p>
                        </TooltipContent>
                    </Tooltip>
                </Can>
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el permiso
                                y todos sus datos asociados.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={loading}
                                className="bg-destructive dark:bg-destructive dark:hover:bg-destructive/90 text-destructive-foreground hover:bg-destructive/90"
                            >
                                {loading ? "Eliminando..." : "Eliminar"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <FormPermission
                open={dialogOpen}
                permissionEdited={rowData}
                onSave={handleSave}
                onClose={() => setDialogOpen(false)}
                loading={loading}
            />
        </>
    );
};