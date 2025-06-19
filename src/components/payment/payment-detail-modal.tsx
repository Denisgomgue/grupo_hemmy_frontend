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
import { PaymentPreviewTicket } from "./payment-preview-ticket"
import { CalendarIcon, CreditCardIcon, UserIcon, HashtagIcon, BanknotesIcon } from "@heroicons/react/24/outline"
import { CalendarDaysIcon, CheckCircleIcon } from "lucide-react"
import html2canvas from "html2canvas"
import { useRef } from "react"

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
    const statusColor = payment.state === PaymentStatus.PAYMENT_DAILY ? 'text-green-600' : 'text-red-600'
    const ticketRef = useRef<HTMLDivElement>(null);

    // Función para compartir por WhatsApp
    const handleShareWhatsApp = async () => {
        if (!ticketRef.current) return;
        // Generar imagen del ticket con fondo blanco
        const canvas = await html2canvas(ticketRef.current, { backgroundColor: '#fff' });
        const dataUrl = canvas.toDataURL("image/png");
        // Descargar la imagen automáticamente
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `recibo_${payment.client?.name || 'cliente'}.png`;
        link.click();
        // Preparar mensaje y número
        const numero = payment.client?.phone || "";
        const mensaje = encodeURIComponent("Hola, te envío tu recibo de pago. Por favor, adjunta la imagen descargada.");
        // Abrir WhatsApp Web
        window.open(`https://wa.me/+51${numero}?text=${mensaje}`, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl overflow-hidden">
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

                <Tabs defaultValue="details" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details" className="data-[state=active]:bg-[#8755b3] data-[state=active]:text-white">
                            Detalles
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="data-[state=active]:bg-[#8755b3] data-[state=active]:text-white">
                            Vista Previa
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                        <div className="space-y-6 p-4">

                            {/* Información del Cliente */}
                            <div className="bg-gradient-to-r from-[#5E3583]/10 to-[#9B6DD1]/10 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3 text-[#5E3583] flex items-center">
                                    <UserIcon className="h-5 w-5 mr-2" />
                                    Información del Cliente
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Nombre</p>
                                        <p className="font-semibold">{payment.client?.name || 'No disponible'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">DNI</p>
                                        <p className="font-semibold">{payment.client?.dni || 'No disponible'}</p>
                                    </div>
                                </div>
                            </div>

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
                                                <p className="font-semibold">{getPaymentTypeLabel(payment.paymentType)}</p>
                                            </div>
                                        </div>

                                        {/* fecha de vencimiento*/}
                                        <div className="flex items-center space-x-3">
                                            <CalendarDaysIcon className="h-5 w-5 text-[#5E3583]" />
                                            <div>
                                                <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
                                                <p className="font-semibold">{format(new Date(payment.dueDate || ''), "dd 'de' MMMM, yyyy", { locale: es })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <CalendarIcon className="h-5 w-5 text-[#5E3583]" />
                                            <div>
                                                <p className="text-sm text-gray-500">Fecha de Pago</p>
                                                <p className="font-semibold">
                                                    {format(new Date(payment.paymentDate), "dd 'de' MMMM, yyyy", { locale: es })}
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
                                                <p className={`font-semibold ${statusColor} text-base`}>{getPaymentStatusLabel(payment.state)}</p>
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
                                {onEdit && (
                                    <Button
                                        onClick={() => onEdit(payment)}
                                        className="bg-[#5E3583] hover:bg-[#4A2968] text-white"
                                    >
                                        Editar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="preview">
                        <div className="flex flex-col items-center space-y-4">
                            <div ref={ticketRef}>
                                <PaymentPreviewTicket payment={payment} />
                            </div>
                            <button
                                onClick={handleShareWhatsApp}
                                className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow"
                            >
                                Compartir por WhatsApp
                            </button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
} 