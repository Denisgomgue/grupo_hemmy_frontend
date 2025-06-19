"use client";

import { Client, AccountStatus, PaymentStatus } from "@/types/clients/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Wifi, Zap, Settings, HelpCircle } from "lucide-react";
import { ClientActionsDropdown } from "./client-actions-dropdown";
import { InfoCardShell } from "./info-card-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAccountStatusLabel } from "@/utils/account-status-labels";
import { getClientPaymentStatusLabel } from "@/utils/client-payment-status-labels";
import Link from "next/link";
import { getDisplayPaymentDate } from "@/utils/date-utils";
import { ClientImageFill } from "@/components/ui/client-image";

// --- Helpers (Movidos aquí desde headers.tsx) ---

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

const getPaymentStatus = (client: Client): { text: string; variant: "success" | "warning" | "destructive" | "outline" } => {
    if (!client.paymentDate && !client.initialPaymentDate) return { text: "N/D", variant: "outline" };

    const { date: nextPaymentDate, isFromInitial } = getDisplayPaymentDate(client);
    if (nextPaymentDate === "No definida") return { text: "N/D", variant: "outline" };

    const paymentDate = new Date(nextPaymentDate.split('/').reverse().join('-'));
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    paymentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    sevenDaysFromNow.setHours(0, 0, 0, 0);

    if (paymentDate < today) {
        return { text: "En mora", variant: "destructive" };
    } else if (paymentDate >= today && paymentDate <= sevenDaysFromNow) {
        return { text: "Por vencer", variant: "warning" };
    } else {
        return { text: "Al día", variant: "success" };
    }
};

const getServiceIcon = (serviceName: string | undefined) => {
    if (!serviceName) return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    if (serviceName.toLowerCase().includes("fibra")) return <Zap className="h-4 w-4 text-blue-500" />;
    if (serviceName.toLowerCase().includes("inalámbrico")) return <Wifi className="h-4 w-4 text-sky-500" />;
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

// --- Definición del Componente Card ---

interface ClientCardProps {
    client: Client;
    onEdit: (client: Client) => void;
}

export function ClientCard({ client, onEdit }: ClientCardProps) {
    if (!client) return null;

    const initial = client.name ? client.name[ 0 ].toUpperCase() : "?";
    const avatarColor = getAvatarColor(client.name + client.lastName);
    const paymentInfo = getPaymentStatus(client);
    const paymentBadgeVariant = paymentInfo.variant === 'warning' ? 'secondary' : paymentInfo.variant;
    const clientOwnPaymentStatus = client.paymentStatus;

    const topSectionContent = (
        <div className="flex items-center justify-between mb-4">
            <Link
                href={`/configuration/client/${client.id}`}
                className="flex-1 hover:bg-purple-100 rounded-lg transition-colors p-2 -m-2"
            >
                <div className="flex items-center gap-3">
                    <Avatar className={`h-9 w-9 text-sm ${avatarColor} text-black`}>
                        <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-semibold">{client.name} {client.lastName}</div>
                        <div className="text-xs text-muted-foreground">Sector: {client.sector?.name || 'N/A'}</div>
                    </div>
                    {/* Imagen de referencia */}
                    <ClientImageFill
                        imagePath={client.referenceImage}
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
                <div className="font-medium">{client.plan?.name || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">S/ {client.plan?.price || '0.00'}/mes</div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Servicio</div>
                <div className="flex items-center gap-1.5 font-medium">
                    {getServiceIcon(client.plan?.service?.name)}
                    <span>{client.plan?.service?.name || 'N/A'}</span>
                </div>
                <div className="text-xs text-muted-foreground">{client.plan?.speed ?? 'N/A'} Mbps</div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Próximo Pago</div>
                <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Próximo Pago</p>
                    <p className="text-sm text-muted-foreground">
                        {(() => {
                            const { date, isFromInitial } = getDisplayPaymentDate(client);
                            return (
                                <>
                                    {date}
                                    {isFromInitial && (
                                        <span className="ml-1 text-xs text-muted-foreground">(Basado en fecha inicial)</span>
                                    )}
                                </>
                            );
                        })()}
                    </p>
                </div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Estado Cuenta / Pago</div>
                <div className="flex flex-col items-start gap-1">
                    <Badge variant={getAccountStatusVariant(client.status)}>{getAccountStatusLabel(client.status)}</Badge>
                    <Badge variant={getPaymentStatusVariant(clientOwnPaymentStatus)}>{getClientPaymentStatusLabel(clientOwnPaymentStatus)}</Badge>
                </div>
            </div>
        </div>
    );

    const bottomSectionContent = (
        <div className="grid grid-cols-3 gap-x-4 text-sm">
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Teléfono</div>
                <div className="font-medium">{client.phone || 'N/A'}</div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Renta</div>
                <div className="font-medium">{client.advancePayment ? "Adelantada" : "Pendiente"}</div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">IP</div>
                <div className="font-medium">{client.ipAddress || 'N/A'}</div>
            </div>
        </div>
    );

    // Renderizar usando el Shell
    return (
        <CardContent>
            <InfoCardShell
                topSection={topSectionContent}
                middleSection={middleSectionContent}
                bottomSection={bottomSectionContent}
            />
        </CardContent>
    );
} 