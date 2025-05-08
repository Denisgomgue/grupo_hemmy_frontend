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
import type { Service } from "@/types/services/service"
import { useServices } from "@/hooks/use-service"
import type { ServicesFormData } from "@/schemas/services-shema"
import Can from "@/components/permission/can"
import { ServiceForm } from "./service-form"
import api from "@/lib/axios"


interface ActionsCellProps {
    rowData: Service
}

export const ActionsCell: React.FC<ActionsCellProps> = ({ rowData }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const { refreshService } = useServices()

    const handleDelete = async () => {
        try {
            setLoading(true)
            await api.delete(`/services/${rowData.id}`)
            toast.success("Se eliminó el servicio correctamente")
            await refreshService()
        } catch (error) {
            toast.error("Ocurrió un error al eliminar el servicio")
            console.error("Error eliminando el servicio:", error)
        } finally {
            setLoading(false)
            setShowDeleteDialog(false)
        }
    }

    const handleSave = async (updateService: ServicesFormData) => {
        setLoading(true)
        try {
            await api.patch(`/services/${updateService.id}`, updateService)
            toast.success("Se actualizó el servicio correctamente")
            await refreshService()
        } catch (error) {
            toast.error("Ocurrió un error al actualizar el servicio")
            console.error("Error actualizando el servicio:", error)
        } finally {
            setShowEditDialog(false)
            setLoading(false)
        }
    }

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <Can action="editar-servicio" subject="servicio">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={() => setShowEditDialog(true)}
                                aria-label="Editar servicio"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar</p>
                        </TooltipContent>
                    </Tooltip>
                </Can>
                <Can action="eliminar-servicio" subject="servicio">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={() => setShowDeleteDialog(true)}
                                aria-label="Eliminar servicio"
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Eliminar</p>
                        </TooltipContent>
                    </Tooltip>
                </Can>
                <ServiceForm
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
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el servicio y todos sus datos asociados.
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