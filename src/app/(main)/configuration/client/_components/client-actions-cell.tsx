"use client"

import type React from "react"
import { useState } from "react"
import { Pencil, Trash2, Settings, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import api from "@/lib/axios"

interface ClientActionsCellProps {
    rowData: Client
    onEdit: (client: Client) => void;
    onDelete: (clientId: string) => void;
    onAssignEquipment?: (client: Client) => void;
}

export const ClientActionsCell: React.FC<ClientActionsCellProps> = ({
    rowData,
    onEdit,
    onDelete,
    onAssignEquipment
}) => {
    const [ showDeleteDialog, setShowDeleteDialog ] = useState(false)
    const [ loading, setLoading ] = useState(false)
    const { refreshClient } = useClient()

    const handleDelete = async () => {
        try {
            setLoading(true)
            await api.delete(`/client/${rowData.id}`)
            toast.success("Cliente eliminado correctamente")
            await refreshClient()
        } catch (error) {
            toast.error("Error al eliminar el cliente")
            console.error("Error eliminando el cliente:", error)
        } finally {
            setLoading(false)
            setShowDeleteDialog(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => onEdit(rowData)}
                title="Editar cliente"
            >
                <Pencil className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                onClick={() => onAssignEquipment?.(rowData)}
                title="Registrar equipos"
            >
                {/* ICONO DE EQUIPOS */}
                <Monitor className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                onClick={() => setShowDeleteDialog(true)}
                title="Eliminar cliente"
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente "{rowData.name} {rowData.lastName}".
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
    )
} 