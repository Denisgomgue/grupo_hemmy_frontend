"use client";

import { Client, AccountStatus, PaymentStatus } from "@/types/clients/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { formatDateForDisplay, createDateFromString, calculateNextPaymentDateForDisplay } from "@/lib/utils"
import { Wifi, Zap, Settings, HelpCircle } from "lucide-react";
import { ClientActionsDropdown } from "./client-actions-dropdown";
import { InfoCardShell } from "./info-card-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAccountStatusLabel } from "@/utils/account-status-labels";
import { getClientPaymentStatusLabel } from "@/utils/client-payment-status-labels";
import Link from "next/link";
// Importación removida - función no existe
import { ClientImageFill } from "@/components/ui/client-image";

// --- Helpers ---

const getAccountStatusVariant = (status: AccountStatus): "accountSuccess" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case AccountStatus.ACTIVE: return "accountSuccess";
        case AccountStatus.SUSPENDED: return "secondary";
        case AccountStatus.INACTIVE: return "destructive";
        default: return "outline";
    }
}

const getPaymentStatusVariant = (status: PaymentStatus): "success" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case PaymentStatus.PAID:
            return "success";
        case PaymentStatus.EXPIRING:
            return "secondary";
        case PaymentStatus.SUSPENDED:
            return "destructive";
        case PaymentStatus.EXPIRED:
            return "destructive";
        default:
            return "outline";
    }
}

// Helper para obtener la instalación principal del cliente
const getMainInstallation = (client: Client) => {
    return client.installations?.[ 0 ] || null;
}

// Helper para obtener el estado de pago usando la misma lógica del card
const getPaymentStatus = (client: Client): { text: string; variant: "success" | "warning" | "destructive" | "outline" } => {
    const installation = getMainInstallation(client);
    const paymentConfig = installation?.paymentConfig;

    if (!paymentConfig?.paymentStatus) {
        return { text: "N/D", variant: "outline" };
    }

    // Usar el paymentStatus del backend que ya está calculado correctamente
    switch (paymentConfig.paymentStatus) {
        case 'PAID':
            return { text: "Al día", variant: "success" };
        case 'EXPIRING':
            return { text: "Por vencer", variant: "warning" };
        case 'EXPIRED':
            return { text: "Vencido", variant: "destructive" };
        case 'SUSPENDED':
            return { text: "Suspendido", variant: "destructive" };
        default:
            return { text: "N/D", variant: "outline" };
    }
};

const getServiceIcon = (serviceName: string | undefined) => {
    if (!serviceName || serviceName.trim() === '') return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    const serviceLower = serviceName.toLowerCase().trim();
    if (serviceLower.includes("fibra") || serviceLower.includes("fiber")) return <Zap className="h-4 w-4 text-blue-500" />;
    if (serviceLower.includes("inalambrico") || serviceLower.includes("Internet Inalambrico") || serviceLower.includes("wifi")) return <Wifi className="h-4 w-4 text-sky-500" />;
    return <Settings className="h-4 w-4 text-muted-foreground" />;
}

// Función para generar color basado en el nombre
const getAvatarColor = (name: string): string => {
    const colors = [
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-yellow-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-red-500",
        "bg-teal-500"
    ];

    // Usar la suma de los códigos ASCII de las letras del nombre como semilla
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[ seed % colors.length ];
};

// Helper para obtener el color del contorno del avatar según el estado del cliente
const getAvatarBorderColor = (status: AccountStatus): string => {
    switch (status) {
        case AccountStatus.ACTIVE:
            return "ring-2 ring-purple-600 ring-offset-2";
        case AccountStatus.SUSPENDED:
            return "ring-2 ring-red-500 ring-offset-2";
        case AccountStatus.INACTIVE:
            return "ring-2 ring-black ring-offset-2";
        default:
            return "ring-2 ring-gray-400 ring-offset-2";
    }
}

// --- Definición del Componente Card ---

interface ClientCardProps {
    client: Client;
    onEdit: (client: Client) => void;
}

export function ClientCard({ client, onEdit }: ClientCardProps) {
    if (!client) return null;

    const initial = client.name ? client.name[ 0 ].toUpperCase() : "?";
    const avatarColor = getAvatarColor((client.name || "") + (client.lastName || ""));
    const paymentInfo = getPaymentStatus(client);
    const paymentBadgeVariant = paymentInfo.variant === 'warning' ? 'secondary' : paymentInfo.variant;
    const installation = getMainInstallation(client);
    const plan = installation?.plan;



    const topSectionContent = (
        <div className="flex items-center justify-between mb-4">
            <Link
                href={`/configuration/client/${client.id}`}
                className="flex-1 hover:bg-purple-100 rounded-lg transition-colors p-2 -m-2"
            >
                <div className="flex items-center gap-3">
                    <Avatar className={`h-9 w-9 text-sm ${avatarColor} text-black ${getAvatarBorderColor(client.status)}`}>
                        <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-semibold">{client.name} {client.lastName}</div>
                        <div className="text-xs text-muted-foreground">Sector: {installation?.sector?.name || 'N/A'}</div>
                    </div>
                    {/* Imagen de referencia */}
                    <ClientImageFill
                        imagePath={installation?.referenceImage}
                        alt="Imagen de Referencia"
                        className="w-8 h-8 flex-shrink-0"
                        showFallbackIcon={true}
                        fallbackText=""
                        sizes="32px"
                    />
                </div>
            </Link>
            <ClientActionsDropdown client={client} onEdit={onEdit} />
        </div>
    );

    const middleSectionContent = (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Plan</div>
                <div className="font-medium flex items-center gap-2">
                    {getServiceIcon(plan?.service?.name)}
                    {plan?.name || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">
                    {plan?.speed || 'N/A'} Mbps • S/ {plan?.price || '0.00'}/mes
                </div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Próximo Pago</div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        {(() => {
                            const installation = getMainInstallation(client);
                            const paymentConfig = installation?.paymentConfig;
                            const payments = client.payments || [];

                            if (paymentConfig?.initialPaymentDate) {
                                return calculateNextPaymentDateForDisplay(paymentConfig.initialPaymentDate, payments.length);
                            }

                            return "No definida";
                        })()}
                    </p>
                </div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Estado Cuenta  Pago</div>
                <div className="flex flex-col items-start gap-1">

                    <Badge variant={paymentBadgeVariant}>{paymentInfo.text}</Badge>
                </div>
            </div>
        </div>
    );

    const bottomSectionContent = (
        <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Teléfono</div>
                <div className="font-medium">{client.phone || 'N/A'}</div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">IP</div>
                <div className="font-medium">{installation?.ipAddress || 'N/A'}</div>
            </div>
        </div>
    );

    // Renderizar usando el Shell
    return (
        <InfoCardShell
            topSection={topSectionContent}
            middleSection={middleSectionContent}
            bottomSection={bottomSectionContent}
            className="flex flex-col h-full"
        />
    );
} 