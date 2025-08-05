"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Download,
    Share2
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Payment, PaymentType } from "@/types/payments/payment"
import { getPaymentStatusLabel } from "@/utils/payment-status-labels"
import { getPaymentTypeLabel } from "@/utils/payment-type-labels"
import { useCompany } from "@/hooks/use-company"
import { getDocumentInfo } from "@/utils/company-utils"
import { getTicketDetails } from "@/utils/payment-plan-utils"
import domtoimage from "dom-to-image"
import { DownloadOptionsModal } from "./download-options-modal"
import jsPDF from "jspdf"

interface PaymentProfessionalTicketProps {
    payment: Payment
}

// Funciones utilitarias compartidas
const getPlanSpeed = (payment: Payment): string => {
    if (payment.currentPlan?.speed) {
        return `${payment.currentPlan.speed} Mbps`
    }
    if (payment.client?.installations && payment.client.installations.length > 0) {
        const mainInstallation = payment.client.installations[ 0 ]
        if (mainInstallation?.plan?.speed) {
            return `${mainInstallation.plan.speed} Mbps`
        }
    }
    return 'Velocidad no especificada'
}

const getPlanName = (payment: Payment): string => {
    if (payment.currentPlan?.name) {
        return payment.currentPlan.name
    }
    if (payment.client?.installations && payment.client.installations.length > 0) {
        const mainInstallation = payment.client.installations[ 0 ]
        if (mainInstallation?.plan?.name) {
            return mainInstallation.plan.name
        }
    }
    return 'Plan no especificado'
}

const getServiceName = (payment: Payment): string => {
    if (payment.currentPlan?.service?.name) {
        return payment.currentPlan.service.name
    }
    if (payment.client?.installations && payment.client.installations.length > 0) {
        const mainInstallation = payment.client.installations[ 0 ]
        if (mainInstallation?.plan?.service?.name) {
            return mainInstallation.plan.service.name
        }
    }
    return 'Servicio de Internet'
}

const getPeriodoFormateado = (payment: Payment): string => {
    if (!payment.dueDate) return "Período actual"

    const fechaVencimiento = new Date(payment.dueDate)
    const fechaPeriodo = new Date(fechaVencimiento)
    fechaPeriodo.setMonth(fechaPeriodo.getMonth() - 1)

    return format(fechaPeriodo, "MMM yyyy", { locale: es }).toUpperCase()
}

const getIconoTipo = (tipo: PaymentType | undefined): string => {
    if (!tipo) return "📄"

    const iconos = {
        [ PaymentType.CASH ]: "💵",
        [ PaymentType.TRANSFER ]: "🏦",
        [ PaymentType.YAPE ]: "📱",
        [ PaymentType.PLIN ]: "📱",
        [ PaymentType.OTHER ]: "📄",
    }
    return iconos[ tipo ] || "📄"
}

