"use client";

import React, { useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { FormProfile } from "./form-profile";
import { Profile, ProfileDTO } from "@/types/profiles/profile";
import { useProfiles } from "@/hooks/useProfile";
import { usePermissions } from "@/hooks/usePermission";
import Can from "@/components/permission/can";
import { toast } from "sonner";

interface ActionsCellProps {
    rowData: Profile;
}

export const ActionsCell: React.FC<ActionsCellProps> = ({ rowData }) => {

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { refreshProfiles } = useProfiles();
    const { permissions } = usePermissions();

    const handleDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/roles/${rowData.id}`);
            toast.success("Se elimino el perfil correctamente")
            await refreshProfiles();
        } catch (error) {
            toast.error("Ocurrió un error al eliminar el perfil")
            console.error("Error eliminando el perfil:", error);
        } finally {
            setLoading(false);
            setShowDeleteDialog(false);
        }
    };

    const handleSave = async (updatedProfile: ProfileDTO) => {
        try {
            setLoading(true);
            await api.patch(`/roles/${rowData.id}`, updatedProfile);
            toast.success("Se actualizó el perfil correctamente")
            await refreshProfiles();
        } catch (error) {
            toast.error("Ocurrió un error al actualizar el perfil")
            console.error("Error guardando el perfil:", error);
        } finally {
            setLoading(false);
            setDialogOpen(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Can action="editar-perfil" subject="configuracion-perfil">
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
                <Can action="eliminar-perfil" subject="configuracion-perfil">
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
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el perfil
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

            <FormProfile
                open={dialogOpen}
                profileEdited={rowData}
                onSave={handleSave}
                onClose={() => setDialogOpen(false)}
                loading={loading}
                permissions={permissions}
            />
        </>
    );
};