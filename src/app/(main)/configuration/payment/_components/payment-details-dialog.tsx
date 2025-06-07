"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Payment } from "@/types/payments/payment"
import { Button } from "@/components/ui/button"
import { Trash2, PencilLine } from "lucide-react"

interface PaymentDetailsDialogProps {
    payment: Payment
    isOpen: boolean
    onClose: () => void
    onEdit: (payment: Payment) => void
    onDelete: (paymentId: string) => void
}

export function PaymentDetailsDialog({
    payment,
    isOpen,
    onClose,
    onEdit,
    onDelete
}: PaymentDetailsDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-br from-[#3A416F] to-[#4A517F]">
                {/* Encabezado */}
                <div className="p-6 flex justify-between items-center bg-[#3A416F]/90 text-white">
                    <div className="flex items-center gap-2">
                        <div className="text-lg font-semibold">Detalles del Pago</div>
                        <div className="text-sm opacity-80">#{payment.id.toString().padStart(4, "0")}</div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">
                        Pagado
                    </div>
                </div>

                {/* Monto y Fecha */}
                <div className="p-6 bg-gradient-to-b from-[#3A416F]/80 to-[#4A517F]/80 text-white">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-2xl font-bold">
                            S/. {payment.amount.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <div className="text-sm">{format(new Date(payment.paymentDate), "dd/MM/yyyy")}</div>
                        </div>
                    </div>
                </div>

                {/* Información del Cliente */}
                <div className="p-6 bg-white">
                    <div className="grid gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-[#3A416F] mb-4">Información del Cliente</h3>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-[#3A416F]/10 flex items-center justify-center text-[#3A416F] font-semibold">
                                        {payment.client.name[ 0 ]}{payment.client.lastName[ 0 ]}
                                    </div>
                                    <div className="ml-3">
                                        <div className="font-medium text-gray-900">{payment.client.name} {payment.client.lastName}</div>
                                        <div className="text-sm text-gray-500">DNI: {payment.client.dni}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-[#3A416F] mb-4">Detalles de la Transacción</h3>
                            <div className="grid gap-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Referencia</span>
                                    <span className="font-medium text-gray-900">{payment.reference || "N/A"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Plan</span>
                                    <span className="font-medium text-gray-900">{payment.client.plan?.name || "Plan básico"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Registrado</span>
                                    <span className="font-medium text-gray-900">{format(new Date(payment.created_At), "dd/MM/yyyy", { locale: es })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <Button
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(payment.id.toString())}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                    </Button>
                    <Button
                        className="bg-[#3A416F] hover:bg-[#4A517F] text-white"
                        onClick={() => onEdit(payment)}
                    >
                        <PencilLine className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 