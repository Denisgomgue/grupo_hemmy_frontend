import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Payment, PaymentType } from "@/types/payments/payment"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { getPaymentStatusLabel } from "@/utils/payment-status-labels"
import { FileText, Calendar, DollarSign, Share2, Phone, Eye, Trash2, PencilLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import html2canvas from 'html2canvas'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog as PreviewDialog,
    DialogContent as PreviewDialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"

export interface PaymentDetailModalProps {
    payment: Payment;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (payment: Payment) => void;
    onDelete?: (paymentId: string) => void;
}

const getPaymentTypeText = (type: PaymentType): string => {
    switch (type) {
        case PaymentType.CASH:
            return "Efectivo"
        case PaymentType.TRANSFER:
            return "Transferencia"
        case PaymentType.YAPE:
            return "Yape"
        case PaymentType.PLIN:
            return "Plin"
        case PaymentType.OTHER:
            return "Otro"
        default:
            return "Desconocido"
    }
}

const ReceiptPreview = ({ payment }: { payment: Payment }) => {
    return (
        <div className="bg-white p-8 w-full max-w-[400px] mx-auto">
            {/* Encabezado de la Boleta */}
            <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-[#3A416F] rounded-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#3A416F]">Pago Exitoso</h1>
                <div className="mt-2 text-green-500 font-semibold">
                    S/. {Number(payment.amount).toFixed(2)}
                </div>
            </div>

            {/* Detalles de la Transacción */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">N° de Boleta</span>
                        <span className="font-medium">#{payment.id.toString().padStart(4, '0')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Fecha</span>
                        <span className="font-medium">
                            {format(new Date(payment.paymentDate || new Date()), "dd/MM/yyyy", { locale: es })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Método</span>
                        <span className="font-medium">{getPaymentTypeText(payment.paymentType)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Estado</span>
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            {getPaymentStatusLabel(payment.state)}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Información del Cliente */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h2 className="font-semibold text-[#3A416F] mb-3">Información del Cliente</h2>
                <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Nombre</span>
                        <span className="font-medium">{payment.client.name} {payment.client.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">DNI</span>
                        <span className="font-medium">{payment.client.dni}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Plan</span>
                        <span className="font-medium">{payment.client.plan?.name || "N/A"}</span>
                    </div>
                </div>
            </div>

            {/* Pie de la Boleta */}
            <div className="text-center text-sm text-gray-500">
                <p className="font-medium text-[#3A416F]">¡Gracias por tu preferencia!</p>
                <p className="mt-1">Grupo Hemmy</p>
            </div>
        </div>
    )
}

export function PaymentDetailModal({ payment, isOpen, onClose, onEdit, onDelete }: PaymentDetailModalProps) {
    const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState(false);
    const [ isGenerating, setIsGenerating ] = useState(false);
    const [ showPreview, setShowPreview ] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    if (!payment) return null;

    const handleDelete = (e: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (onDelete) {
                await onDelete(payment.id.toString());
            }
            setIsDeleteDialogOpen(false);
            onClose();
        } catch (error) {
            console.error('Error al eliminar:', error);
            toast.error('Error al eliminar el pago');
        }
    };

    const handleCancelDelete = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsDeleteDialogOpen(false);
    };

    const generateReceiptImage = async () => {
        if (receiptRef.current) {
            try {
                // Esperar a que las fuentes se carguen
                await document.fonts.ready

                const canvas = await html2canvas(receiptRef.current, {
                    scale: 2, // Mayor calidad
                    backgroundColor: '#ffffff',
                    logging: false,
                    useCORS: true,
                    allowTaint: true,
                    foreignObjectRendering: true,
                    imageTimeout: 0,
                    onclone: (clonedDoc) => {
                        // Asegurarse de que los estilos se apliquen en el clon
                        Array.from(clonedDoc.getElementsByTagName('style')).forEach(style => {
                            document.head.appendChild(style.cloneNode(true))
                        })
                    }
                })

                // Usar PNG para mejor calidad y compatibilidad
                return canvas.toDataURL('image/png', 1.0)
            } catch (error) {
                console.error('Error generando la imagen:', error)
                return null
            }
        }
        return null
    }

    const shareViaWhatsApp = async () => {
        try {
            setIsGenerating(true)
            toast.loading('Generando boleta...')

            const receiptImage = await generateReceiptImage()
            if (receiptImage && payment.client.phone) {
                const formattedPhone = payment.client.phone.replace(/\D/g, '')

                // Crear un blob y una URL temporal
                const blob = await fetch(receiptImage).then(r => r.blob())
                const blobUrl = window.URL.createObjectURL(blob)

                // Crear un elemento temporal para descargar la imagen
                const link = document.createElement('a')
                link.href = blobUrl
                link.download = `boleta-${payment.id.toString().padStart(4, '0')}.png`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                // Liberar la URL del blob
                window.URL.revokeObjectURL(blobUrl)

                const message = encodeURIComponent(
                    `¡Gracias por tu pago!\n\n` +
                    `Te adjunto la boleta de tu pago realizado.\n\n` +
                    `*Resumen:*\n` +
                    `• Monto: S/. ${Number(payment.amount).toFixed(2)}\n` +
                    `• Fecha: ${format(new Date(payment.paymentDate || new Date()), "dd/MM/yyyy", { locale: es })}\n` +
                    `• Plan: ${payment.client.plan?.name || "N/A"}`
                )

                toast.success('¡Boleta generada con éxito!')

                // Usar la API de WhatsApp Business
                const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${message}`
                window.open(whatsappUrl, '_blank')
                setShowPreview(false)
            }
        } catch (error) {
            toast.error('Error al generar la boleta')
            console.error(error)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
                    {/* Contenido de la boleta para captura */}
                    <div className="hidden">
                        <div ref={receiptRef} className="bg-white p-8 w-[400px]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            <ReceiptPreview payment={payment} />
                        </div>
                    </div>

                    {/* Encabezado con degradado */}
                    <div className="bg-gradient-to-r from-[#3A416F] to-[#4B5389] p-5 text-white relative flex-shrink-0">
                        <DialogTitle className="sr-only">Detalles del Pago</DialogTitle>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5" />
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="font-semibold text-lg leading-tight">Detalles del Pago</h2>
                                        <p className="text-sm text-white/80">#{payment.id.toString().padStart(4, '0')}</p>
                                    </div>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hover:bg-white/20 text-white"
                                        disabled={isGenerating}
                                    >
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Compartir
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        className="flex items-center gap-2 cursor-pointer"
                                        onClick={() => setShowPreview(true)}
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>Previsualizar Boleta</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="flex items-center gap-2 cursor-pointer"
                                        onClick={shareViaWhatsApp}
                                        disabled={isGenerating}
                                    >
                                        <Phone className="h-4 w-4" />
                                        <span>Enviar por WhatsApp</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Monto y Detalles de Pago */}
                        <div className="mt-4 flex justify-between items-end">
                            <div>
                                <p className="text-sm text-white/80 mb-1">Monto Final</p>
                                <p className="text-3xl font-bold">S/. {Number(payment.amount).toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge
                                    className="bg-green-500/20 text-green-300 border-green-500/30"
                                >
                                    {getPaymentStatusLabel(payment.state)}
                                </Badge>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-white/80" />
                                        <span>{getPaymentTypeText(payment.paymentType)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-white/80" />
                                        <span>
                                            {payment.paymentDate
                                                ? format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: es })
                                                : "Pendiente"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido Scrolleable */}
                    <ScrollArea className="flex-grow">
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Información del Cliente */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-[#3A416F] text-white h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold">
                                            {payment.client.name[ 0 ]}{payment.client.lastName[ 0 ]}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-[#3A416F]">Información del Cliente</h3>
                                            <p className="text-xs text-gray-500">ID: {payment.client.id}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium">{payment.client.name} {payment.client.lastName}</p>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500">DNI</p>
                                                <p>{payment.client.dni}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Teléfono</p>
                                                <p>{payment.client.phone || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Dirección</p>
                                            <p className="text-sm">{payment.client.address || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detalles de la Transacción */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-[#3A416F] mb-4">Detalles de la Transacción</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Referencia</p>
                                            <p className="text-sm font-medium">{payment.reference || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Plan</p>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-medium">{payment.client.plan?.name || "N/A"}</p>
                                                <Badge variant="outline" className="bg-gray-100">
                                                    S/ {payment.amount}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Registrado</p>
                                                <p className="text-sm font-medium">
                                                    {payment.created_At
                                                        ? format(new Date(payment.created_At), "dd/MM/yyyy", { locale: es })
                                                        : "N/A"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Actualizado</p>
                                                <p className="text-sm font-medium">
                                                    {payment.updated_At
                                                        ? format(new Date(payment.updated_At), "dd/MM/yyyy", { locale: es })
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Botones de Acción - Fijos en la parte inferior */}
                    <div className="p-4 border-t bg-white flex-shrink-0">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={onClose}
                            >
                                Cerrar
                            </Button>
                            {onDelete && (
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                </Button>
                            )}
                            
                            {onEdit && (
                                <Button
                                    className="flex-1 bg-[#3A416F] hover:bg-[#4B5389]"
                                    onClick={() => {
                                        onEdit(payment);
                                        
                                        onClose();
                                    }}
                                >
                                    <PencilLine className="h-4 w-4 mr-2" />
                                    Editar Pago
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Preview */}
            <PreviewDialog open={showPreview} onOpenChange={setShowPreview}>
                <PreviewDialogContent className="max-w-[450px] p-6">
                    <DialogHeader>
                        <DialogTitle>Vista Previa de la Boleta</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <ReceiptPreview payment={payment} />
                    </div>
                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setShowPreview(false)}
                        >
                            Cerrar
                        </Button>
                        <Button
                            onClick={shareViaWhatsApp}
                            disabled={isGenerating}
                            className="bg-[#3A416F] hover:bg-[#4B5389]"
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Enviar por WhatsApp
                        </Button>
                    </DialogFooter>
                </PreviewDialogContent>
            </PreviewDialog>

            {/* Modal de Confirmación de Eliminación */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCancelDelete();
                    }
                }}
            >
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Pago</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro que deseas eliminar el pago {payment.code}? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelDelete}>
                            No, cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Sí, eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
} 