"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Payment, PaymentStatus } from "@/types/payments/payment"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getPaymentStatusLabel } from "@/utils/payment-status-labels"
import { getPaymentTypeLabel } from "@/utils/payment-type-labels"
import { PaymentProfessionalTicket } from "@/components/payment/payment-professional-ticket"
import { CalendarIcon, CreditCardIcon, UserIcon, HashtagIcon, BanknotesIcon } from "@heroicons/react/24/outline"
import { CalendarDaysIcon, CheckCircleIcon } from "lucide-react"

interface PaymentDetailModalProps {
    isOpen: boolean
    payment: Payment
    onClose: () => void
    onEdit?: (payment: Payment) => void
    onDelete?: (payment: Payment) => void
}

export function PaymentDetailModal({
    isOpen,
    payment,
    onClose,
    onEdit,
    onDelete
}: PaymentDetailModalProps) {
    const statusColor = payment.status === PaymentStatus.PAYMENT_DAILY ? 'text-green-600' : 'text-red-600'

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                {/* Degradado SVG decorativo superior */}
                <div className="absolute top-0 left-0 w-full h-2">
                    <svg width="100%" height="8" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#5E3583' }} />
                                <stop offset="50%" style={{ stopColor: '#7B4BA7' }} />
                                <stop offset="100%" style={{ stopColor: '#9B6DD1' }} />
                            </linearGradient>
                        </defs>
                        <rect width="100%" height="8" fill="url(#headerGradient)" />
                    </svg>
                </div>

                <DialogHeader className="relative">
                    <DialogTitle className="text-2xl font-bold text-[#5E3583]">Detalles del Pago</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Información detallada del pago seleccionado
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details" className="mt-4 flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                        <TabsTrigger value="details" className="data-[state=active]:bg-[#8755b3] data-[state=active]:text-white">
                            Detalles
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="data-[state=active]:bg-[#8755b3] data-[state=active]:text-white">
                            Vista Previa
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(90vh-120px)">
                        <TabsContent value="details" className="h-full">
                            <div className="space-y-6 p-4">

                                

                                {/* Estado del Pago con diseño mejorado */}
                                <div className="bg-gradient-to-r from-[#b466f8]/10 to-[#5c14ad]/10 rounded-lg p-4">

                                    <div className="flex items-center space-x-3">
                                        <CreditCardIcon className="h-5 w-5 text-[#5E3583]" />
                                        <h3 className="text-lg font-semibold mb-2 text-[#5E3583]">Información del Pago</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Información del Pago */}
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <BanknotesIcon className="h-5 w-5 text-[#5E3583]" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Monto</p>
                                                    <p className="font-semibold">S/ {Number(payment.amount).toFixed(2)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <CreditCardIcon className="h-5 w-5 text-[#5E3583]" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Método de Pago</p>
                                                    <p className="font-semibold">{payment.paymentType ? getPaymentTypeLabel(payment.paymentType) : 'No definido'}</p>
                                                </div>
                                            </div>

                                            {/* fecha de vencimiento*/}
                                            <div className="flex items-center space-x-3">
                                                <CalendarDaysIcon className="h-5 w-5 text-[#5E3583]" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
                                                    <p className="font-semibold">{payment.dueDate ? format(new Date(payment.dueDate), "dd 'de' MMMM, yyyy", { locale: es }) : 'No definida'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <CalendarIcon className="h-5 w-5 text-[#5E3583]" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Fecha de Pago</p>
                                                    <p className="font-semibold">
                                                        {payment.paymentDate ? format(new Date(payment.paymentDate), "dd 'de' MMMM, yyyy", { locale: es }) : 'No pagado'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <HashtagIcon className="h-5 w-5 text-[#5E3583]" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Referencia</p>
                                                    <p className="font-semibold">{payment.reference || 'Sin referencia'}</p>
                                                </div>
                                            </div>

                                            {/* Estado del Pago */}
                                            <div className="flex items-center space-x-3">
                                                <CheckCircleIcon className="h-5 w-5 text-[#5E3583]" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Estado</p>
                                                    <p className={`font-semibold ${statusColor} text-base`}>{getPaymentStatusLabel(payment.status)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    {onDelete && (
                                        <Button
                                            onClick={() => onDelete(payment)}
                                            variant="destructive"
                                            className="bg-red-500 hover:bg-red-600"
                                        >
                                            Eliminar
                                        </Button>
                                    )}
                                    {/* TODO: Implementar funcionalidad de edición cuando sea requerida
                                    {onEdit && (
                                        <Button
                                            onClick={() => onEdit(payment)}
                                            className="bg-[#5E3583] hover:bg-[#4A2968] text-white"
                                        >
                                            Editar
                                        </Button>
                                    )}
                                    */}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="preview" className="h-full">
                            <div className="h-full p-4 overflow-y-auto flex justify-center">
                                <PaymentProfessionalTicket payment={payment} />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
} 