// Componente para el contenido del ticket (reutilizable)
function TicketContent({ payment, documentInfo }: {
    payment: Payment
    documentInfo: any
}) {
    // Obtener detalles del ticket (plan, servicio, etc.)
    const ticketDetails = getTicketDetails(payment)

    // Calcular montos
    const baseAmount = Number(payment.baseAmount) || 0
    const reconnectionFee = payment.reconnection ? (Number(payment.reconnectionFee) || 10) : 0
    const discount = Number(payment.discount) || 0
    const total = (baseAmount + reconnectionFee) - discount

    return (
        <Card className="shadow-2xl border-0 bg-white relative overflow-visible" data-ticket-content style={{ width: '650px', margin: '0', padding: '0', minWidth: '650px' }}>
            <CardContent className="p-0 relative z-10">
                {/* Header con gradiente mejorado */}
                <div style={{
                    background: 'linear-gradient(135deg, #5E3583 0%, #9333ea 50%, #7c3aed 100%)',
                    color: 'white',
                    padding: '20px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Elementos decorativos */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-20%',
                        width: '200px',
                        height: '200px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'rotate(45deg)'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        bottom: '-30%',
                        left: '-10%',
                        width: '150px',
                        height: '150px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '50%'
                    }}></div>

                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex-1">
                            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                                {documentInfo?.name.toUpperCase() || "GRUPO HEMMY E.I.R.L."}
                            </h1>
                            <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
                                Nacimos para innovar
                            </p>
                        </div>
                        <div className="text-right text-xs flex flex-col justify-end">
                            {documentInfo?.ruc && (
                                <div className="flex items-center justify-end gap-1 mb-1">
                                    <span>RUC:</span>
                                    <span className="font-mono font-bold">{documentInfo.ruc}</span>
                                </div>
                            )}
                            {documentInfo?.address && (
                                <div className="flex items-center justify-end gap-1 mb-1">
                                    <span>{documentInfo.address}</span>
                                </div>
                            )}
                            {documentInfo?.phone && (
                                <div className="flex items-center justify-end gap-1 mb-1">
                                    <span>{documentInfo.phone}</span>
                                </div>
                            )}
                            {documentInfo?.email && (
                                <div className="flex items-center justify-end gap-1 mb-0">
                                    <span>{documentInfo.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Título del Documento y Número */}
                <div style={{
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                    padding: '16px',
                    borderBottom: '2px solid #e9d5ff',
                    position: 'relative'
                }}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', margin: 0 }}>
                            COMPROBANTE DE PAGO
                        </h2>
                    </div>
                    <p style={{ fontSize: '22px', fontFamily: 'monospace', fontWeight: 'bold', color: '#5E3583', margin: '0 0 6px 0', letterSpacing: '2px' }}>
                        {payment.code}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>{payment.paymentDate ? format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: es }) : format(new Date(), "dd/MM/yyyy", { locale: es })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>🕐</span>
                            <span>{payment.paymentDate ? format(new Date(payment.paymentDate), "HH:mm:ss", { locale: es }) : format(new Date(), "HH:mm:ss", { locale: es })}</span>
                        </div>
                    </div>
                </div>

                {/* Body - Contenido principal */}
                <div style={{ padding: '20px', color: '#374151', minHeight: '300px' }}>
                    {/* Datos del Cliente */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <h3 style={{ fontWeight: 'bold', color: '#374151', margin: 0, fontSize: '14px' }}>
                                DATOS DEL CLIENTE
                            </h3>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="font-bold text-gray-700">Nombre:</div>
                                <div className="col-span-2 font-semibold">{payment.client?.name || 'Cliente'}</div>

                                <div className="font-bold text-gray-700">Período:</div>
                                <div className="col-span-2 font-semibold text-purple-600">
                                    {getPeriodoFormateado(payment)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Detalle de Servicios */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <h3 style={{ fontWeight: 'bold', color: '#374151', margin: 0, fontSize: '14px' }}>
                                DETALLE DE SERVICIOS
                            </h3>
                        </div>

                        {/* Header de la tabla de servicios */}
                        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 border-b-2 border-purple-200 pb-2 mb-3">
                            <div className="col-span-3">SERVICIO</div>
                            <div className="col-span-6">DESCRIPCIÓN</div>
                            <div className="col-span-2 text-right">IMPORTE</div>
                        </div>

                        {/* Fila 1: Servicio de Internet */}
                        <div className="grid grid-cols-12 gap-2 text-sm border-b border-gray-100 pb-3 mb-3">
                            <div className="col-span-3">
                                <div className="font-semibold">{getServiceName(payment)}</div>
                                {ticketDetails.plan.isChange && (
                                    <Badge variant="destructive" className="text-xs mt-1">
                                        🔄 Cambio de plan
                                    </Badge>
                                )}
                            </div>
                            <div className="col-span-6">
                                <div className="font-semibold">
                                    Pago mensual - {getPlanName(payment)}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-violet-600 mt-1">
                                    <span>- {getPlanSpeed(payment)} -</span>
                                </div>
                            </div>
                            <div className="col-span-2 text-right font-bold text-purple-600">
                                S/ {baseAmount.toFixed(2)}
                            </div>
                        </div>

                        {/* Fila 2: Reconexión (si aplica) */}
                        {payment.reconnection && (
                            <div className="grid grid-cols-12 gap-2 text-sm border-b border-gray-100 pb-3 mb-3">
                                <div className="col-span-3">
                                    <div className="font-semibold text-red-600">Reconexión</div>
                                </div>
                                <div className="col-span-6">
                                    <div className="text-gray-600">Cargo por reconexión</div>
                                </div>
                                <div className="col-span-2 text-right font-bold text-red-600">
                                    S/ {reconnectionFee.toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Información de Cambio de Plan */}
                    {ticketDetails.plan.isChange && ticketDetails.plan.previous && (
                        <>
                            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg">
                                <div className="text-center font-bold text-yellow-800 text-sm mb-3">
                                    🔄 CAMBIO DE PLAN REALIZADO
                                </div>
                                <div className="text-center text-xs text-yellow-700 space-y-1">
                                    <div><strong>Anterior:</strong> {ticketDetails.plan.previous.service} - {ticketDetails.plan.previous.name} ({ticketDetails.plan.previous.speed})</div>
                                    <div><strong>Nuevo:</strong> {ticketDetails.plan.current.service} - {ticketDetails.plan.current.name} ({getPlanSpeed(payment)})</div>
                                </div>
                            </div>
                            <Separator className="my-6" />
                        </>
                    )}

                    {/* Resumen de Montos */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <h3 style={{ fontWeight: 'bold', color: '#374151', margin: 0, fontSize: '14px' }}>
                                RESUMEN DE PAGO
                            </h3>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-gray-600">Servicio de Internet:</div>
                                <div className="text-right font-semibold">
                                    S/ {baseAmount.toFixed(2)}
                                </div>
                            </div>
                            {payment.reconnection && (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-600">Cargo por Reconexión:</div>
                                    <div className="text-right font-semibold text-red-600">
                                        S/ {reconnectionFee.toFixed(2)}
                                    </div>
                                </div>
                            )}
                            {discount > 0 && (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-600">Descuento Aplicado:</div>
                                    <div className="text-right font-semibold text-green-600">
                                        -S/ {discount.toFixed(2)}
                                    </div>
                                </div>
                            )}
                            <Separator className="my-3" />
                            <div className="grid grid-cols-2 gap-2 text-base font-bold text-gray-700">
                                <div>TOTAL PAGADO:</div>
                                <div className="text-right text-[#5E3583] text-lg">
                                    S/ {total.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Información de Pago */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 style={{ fontWeight: 'bold', color: '#374151', margin: 0, fontSize: '14px' }}>
                                MÉTODO DE PAGO
                            </h3>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="font-bold text-gray-700">Método:</div>
                                <div className="col-span-2 font-semibold flex items-center gap-2">
                                    <span>{getIconoTipo(payment.paymentType)}</span>
                                    <span>{getPaymentTypeLabel(payment.paymentType || PaymentType.OTHER)}</span>
                                </div>

                                <div className="font-bold text-gray-700">Referencia:</div>
                                <div className="col-span-2 font-mono font-bold text-blue-600">
                                    {payment.reference || 'Sin referencia'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer mejorado */}
                <div
                    data-ticket-footer
                    style={{
                        background: 'linear-gradient(135deg, #5E3583 0%, #7c3aed 100%)',
                        color: 'white',
                        padding: '20px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Elementos decorativos */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-20%',
                        width: '150px',
                        height: '150px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        bottom: '-30%',
                        right: '-10%',
                        width: '100px',
                        height: '100px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '50%'
                    }}></div>

                    <p style={{ margin: 0, position: 'relative', zIndex: 10 }}>
                        ¡Gracias por su pago! 🚀
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.9, position: 'relative', zIndex: 10 }}>
                        Su servicio ha sido procesado correctamente
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export function PaymentProfessionalTicket({ payment }: PaymentProfessionalTicketProps) {
    const ticketRef = useRef<HTMLDivElement>(null)
    const [ isDownloadModalOpen, setIsDownloadModalOpen ] = useState(false)
    const [ isDownloading, setIsDownloading ] = useState(false)

    // Obtener información de la empresa
    const { companyInfo, isLoadingInfo } = useCompany()

    // Obtener información formateada para documentos
    const documentInfo = companyInfo && !isLoadingInfo && typeof companyInfo === 'object' && 'id' in companyInfo ? getDocumentInfo(companyInfo as any) : null

    const handleDownload = async (format: 'image' | 'pdf') => {
        if (!ticketRef.current) return

        setIsDownloadModalOpen(false)
        setIsDownloading(true)

        setTimeout(async () => {
            try {
                if (format === 'image') {
                    await downloadAsImage()
                } else {
                    await downloadAsPDF()
                }
            } catch (error) {
                console.error('Error al descargar:', error)
            } finally {
                setIsDownloading(false)
            }
        }, 300)
    }

    const downloadAsImage = async () => {
        if (!ticketRef.current) {
            console.error('Elemento no encontrado')
            return
        }

        try {
            const element = ticketRef.current

            // Ocultar botones flotantes temporalmente
            const floatingButtons = element.querySelectorAll('.absolute')
            const originalDisplays: string[] = []
            floatingButtons.forEach((button, index) => {
                const buttonElement = button as HTMLElement
                originalDisplays[ index ] = buttonElement.style.display
                buttonElement.style.display = 'none'
            })

            const dataUrl = await domtoimage.toPng(element, {
                quality: 1.0,
                width: 650,
                height: element.scrollHeight,
                style: {
                    backgroundColor: '#ffffff',
                    overflow: 'visible',
                    margin: '0',
                    padding: '0',
                    position: 'relative',
                    left: '0',
                    top: '0',
                    minWidth: '650px',
                    minHeight: 'auto',
                    width: '650px',
                    height: 'auto',
                }
            })

            // Restaurar botones flotantes
            floatingButtons.forEach((button, index) => {
                const buttonElement = button as HTMLElement
                buttonElement.style.display = originalDisplays[ index ]
            })

            const link = document.createElement('a')
            link.href = dataUrl
            link.download = `comprobante_${payment.client?.name || 'cliente'}_${payment.code || payment.id}.png`
            link.click()
        } catch (error) {
            console.error('Error al descargar imagen:', error)
        }
    }

    const downloadAsPDF = async () => {
        if (!ticketRef.current) {
            console.error('Elemento no encontrado')
            return
        }

        try {
            const element = ticketRef.current

            // Ocultar botones flotantes temporalmente
            const floatingButtons = element.querySelectorAll('.absolute')
            const originalDisplays: string[] = []
            floatingButtons.forEach((button, index) => {
                const buttonElement = button as HTMLElement
                originalDisplays[ index ] = buttonElement.style.display
                buttonElement.style.display = 'none'
            })

            const imgData = await domtoimage.toPng(element, {
                quality: 1.0,
                width: 650,
                height: element.scrollHeight,
                style: {
                    backgroundColor: '#ffffff',
                    overflow: 'visible',
                    margin: '0',
                    padding: '0',
                    position: 'relative',
                    left: '0',
                    top: '0',
                    minWidth: '650px',
                    minHeight: 'auto',
                    width: '650px',
                    height: 'auto',
                }
            })

            // Restaurar botones flotantes
            floatingButtons.forEach((button, index) => {
                const buttonElement = button as HTMLElement
                buttonElement.style.display = originalDisplays[ index ]
            })

            // Crear una imagen temporal para obtener las dimensiones
            const img = new Image()
            img.src = imgData

            await new Promise((resolve) => {
                img.onload = () => {
                    const imgWidth = 200
                    const pageHeight = 270
                    const imgHeight = (img.height * imgWidth) / img.width

                    const pdf = new jsPDF('p', 'mm', 'a4')

                    if (imgHeight > pageHeight) {
                        const scale = pageHeight / imgHeight
                        const scaledWidth = imgWidth * scale
                        const scaledHeight = imgHeight * scale
                        const xOffset = (210 - scaledWidth) / 2

                        pdf.addImage(imgData, 'PNG', xOffset, 10, scaledWidth, scaledHeight)
                    } else {
                        const xOffset = 5
                        const yOffset = (297 - imgHeight) / 2

                        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight)
                    }

                    pdf.save(`comprobante_${payment.client?.name || 'cliente'}_${payment.code || payment.id}.pdf`)
                    resolve(true)
                }
            })
        } catch (error) {
            console.error('Error al descargar PDF:', error)
        }
    }

    const handleShare = () => {
        const companyName = documentInfo?.name.toUpperCase() || "GRUPO HEMMY EIRL"
        const companyPhone = documentInfo?.phone || "+51 800 123 4567"

        const ticketDetails = getTicketDetails(payment)
        const baseAmount = Number(payment.baseAmount) || 0
        const reconnectionFee = payment.reconnection ? (Number(payment.reconnectionFee) || 10) : 0
        const discount = Number(payment.discount) || 0
        const total = (baseAmount + reconnectionFee) - discount

        const planInfo = ticketDetails.plan.isChange
            ? `🔄 *CAMBIO DE PLAN*\n📡 ${ticketDetails.plan.current.service} - ${ticketDetails.plan.current.name}\n⚡ Velocidad: ${getPlanSpeed(payment)}\n\n📋 *Plan Anterior:* ${ticketDetails.plan.previous?.service} - ${ticketDetails.plan.previous?.name}\n📋 *Plan Nuevo:* ${ticketDetails.plan.current.service} - ${ticketDetails.plan.current.name}`
            : `📡 *SERVICIO PAGADO*\n${ticketDetails.plan.current.service} - ${ticketDetails.plan.current.name}\n⚡ Velocidad: ${getPlanSpeed(payment)}`

        const reconexionInfo = payment.reconnection ? `\n🔌 *RECONEXIÓN:* S/ ${reconnectionFee.toFixed(2)}` : ""
        const descuentoInfo = discount > 0 ? `\n💰 *DESCUENTO:* S/ ${discount.toFixed(2)}` : ""

        const mensaje = `🎫 *COMPROBANTE DE PAGO - ${companyName}*\n\n📋 Ticket: ${payment.code || payment.id}\n👤 Cliente: ${payment.client?.name || 'Cliente'}\n📅 Fecha: ${payment.paymentDate ? format(new Date(payment.paymentDate), "dd/MM/yyyy HH:mm", { locale: es }) : 'Pendiente'}\n📆 Período: ${getPeriodoFormateado(payment)}\n\n${planInfo}\n\n💰 *DESGLOSE:*\n📦 Plan: S/ ${baseAmount.toFixed(2)}${reconexionInfo}${descuentoInfo}\n\n💳 TOTAL: S/ ${total.toFixed(2)}\n🔢 Referencia: ${payment.reference || 'Sin referencia'}\n💳 Método: ${getPaymentTypeLabel(payment.paymentType || PaymentType.OTHER)}\n\n✅ Estado: ${getPaymentStatusLabel(payment.status)}\n\n🏢 ${companyName} - Servicios de Internet\n📞 ${companyPhone}\n\n¡Gracias por confiar en nosotros! 🚀`

        const numero = payment.client?.phone || ""
        if (numero) {
            window.open(`https://wa.me/+51${numero}?text=${encodeURIComponent(mensaje)}`, "_blank")
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, "_blank")
        }
    }

    return (
        <>
            {/* Comprobante visible principal */}
            <div style={{ width: '650px', margin: '0 auto', padding: '0', overflow: 'visible', position: 'relative' }}>
                {/* Botones flotantes */}
                <div className="absolute bottom-6 right-6 flex gap-3 z-50">
                    <Button
                        onClick={() => setIsDownloadModalOpen(true)}
                        className="bg-gradient-to-r from-[#5E3583] to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all duration-300"
                        size="sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                    </Button>
                    <Button
                        onClick={handleShare}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg transition-all duration-300"
                        size="sm"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartir
                    </Button>
                </div>

                {/* Comprobante visible */}
                {documentInfo && (
                    <div ref={ticketRef}>
                        <TicketContent
                            payment={payment}
                            documentInfo={documentInfo}
                        />
                    </div>
                )}
            </div>

            {/* Modal de opciones de descarga */}
            <DownloadOptionsModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                onDownload={handleDownload}
                isLoading={isDownloading}
            />
        </>
    )
} 