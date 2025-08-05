"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { User } from "@/types/users/user"
import { Button } from "@/components/ui/button"
import { Trash2, PencilLine, User as UserIcon, Mail, Phone, MapPin, Shield, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface UserDetailsDialogProps {
    user: User
    isOpen: boolean
    onClose: () => void
    onEdit: (user: User) => void
    onDelete: (userId: number) => void
}

export function UserDetailsDialog({
    user,
    isOpen,
    onClose,
    onEdit,
    onDelete
}: UserDetailsDialogProps) {
    const fullName = `${user.name || ''} ${user.surname || ''}`.trim() || user.username;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden">
                {/* Encabezado */}
                <div className="p-6 flex justify-between items-center bg-primary/90 text-white">
                    <div className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        <div className="text-lg font-semibold">Detalles del Usuario</div>
                        <div className="text-sm opacity-80">#{user.id.toString().padStart(4, "0")}</div>
                    </div>
                </div>
                {/* Información principal */}
                <div className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="font-medium">{fullName}</div>
                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                        </div>

                        {user.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{user.phone}</span>
                            </div>
                        )}

                        {user.address && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{user.address}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span>Rol: {user.role?.name || "Sin rol"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                                Creado: {user.created_at
                                    ? format(new Date(user.created_at), "dd/MM/yyyy", { locale: es })
                                    : 'N/A'
                                }
                            </span>
                        </div>

                        <div className="pt-2 border-t">
                            <div className="text-sm">
                                <span className="font-medium">Estado:</span> {user.isActive ? "Activo" : "Inactivo"}
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Verificado:</span> {user.emailVerified ? "Sí" : "No"}
                            </div>
                            {user.documentType && (
                                <div className="text-sm">
                                    <span className="font-medium">Documento:</span> {user.documentType} - {user.documentNumber || 'N/A'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Acciones */}
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <Button
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(user.id)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                    </Button>
                    <Button
                        className="bg-primary hover:bg-primary/90 text-white"
                        onClick={() => onEdit(user)}
                    >
                        <PencilLine className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 