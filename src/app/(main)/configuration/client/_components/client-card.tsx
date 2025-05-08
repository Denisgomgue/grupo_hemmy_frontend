"use client";

import { Client, AccountStatus } from "@/types/clients/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Wifi, Zap, Settings, HelpCircle } from "lucide-react";
import { ClientActionsDropdown } from "./client-actions-dropdown";
import { InfoCardShell } from "./info-card-shell";

// --- Helpers (Movidos aquí desde headers.tsx) ---

const getAccountStatusVariant = (status: AccountStatus): "success" | "secondary" | "destructive" | "outline" => {
     switch (status) {
        case AccountStatus.ACTIVE: return "success";
        case AccountStatus.SUSPENDED: return "secondary";
        case AccountStatus.INACTIVE: return "destructive";
        default: return "outline";
    }
}

const getPaymentStatus = (paymentDateStr: string | null | undefined): { text: string; variant: "success" | "warning" | "destructive" | "outline" } => {
     if (!paymentDateStr) return { text: "N/D", variant: "outline" };
     const paymentDate = new Date(paymentDateStr);
     const today = new Date();
     const sevenDaysFromNow = new Date();
     sevenDaysFromNow.setDate(today.getDate() + 7);
     paymentDate.setHours(0, 0, 0, 0);
     today.setHours(0, 0, 0, 0);
     sevenDaysFromNow.setHours(0, 0, 0, 0);
     if (paymentDate < today) return { text: "En mora", variant: "destructive" };
     if (paymentDate >= today && paymentDate <= sevenDaysFromNow) return { text: "Por vencer", variant: "warning" }; 
     return { text: "Al día", variant: "success" };
};

const getServiceIcon = (serviceName: string | undefined) => {
    if (!serviceName) return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    if (serviceName.toLowerCase().includes("fibra")) return <Zap className="h-4 w-4 text-blue-500" />;
    if (serviceName.toLowerCase().includes("inalámbrico")) return <Wifi className="h-4 w-4 text-sky-500" />;
    return <Settings className="h-4 w-4 text-muted-foreground" />;
}

// --- Definición del Componente Card ---

interface ClientCardProps {
    client: Client;
    onEdit: (client: Client) => void;
}

export function ClientCard({ client, onEdit }: ClientCardProps) {
    console.log("ClientCard received client:", client);
    console.log("ClientCard received onEdit prop type:", typeof onEdit);

    // Comprobación por si acaso, aunque headers.tsx ya no debería pasar undefined
    if (!client) return null;

    const initial = client.name ? client.name[0].toUpperCase() : "?";
    const paymentInfo = getPaymentStatus(client.paymentDate);
    const paymentBadgeVariant = paymentInfo.variant === 'warning' ? 'secondary' : paymentInfo.variant;

    // Definir el contenido de cada sección
    const topSectionContent = (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 text-sm">
                    <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-semibold">{client.name} {client.lastName}</div>
                    <div className="text-xs text-muted-foreground">Sector: {client.sector?.name || 'N/A'}</div>
                </div>
            </div>
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
                <div className="font-medium">{client.paymentDate ? format(new Date(client.paymentDate), 'P', { locale: es }) : 'N/A'}</div>
            </div>
                <div>
                <div className="text-xs text-muted-foreground mb-0.5">Estado Cuenta / Pago</div>
                    <div className="flex flex-col items-start gap-1">
                    <Badge variant={getAccountStatusVariant(client.status)}>{client.status}</Badge>
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
                    <div className="text-xs text-muted-foreground mb-0.5">Renta</div>
                    <div className="font-medium">{client.advancePayment ? "Adelantada" : "Pendiente"}</div>
            </div>
        </div>
    );

    // Renderizar usando el Shell
    return (
        <InfoCardShell 
            topSection={topSectionContent}
            middleSection={middleSectionContent}
            bottomSection={bottomSectionContent}
        />
    );

} 