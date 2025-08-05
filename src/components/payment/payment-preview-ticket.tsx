"use client"

import { Payment } from "@/types/payments/payment"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getPaymentStatusLabel } from "@/utils/payment-status-labels"
import { getPaymentTypeLabel } from "@/utils/payment-type-labels"
import { QRCodeSVG } from 'qrcode.react'
import { ShareIcon } from "@heroicons/react/24/outline"

interface PaymentPreviewTicketProps {
    payment: Payment
}

export function PaymentPreviewTicket({ payment }: PaymentPreviewTicketProps) {
    const ticketNumber = payment.code || `PG-FF${String(payment.id).padStart(4, '0')}-0001`

    return (
        <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
         
            
            
            {/* posicionar el logo en el centro */}
            <div className="flex justify-center">
                <img
                    src="/logos/logo.png"
                    alt="Logo"
                    className="w-8 h-8 object-contain"
                />
            </div>
            {/* Encabezado del ticket */}
            <div className="bg-[#5E3583] p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        {/* <img
                            src="/logos/logo.png"
                            alt="Logo"
                            className="w-8 h-8 object-contain"
                        /> */}
                        <div>
                            <h2 className="text-white text-lg font-medium">{ticketNumber}</h2>
                            <p className="text-white/80 text-sm">Grupo Hemmy</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white/80 text-sm">RECIBO</p>
                        <p className="text-white text-xl font-semibold">
                            S/ {Number(payment.amount).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="p-6 space-y-6">
                
                {/* Detalles del plan del cliente */}
                <div className="space-y">
                    <div className="flex justify-center">
                        {/* <span className="text-gray-500 uppercase text-sm">Plan</span> */}
                        <span className="text-violet-900 text-lg font-bold">{payment.client.plan?.name}</span>
                    </div>
                </div>
                {/* Detalles de pago */}
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-gray-500 uppercase text-sm">Fecha</span>
                        <span className="text-gray-900">
                            {format(new Date(payment.paymentDate), "dd-MM-yyyy", { locale: es })}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500 uppercase text-sm">Método de pago</span>
                        <span className="text-gray-900">{getPaymentTypeLabel(payment.paymentType)}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500 uppercase text-sm">Estado</span>
                        <span className={payment.state === 'PAYMENT_DAILY' ? 'text-green-500' : 'text-red-500'}>
                            {getPaymentStatusLabel(payment.state)}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500 uppercase text-sm">Referencia</span>
                        <span className="text-gray-900">{payment.reference || '-'}</span>
                    </div>
                </div>

                {/* Separador con círculos */}
                <div className="relative">
                    <div className="absolute left-[-35px] top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-full"></div>
                    <div className="border-t-2 border-dashed border-violet-200 my-6"></div>
                    <div className="absolute right-[-35px] top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-full"></div>
                </div>

                {/* Información del cliente */}
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-gray-500 uppercase text-sm">Cliente</span>
                        <span className="text-gray-900">{payment.client?.name}</span>
                    </div>

                </div>

                {/* QR Code */}
                {/* <div className="flex justify-center py-4">
                    <QRCodeSVG
                        value={`GRUPO-HEMMY-PAYMENT-${payment.id}-${payment.code}`}
                        size={140}
                        level="M"
                        includeMargin={false}
                    />
                </div> */}

                {/* Validez */}
                {/* <div className="text-center text-sm text-gray-500">
                    Válido hasta: {format(new Date(payment.created_At), "dd/MM/yyyy", { locale: es })}
                </div> */}
            </div>

            {/* Pie del ticket con diseño SVG */}
            <div className="relative">
                <svg className="w-full h-12" viewBox="0 0 400 48" preserveAspectRatio="none">
                    {/* <path
                        d="M0,0 L400,0 L400,24 C300,40 100,40 0,24 L0,0 Z"
                        fill="#5E3583"
                        fillOpacity="0.1"
                    /> */}
                    <path
                        d="M0,48 L400,48 L400,0 C300,1 100,8 0,4 L0,8 Z"
                        fill="#5E3583"
                        fillOpacity="0.8"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-violet-100 text-sm">¡Gracias por su pago!</p>
                </div>
            </div>
        </div>
    )
} 