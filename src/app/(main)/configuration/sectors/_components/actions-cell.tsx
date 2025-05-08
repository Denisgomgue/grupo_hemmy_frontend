import type React from "react"
import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { Sector } from "@/types/sectors/sector"
import { useSectors } from "@/hooks/use-sector"
import type { SectorsFormData } from "@/schemas/sectors-schema"
import Can from "@/components/permission/can"
import { SectorForm } from "./sector-form"
import api from "@/lib/axios"
import { IoFileTrayFullSharp } from "react-icons/io5";

interface ActionsCellProps {
    rowData: Sector
}

export const ActionsCell: React.FC<ActionsCellProps> = ({ rowData }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const { refreshSector } = useSectors()

    const handleDelete = async () => {
        try {
            setLoading(true)
            await api.delete(`/sectors/${rowData.id}`)
            toast.success("Se eliminó el sector correctamente")
            await refreshSector()
        } catch (error) {
            toast.error("Ocurrió un error al eliminar el sector")
            console.error("Error eliminando el sector:", error)
        } finally {
            setLoading(false)
            setShowDeleteDialog(false)
        }
    }

    const handleSave = async (updateSector: SectorsFormData) => {
        // console.log(updateSector)
        setLoading(true)
        try {
            await api.patch(`/sectors/${updateSector.id}`, updateSector)
            toast.success("Se actualizó el sector correctamente")
            await refreshSector()
        } catch (error) {
            toast.error("Ocurrió un error al actualizar el sector")
            console.error("Error actualizando el sector:", error)
        } finally {
            setShowEditDialog(false)
            setLoading(false)
        }
    }

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <Can action="editar-sector" subject="sector">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={() => setShowEditDialog(true)}
                                aria-label="Editar sector"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar</p>
                        </TooltipContent>
                    </Tooltip>
                </Can>
                <Can action="eliminar-sector" subject="sector">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={() => setShowDeleteDialog(true)}
                                aria-label="Eliminar sector"
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Eliminar</p>
                        </TooltipContent>
                    </Tooltip>
                </Can>
                <SectorForm
                    open={showEditDialog}
                    isEdit={showEditDialog ? rowData : null}
                    onSave={handleSave}
                    onClose={() => setShowEditDialog(false)}
                    loading={loading}
                />

                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el sector.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={loading}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {loading ? "Eliminando..." : "Eliminar"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </TooltipProvider>
    )
}