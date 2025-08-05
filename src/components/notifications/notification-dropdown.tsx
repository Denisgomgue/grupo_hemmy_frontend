'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '@/lib/axios';

interface Notification {
    id: number;
    type: string;
    status: 'UNREAD' | 'READ';
    title: string;
    message: string;
    metadata?: Record<string, any>;
    clientId?: number;
    paymentId?: number;
    userId?: number;
    created_at: string;
    updated_at: string;
}

interface NotificationDropdownProps {
    className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
    const [ isOpen, setIsOpen ] = useState(false);
    const [ notifications, setNotifications ] = useState<Notification[]>([]);
    const [ unreadCount, setUnreadCount ] = useState(0);
    const [ loading, setLoading ] = useState(false);

    // Cargar notificaciones
    const loadNotifications = async () => {
        try {
            setLoading(true);
            const [ notificationsResponse, unreadResponse ] = await Promise.all([
                api.get('/notifications?limit=20'),
                api.get('/notifications/unread-count')
            ]);

            setNotifications(notificationsResponse.data);
            setUnreadCount(unreadResponse.data.count);
        } catch (error) {
            // Log removido para limpieza
        } finally {
            setLoading(false);
        }
    };

    // Marcar como leída
    const markAsRead = async (notificationId: number) => {
        try {
            await api.post(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, status: 'READ' as const }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            // Log removido para limpieza
        }
    };

    // Marcar todas como leídas
    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/mark-all-read');
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, status: 'READ' as const }))
            );
            setUnreadCount(0);
        } catch (error) {
            // Log removido para limpieza
        }
    };

    // Eliminar notificación
    const deleteNotification = async (notificationId: number) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            if (notifications.find(n => n.id === notificationId)?.status === 'UNREAD') {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            // Log removido para limpieza
        }
    };

    // Limpiar todas las notificaciones
    const clearAllNotifications = async () => {
        try {
            await api.delete('/notifications');
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            // Log removido para limpieza
        }
    };

    // Cargar notificaciones al montar el componente
    useEffect(() => {
        loadNotifications();
    }, []);

    // Recargar notificaciones cada 30 segundos
    useEffect(() => {
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'CLIENT_SUSPENDED':
                return '🔴';
            case 'CLIENT_ACTIVATED':
                return '🟢';
            case 'PAYMENT_DUE_SOON':
                return '🟡';
            case 'PAYMENT_OVERDUE':
                return '🔴';
            case 'PAYMENT_RECEIVED':
                return '💰';
            case 'CLIENT_DEACTIVATED':
                return '⚫';
            default:
                return '📢';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'CLIENT_SUSPENDED':
            case 'PAYMENT_OVERDUE':
                return 'border-red-200 bg-red-50';
            case 'CLIENT_ACTIVATED':
            case 'PAYMENT_RECEIVED':
                return 'border-green-200 bg-green-50';
            case 'PAYMENT_DUE_SOON':
                return 'border-yellow-200 bg-yellow-50';
            case 'CLIENT_DEACTIVATED':
                return 'border-gray-200 bg-gray-50';
            default:
                return 'border-blue-200 bg-blue-50';
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Botón de notificaciones */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {/* Dropdown de notificaciones */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 z-50">
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-0">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="font-semibold text-sm">Notificaciones</h3>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={markAllAsRead}
                                            className="text-xs h-6 px-2"
                                        >
                                            <Check className="h-3 w-3 mr-1" />
                                            Marcar todas
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAllNotifications}
                                        className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Limpiar
                                    </Button>
                                </div>
                            </div>

                            {/* Lista de notificaciones */}
                            <ScrollArea className="h-80">
                                {loading ? (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        Cargando notificaciones...
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        No hay notificaciones
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        {notifications.map((notification, index) => (
                                            <div key={notification.id}>
                                                <div className={`p-3 rounded-lg border ${getNotificationColor(notification.type)} ${notification.status === 'UNREAD' ? 'ring-2 ring-blue-200' : ''
                                                    }`}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3 flex-1">
                                                            <span className="text-lg">
                                                                {getNotificationIcon(notification.type)}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-sm text-gray-900 mb-1">
                                                                    {notification.title}
                                                                </h4>
                                                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    {formatDistanceToNow(new Date(notification.created_at), {
                                                                        addSuffix: true,
                                                                        locale: es
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {notification.status === 'UNREAD' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    className="h-6 w-6 p-0"
                                                                >
                                                                    <Check className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteNotification(notification.id)}
                                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {index < notifications.length - 1 && (
                                                    <Separator className="my-2" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t bg-gray-50">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-xs"
                                        onClick={() => {
                                            // Aquí podrías navegar a una página de notificaciones completa
                                            // Log removido para limpieza
                                        }}
                                    >
                                        Ver todas las notificaciones
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Overlay para cerrar al hacer clic fuera */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
} 