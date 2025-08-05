"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Client, AccountStatus } from "@/types/clients/client"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, startOfDay } from "date-fns";
import { es } from 'date-fns/locale';
import { formatDateForDisplay, createDateFromString, calculateNextPaymentDateForDisplay } from "@/lib/utils"
import Link from "next/link"
import { getAccountStatusLabel } from "@/utils/account-status-labels"
import { getClientPaymentStatusLabel } from "@/utils/client-payment-status-labels"
import { ClientImageFill } from "@/components/ui/client-image"
import { Wifi, Zap } from "lucide-react"

// Helper para variant del Badge de estado de CUENTA
const getAccountStatusVariant = (status: AccountStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case AccountStatus.ACTIVE:
            return "default";
        case AccountStatus.SUSPENDED:
            return "secondary";
        case AccountStatus.INACTIVE:
            return "destructive";
        default:
            return "outline";
    }
}

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

// Helper para obtener la instalación principal del cliente
const getMainInstallation = (client: Client) => {
    return client.installations?.[ 0 ] || null;
}

// Helper para obtener la fecha del próximo pago usando la misma lógica del card
const getNextPaymentDate = (client: Client): { date: string, isFromInitial: boolean } => {
    const installation = getMainInstallation(client);
    const paymentConfig = installation?.paymentConfig;
    const payments = client.payments || [];

    if (paymentConfig?.initialPaymentDate) {
        const calculatedDate = calculateNextPaymentDateForDisplay(paymentConfig.initialPaymentDate, payments.length);
        return {
            date: calculatedDate,
            isFromInitial: payments.length === 0
        };
    }

    return { date: "No definida", isFromInitial: false };
};

// Helper para obtener el icono del servicio
const getServiceIcon = (serviceName: string | undefined) => {
    if (!serviceName || serviceName.trim() === '') return null;
    const serviceLower = serviceName.toLowerCase().trim();
    if (serviceLower.includes("fibra") || serviceLower.includes("fiber") || serviceLower.includes("óptica")) {
        return <Zap className="h-4 w-4 text-violet-500" />;
    }
    if (serviceLower.includes("inalambrico") || serviceLower.includes("wifi") || serviceLower.includes("wireless")) {
        return <Wifi className="h-4 w-4 text-purple-500" />;
    }
    return null;
};

// Helper para obtener el estado de pago usando la misma lógica del card
const getPaymentStatus = (client: Client) => {
    const installation = getMainInstallation(client);
    const paymentConfig = installation?.paymentConfig;

    if (!paymentConfig?.paymentStatus) {
        return { text: "N/D", variant: "outline" as const };
    }

    // Usar el paymentStatus del backend que ya está calculado correctamente
    switch (paymentConfig.paymentStatus) {
        case 'PAID':
            return { text: "Al día", variant: "default" as const };
        case 'EXPIRING':
            return { text: "Por vencer", variant: "secondary" as const };
        case 'EXPIRED':
            return { text: "Vencido", variant: "destructive" as const };
        case 'SUSPENDED':
            return { text: "Suspendido", variant: "destructive" as const };
        default:
            return { text: "N/D", variant: "outline" as const };
    }
};

// Definir columnas base
export const baseColumns: ColumnDef<Client>[] = [
    // Columna de Selección
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    // Columna Cliente
    {
        accessorKey: "name",
        header: "CLIENTE",
        cell: ({ row }) => {
            const client = row.original;
            const installation = getMainInstallation(client);
            const initial = (client.name && client.lastName)
                ? client.name[ 0 ].toUpperCase() + client.lastName[ 0 ].toUpperCase()
                : client.name
                    ? client.name[ 0 ].toUpperCase()
                    : "?";

            return (
                <div className="flex items-center gap-3">
                    <Avatar className={`h-8 w-8 text-xs ${getAvatarBorderColor(client.status)}`}>
                        <AvatarFallback>{initial}</AvatarFallback>

                    </Avatar>
                    <div className="flex-1">
                        <Link
                            href={`/configuration/client/${client.id}`}
                            className="font-medium hover:text-primary hover:underline"
                        >
                            {client.name} {client.lastName}
                        </Link>

                        <div className="text-xs text-muted-foreground">
                            Sector: {installation?.sector?.name || 'N/A'}
                        </div>
                    </div>

                </div>
            )
        }
    },
    // Columna Plan y Servicio
    {
        accessorKey: "plan",
        header: "PLAN Y SERVICIO",
        cell: ({ row }) => {
            const client = row.original;
            const installation = getMainInstallation(client);
            const plan = installation?.plan;
            const serviceIcon = getServiceIcon(plan?.service?.name);

            return (
                <div className="flex items-center gap-2">
                    {serviceIcon}
                    <div>
                        <div className="font-medium flex items-center gap-2">
                            {plan?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {plan?.speed || 'N/A'} Mbps - S/ {plan?.price || '0.00'}
                        </div>
                    </div>
                </div>
            )
        }
    },
    // Columna Próximo Pago
    {
        accessorKey: "paymentDate",
        header: "PRÓXIMO PAGO",
        cell: ({ row }) => {
            const client = row.original;
            const { date, isFromInitial } = getNextPaymentDate(client);

            return (
                <div className="text-sm">
                    <div>{date}</div>
                    {isFromInitial && (
                        <div className="text-xs text-muted-foreground">(Fecha inicial)</div>
                    )}
                </div>
            )
        }
    },
    // Columna Estados
    {
        accessorKey: "status",
        header: "ESTADO PAGOS",
        cell: ({ row }) => {
            const client = row.original;
            const paymentStatus = getPaymentStatus(client);

            return (
                <div className="flex flex-col gap-1">
                    <Badge variant={paymentStatus.variant}>
                        {paymentStatus.text}
                    </Badge>
                </div>
            )
        }
    }


];


