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
import type { Client } from "@/types/clients/client"
import { useClient } from "@/hooks/use-client"
import Can from "@/components/permission/can"
import api from "@/lib/axios"

interface ActionsCellProps {
    rowData: Client
    onEdit: (client: Client) => void;
}

export const ActionsCell: React.FC<ActionsCellProps> = ({ rowData, onEdit }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const { refreshClient } = useClient()

    const handleDelete = async () => {
        try {
            setLoading(true)
            await api.delete(`/client/${rowData.id}`)
            toast.success("Se eliminó el cliente correctamente")
            await refreshClient()
        } catch (error) {
            toast.error("Ocurrió un error al eliminar el cliente")
            console.error("Error eliminando el cliente:", error)
        } finally {
            setLoading(false)
            setShowDeleteDialog(false)
        }
    }

    return (
        <TooltipProvider>
            <div className="flex items-center justify-center gap-2">
                <Can action="editar-cliente" subject="cliente">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={() => onEdit(rowData)}
                                aria-label="Editar cliente"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar</p>
                        </TooltipContent>
                    </Tooltip>
                </Can>
                <Can action="eliminar-cliente" subject="cliente">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={() => setShowDeleteDialog(true)}
                                aria-label="Eliminar cliente"
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
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el cliente.
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