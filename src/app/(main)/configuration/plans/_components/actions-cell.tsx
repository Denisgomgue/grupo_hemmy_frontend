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
import type { Plan } from "@/types/plans/plan"
import { usePlans } from "@/hooks/use-plan"
import type { PlanFormData } from "@/schemas/plan-schema"
import Can from "@/components/permission/can"
import { PlanForm } from "./plan-form"
import api from "@/lib/axios"
import { IoFileTrayFullSharp } from "react-icons/io5";

interface ActionsCellProps {
    rowData: Plan
}

export const ActionsCell: React.FC<ActionsCellProps> = ({ rowData }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const { refreshPlans } = usePlans()

    const handleDelete = async () => {
        try {
            setLoading(true)
            await api.delete(`/plans/${rowData.id}`)
            toast.success("Se eliminó el plan correctamente")
            await refreshPlans()
        } catch (error) {
            toast.error("Ocurrió un error al eliminar el plan")
            console.error("Error eliminando el plan:", error)
        } finally {
            setLoading(false)
            setShowDeleteDialog(false)
        }
    }

    const handleSave = async (updatePlan: PlanFormData) => {
        setLoading(true)
        try {
            await api.patch(`/plans/${updatePlan.id}`, updatePlan)
            toast.success("Se actualizó el plan correctamente")
            await refreshPlans()
        } catch (error) {
            toast.error("Ocurrió un error al actualizar el plan")
            console.error("Error actualizando el plan:", error)
        } finally {
            setShowEditDialog(false)
            setLoading(false)
        }
    }

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                <Can action="editar-plan" subject="plan">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={() => setShowEditDialog(true)}
                                aria-label="Editar plan"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar</p>
                        </TooltipContent>
                    </Tooltip>
                </Can>
                <Can action="eliminar-plan" subject="plan">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={() => setShowDeleteDialog(true)}
                                aria-label="Eliminar plan"
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Eliminar</p>
                        </TooltipContent>
                    </Tooltip>
                </Can>
                <PlanForm
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
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el plan y todos sus datos asociados.
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