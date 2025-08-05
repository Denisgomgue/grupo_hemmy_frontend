"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"

export type NotificationType = "info" | "warning" | "success" | "error"

interface FloatingNotification {
    id: string
    type: NotificationType
    title: string
    message: string
    details?: React.ReactNode
    autoClose?: boolean
    autoCloseDelay?: number
    onClose?: () => void
}

interface FloatingNotificationsContextType {
    showNotification: (notification: Omit<FloatingNotification, 'id'>) => void
    hideNotification: (id: string) => void
    hideAllNotifications: () => void
}

const FloatingNotificationsContext = createContext<FloatingNotificationsContextType | undefined>(undefined)

export function useFloatingNotifications() {
    const context = useContext(FloatingNotificationsContext)
    if (!context) {
        throw new Error('useFloatingNotifications must be used within a FloatingNotificationsProvider')
    }
    return context
}

interface FloatingNotificationsProviderProps {
    children: ReactNode
}

export function FloatingNotificationsProvider({ children }: FloatingNotificationsProviderProps) {
    const [ notifications, setNotifications ] = useState<FloatingNotification[]>([])

    const showNotification = (notification: Omit<FloatingNotification, 'id'>) => {
        // Prevenir notificaciones duplicadas
        const isDuplicate = notifications.some(n =>
            n.title === notification.title &&
            n.message === notification.message
        )

        if (isDuplicate) {
            console.log('🔔 Notificación duplicada detectada, ignorando:', notification.title)
            return
        }

        const id = Math.random().toString(36).substr(2, 9)
        const newNotification = { ...notification, id }
        console.log('🔔 Mostrando notificación flotante:', notification.title)
        setNotifications(prev => {
            // Limitar a máximo 3 notificaciones
            const updatedNotifications = [ ...prev, newNotification ]
            if (updatedNotifications.length > 3) {
                return updatedNotifications.slice(-3)
            }
            return updatedNotifications
        })

        // Auto-close si está habilitado
        if (notification.autoClose) {
            setTimeout(() => {
                console.log('🔔 Auto-cerrando notificación:', id)
                hideNotification(id)
            }, notification.autoCloseDelay || 5000)
        }
    }

    const hideNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const hideAllNotifications = () => {
        setNotifications([])
    }

    return (
        <FloatingNotificationsContext.Provider value={{ showNotification, hideNotification, hideAllNotifications }}>
            {children}
            <FloatingNotificationsContainer notifications={notifications} onHide={hideNotification} />
        </FloatingNotificationsContext.Provider>
    )
}

interface FloatingNotificationsContainerProps {
    notifications: FloatingNotification[]
    onHide: (id: string) => void
}

