"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Client, AccountStatus } from "@/types/clients/client"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox" // Para la columna de selección
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Para la columna cliente
import { Check, X, Wifi, Zap, Settings, HelpCircle } from "lucide-react" // Iconos
import { format } from "date-fns";
import { es } from 'date-fns/locale';

// Helper para variant del Badge de estado de CUENTA (Activo, Suspendido, etc.)
const getAccountStatusVariant = (status: AccountStatus): "success" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case AccountStatus.ACTIVE:
            return "success";
        case AccountStatus.SUSPENDED:
            return "secondary";
        case AccountStatus.INACTIVE:
            return "destructive";
        default:
            return "outline";
    }
}

// Lógica placeholder para determinar estado de PAGO (Al día, Por vencer, En mora)
const getPaymentStatus = (paymentDateStr: string | null | undefined): { text: string; variant: "success" | "warning" | "destructive" | "outline" } => {
    if (!paymentDateStr) return { text: "N/D", variant: "outline" };
    const paymentDate = new Date(paymentDateStr);
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    paymentDate.setHours(0, 0, 0, 0); 
    today.setHours(0, 0, 0, 0);
    sevenDaysFromNow.setHours(0, 0, 0, 0);

    if (paymentDate < today) {
        return { text: "En mora", variant: "destructive" };
    } else if (paymentDate >= today && paymentDate <= sevenDaysFromNow) {
        return { text: "Por vencer", variant: "warning" }; // Usar warning, se ajustará Badge si es necesario
    } else {
        return { text: "Al día", variant: "success" };
    }
};

// Helper para iconos de servicio
const getServiceIcon = (serviceName: string | undefined) => {
    if (!serviceName) return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    if (serviceName.toLowerCase().includes("fibra")) return <Zap className="h-4 w-4 text-blue-500" />;
    if (serviceName.toLowerCase().includes("inalámbrico")) return <Wifi className="h-4 w-4 text-sky-500" />;
    return <Settings className="h-4 w-4 text-muted-foreground" />; 
}

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
        accessorKey: "name", // O usar 'id' si el nombre no es único
        header: "CLIENTE",
        cell: ({ row }) => {
            const client = row.original;
            const initial = client.name ? client.name[0].toUpperCase() + client.lastName[0].toUpperCase() : "?";
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 text-xs">
                        {/* <AvatarImage src={client.avatarUrl} alt={client.name} /> // Si tuvieras URL de avatar */}
                        <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{client.name} {client.lastName}</div>
                        <div className="text-xs text-muted-foreground">Sector: {client.sector?.name || 'N/A'}</div>
                    </div>
                </div>
            )
        }
    },
    // Columna Plan
    {
        accessorKey: "plan",
        header: "PLAN",
        cell: ({ row }) => {
            const plan = row.original.plan;
            return (
                <div>
                    <div>{plan?.name || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">S/ {plan?.price || 'N/A'}/mes</div>
                </div>
            )
        }
    },
    // Columna Servicio
    {
        accessorKey: "plan.service", // El servicio viene del plan
        header: "SERVICIO",
        cell: ({ row }) => {
            const service = row.original.plan?.service; // Servicio asociado al plan
            const speed = row.original.plan?.speed; // Velocidad del plan
            return (
                <div className="flex items-center gap-2">
                    {getServiceIcon(service?.name)}
                    <div>
                        <div>{service?.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{speed ?? 'N/A'} Mbps</div> 
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
             const paymentDate = row.original.paymentDate;
             const paymentText = row.original.advancePayment ? "Adelantado" : "Pendiente"; 
            return (
                 <div>
                    <div>{paymentDate ? format(new Date(paymentDate), 'P', {locale: es}) : 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">{paymentText}</div>
                 </div>
            )
        }
    },
    // Columna Estado (Cuenta y Pago)
    {
        accessorKey: "status", 
        header: "ESTADO",
        cell: ({ row }) => {
            const accountStatus = row.original.status;
            const paymentInfo = getPaymentStatus(row.original.paymentDate);
             // Corregir variant de pago si es warning
            const paymentVariant = paymentInfo.variant === 'warning' ? 'secondary' : paymentInfo.variant;
            return (
                <div className="flex flex-col items-start gap-1">
                    <Badge variant={getAccountStatusVariant(accountStatus)}>{accountStatus}</Badge>
                    <Badge variant={paymentVariant}>{paymentInfo.text}</Badge> 
                </div>
            )
        }
    },
]

