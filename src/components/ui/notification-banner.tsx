"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type NotificationType = "info" | "warning" | "success" | "error"

interface NotificationBannerProps {
    type: NotificationType
    title: string
    message: string
    details?: React.ReactNode
    onClose?: () => void
    autoClose?: boolean
    autoCloseDelay?: number
    className?: string
}

const notificationConfig = {
    info: {
        icon: Info,
        className: "border-blue-200 bg-blue-50 text-blue-900",
        iconClassName: "text-blue-600"
    },
    warning: {
        icon: AlertTriangle,
        className: "border-orange-200 bg-orange-50 text-orange-900",
        iconClassName: "text-orange-600"
    },
    success: {
        icon: CheckCircle,
        className: "border-green-200 bg-green-50 text-green-900",
        iconClassName: "text-green-600"
    },
    error: {
        icon: AlertCircle,
        className: "border-red-200 bg-red-50 text-red-900",
        iconClassName: "text-red-600"
    }
}

export function NotificationBanner({
    type,
    title,
    message,
    details,
    onClose,
    autoClose = false,
    autoCloseDelay = 5000,
    className
}: NotificationBannerProps) {
    const [ isVisible, setIsVisible ] = useState(true)
    const config = notificationConfig[ type ]
    const Icon = config.icon

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                setIsVisible(false)
                onClose?.()
            }, autoCloseDelay)

            return () => clearTimeout(timer)
        }
    }, [ autoClose, autoCloseDelay, onClose ])

    const handleClose = () => {
        setIsVisible(false)
        onClose?.()
    }

    if (!isVisible) return null

    return (
        <div className={cn(
            "relative border rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2 duration-300",
            config.className,
            className
        )}>
            <div className="flex items-start space-x-3">
                <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconClassName)} />

                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-base mb-1">
                        {title}
                    </h4>
                    <p className="text-sm opacity-90 mb-2">
                        {message}
                    </p>
                    {details && (
                        <div className="text-xs opacity-75">
                            {details}
                        </div>
                    )}
                </div>

                {onClose && (
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    )
}

// Componente específico para regularización de aplazamientos
interface RegularizationBannerProps {
    pendingPayment: any
    onClose?: () => void
}

export function RegularizationBanner({ pendingPayment, onClose }: RegularizationBannerProps) {
    return (
        <NotificationBanner
            type="warning"
            title="Regularización de Aplazamiento Requerida"
            message="Este cliente tiene un aplazamiento pendiente que debe ser regularizado antes de registrar un nuevo pago."
            details={
                <div className="mt-2 space-y-1">
                    <div className="bg-orange-100 p-2 rounded text-xs">
                        <strong>Código:</strong> {pendingPayment.code} |
                        <strong> Fecha de aplazamiento:</strong> {pendingPayment.engagementDate ?
                            new Date(pendingPayment.engagementDate).toLocaleDateString('es-ES') : 'No definida'}
                    </div>
                </div>
            }
            onClose={onClose}
            className="mb-4"
        />
    )
}

// Componente específico para aplazamientos pendientes
interface PendingPostponementsBannerProps {
    postponements: any[]
    paymentType?: "payment" | "postponement" | null
    onClose?: () => void
}

export function PendingPostponementsBanner({
    postponements,
    paymentType,
    onClose
}: PendingPostponementsBannerProps) {
    return (
        <NotificationBanner
            type="warning"
            title={`${postponements.length} Aplazamiento(s) Pendiente(s)`}
            message={
                paymentType === "payment"
                    ? "Debe regularizar su situación antes de registrar un nuevo pago."
                    : "No puede registrar otro aplazamiento hasta regularizar los existentes."
            }
            details={
                <div className="mt-2 space-y-1">
                    {postponements.map((postponement, index) => (
                        <div key={postponement.id} className="bg-orange-100 p-2 rounded text-xs">
                            <strong>Aplazamiento {index + 1}:</strong> {postponement.code} -
                            Fecha de aplazamiento: {postponement.engagementDate ?
                                new Date(postponement.engagementDate).toLocaleDateString('es-ES') : 'No definida'}
                        </div>
                    ))}
                </div>
            }
            onClose={onClose}
            className="mb-4"
        />
    )
} 