function FloatingNotificationsContainer({ notifications, onHide }: FloatingNotificationsContainerProps) {
    if (typeof window === 'undefined') return null

    const notificationConfig = {
        info: {
            icon: Info,
            className: "border-blue-200 bg-blue-50 text-blue-900 shadow-blue-200",
            iconClassName: "text-blue-600"
        },
        warning: {
            icon: AlertTriangle,
            className: "border-orange-200 bg-orange-50 text-orange-900 shadow-orange-200",
            iconClassName: "text-orange-600"
        },
        success: {
            icon: CheckCircle,
            className: "border-green-200 bg-green-50 text-green-900 shadow-green-200",
            iconClassName: "text-green-600"
        },
        error: {
            icon: AlertCircle,
            className: "border-red-200 bg-red-50 text-red-900 shadow-red-200",
            iconClassName: "text-red-600"
        }
    }

    return createPortal(
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] space-y-3 max-w-md">
            {notifications.map((notification) => {
                const config = notificationConfig[ notification.type ]
                const Icon = config.icon

                return (
                    <div
                        key={notification.id}
                        className={cn(
                            "relative border rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2 duration-300",
                            config.className
                        )}
                    >
                        <div className="flex items-start space-x-3">
                            <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconClassName)} />

                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-base mb-1">
                                    {notification.title}
                                </h4>
                                <p className="text-sm opacity-90 mb-2">
                                    {notification.message}
                                </p>
                                {notification.details && (
                                    <div className="text-xs opacity-75">
                                        {notification.details}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    onHide(notification.id)
                                    notification.onClose?.()
                                }}
                                className="flex-shrink-0 p-2 rounded-full hover:bg-black/20 transition-colors hover:scale-110"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>,
        document.body
    )
}

// Componente específico para regularización de aplazamientos
interface RegularizationNotificationProps {
    pendingPayment: any
    onClose?: () => void
}

export function RegularizationNotification({ pendingPayment, onClose }: RegularizationNotificationProps) {
    const { showNotification } = useFloatingNotifications()
    const [ hasShown, setHasShown ] = useState(false)

    useEffect(() => {
        // Evitar mostrar múltiples notificaciones
        if (hasShown || !pendingPayment) return

        console.log('🔔 RegularizationNotification: Mostrando notificación para:', pendingPayment?.code)

        // Verificar que el contexto esté disponible
        if (!showNotification) {
            console.error('🔔 Error: showNotification no está disponible')
            return
        }

        setHasShown(true)

        showNotification({
            type: "warning",
            title: "Regularización de Aplazamiento Requerida",
            message: "Este cliente tiene un aplazamiento pendiente que debe ser regularizado antes de registrar un nuevo pago.",
            details: (
                <div className="mt-2 space-y-1">
                    <div className="bg-orange-100 p-2 rounded text-xs">
                        <strong>Código:</strong> {pendingPayment.code} |
                        <strong> Fecha de aplazamiento:</strong> {pendingPayment.engagementDate ?
                            new Date(pendingPayment.engagementDate).toLocaleDateString('es-ES') : 'No definida'}
                    </div>
                </div>
            ),
            onClose: () => {
                setHasShown(false)
                onClose?.()
            },
            autoClose: true,
            autoCloseDelay: 4000
        })
    }, [ pendingPayment?.id ]) // Solo depender del ID del pago

    return null
}

// Componente específico para aplazamientos pendientes
interface PendingPostponementsNotificationProps {
    postponements: any[]
    paymentType?: "payment" | "postponement" | null
    onClose?: () => void
}

export function PendingPostponementsNotification({
    postponements,
    paymentType,
    onClose
}: PendingPostponementsNotificationProps) {
    const { showNotification } = useFloatingNotifications()
    const [ hasShown, setHasShown ] = useState(false)

    useEffect(() => {
        // Evitar mostrar múltiples notificaciones
        if (hasShown || postponements.length === 0) return

        console.log('🔔 PendingPostponementsNotification: Mostrando notificación para', postponements.length, 'aplazamientos')

        setHasShown(true)

        showNotification({
            type: "warning",
            title: `${postponements.length} Aplazamiento(s) Pendiente(s)`,
            message: paymentType === "payment"
                ? "Debe regularizar su situación antes de registrar un nuevo pago."
                : "No puede registrar otro aplazamiento hasta regularizar los existentes.",
            details: (
                <div className="mt-2 space-y-1">
                    {postponements.map((postponement, index) => (
                        <div key={postponement.id} className="bg-orange-100 p-2 rounded text-xs">
                            <strong>Aplazamiento {index + 1}:</strong> {postponement.code} -
                            Fecha de aplazamiento: {postponement.engagementDate ?
                                new Date(postponement.engagementDate).toLocaleDateString('es-ES') : 'No definida'}
                        </div>
                    ))}
                </div>
            ),
            onClose: () => {
                setHasShown(false)
                onClose?.()
            },
            autoClose: true,
            autoCloseDelay: 4000
        })
    }, [ postponements.length, paymentType ]) // Solo depender de la cantidad y tipo

    return null
} 