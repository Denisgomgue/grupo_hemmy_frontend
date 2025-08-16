"use client";

import { Device, DeviceStatus } from "@/types/devices/device";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Cpu, Wifi, Settings, WifiOff, AlertTriangle, MapPin, Calendar, Clock } from "lucide-react";
import { DeviceActionsDropdown } from "./device-actions-dropdown";
import { EquipmentModal } from "./equipment-modal";
import { useState } from "react";

// --- Helpers ---

const getStatusBadge = (status: string) => {
    switch (status) {
        case "ASSIGNED":
            return <Badge variant="default" className="bg-green-500 w-max">Asignado</Badge>
        case "STOCK":
            return <Badge variant="secondary" className="w-max">En Stock</Badge>
        case "MAINTENANCE":
            return <Badge variant="outline" className="w-max">Mantenimiento</Badge>
        case "SOLD":
            return <Badge variant="destructive" className="w-max">Vendido</Badge>
        case "LOST":
            return <Badge variant="destructive" className="w-max">Perdido</Badge>
        case "USED":
            return <Badge variant="outline" className="w-max">Usado</Badge>
        default:
            return <Badge variant="outline" className="w-max">{status}</Badge>
    }
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'router':
            return <Wifi className="h-4 w-4 text-blue-500" />
        case 'switch':
            return <Cpu className="h-4 w-4 text-purple-500" />
        case 'ont':
            return <Cpu className="h-4 w-4 text-green-500" />
        case 'deco':
            return <Wifi className="h-4 w-4 text-orange-500" />
        case 'laptop':
            return <Cpu className="h-4 w-4 text-indigo-500" />
        case 'crimpadora':
            return <Settings className="h-4 w-4 text-gray-500" />
        case 'tester':
            return <Settings className="h-4 w-4 text-yellow-500" />
        case 'antena':
            return <Wifi className="h-4 w-4 text-red-500" />
        case 'fibra':
            return <Settings className="h-4 w-4 text-pink-500" />
        case 'conector':
            return <Settings className="h-4 w-4 text-teal-500" />
        case 'otro':
            return <Settings className="h-4 w-4 text-gray-500" />
        default:
            return <Cpu className="h-4 w-4 text-muted-foreground" />
    }
}

const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
        router: "Router",
        deco: "Deco",
        ont: "ONT",
        switch: "Switch",
        laptop: "Laptop",
        crimpadora: "Crimpadora",
        tester: "Tester",
        antena: "Antena",
        fibra: "Fibra",
        conector: "Conector",
        otro: "Otro"
    }
    return typeLabels[ type ] || type
}

// Función para generar color basado en el serial
const getAvatarColor = (serial: string): string => {
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

    const seed = serial.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[ seed % colors.length ];
};

// --- Definición del Componente Card ---

interface DeviceCardProps {
    device: Device;
    onEdit: (device: Device) => void;
    onDelete?: (deviceId: string) => void;
}

export function DeviceCard({ device, onEdit, onDelete }: DeviceCardProps) {
    if (!device) return null;

    const [ isModalOpen, setIsModalOpen ] = useState(false);
    const avatarColor = getAvatarColor(device.serialNumber || "");

    const topSectionContent = (
        <div className="flex items-center justify-around mb-4 gap-4 flex-wrap">
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 hover:bg-purple-50 rounded-lg transition-colors p-2 -m-2 border-b-2 border-b-purple-50 cursor-pointer"
            >
                <div className="flex gap-3 items-center flex-wrap w-full justify-between">
                    <div className="flex items-center justify-between gap-2">
                        <Avatar className={`h-7 w-8 text-sm ${avatarColor} text-black`}>
                            <AvatarFallback>{getTypeIcon(device.type)}</AvatarFallback>
                        </Avatar>
                        <div className="font-semibold">{getTypeLabel(device.type)}</div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {getStatusBadge(device.status)}
                    </div>
                </div>
            </button>
            <DeviceActionsDropdown device={device} onEdit={onEdit} onDelete={onDelete} />
        </div>
    );

    const middleSectionContent = (
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">

            <div>
                <div className="text-xs text-muted-foreground mb-1">Marca</div>
                <div className="font-medium">{device.brand || '-'}</div>

            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-1">Modelo</div>
                <div className="font-medium">{device.model || '-'}</div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-1">Instalación</div>
                <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="h-3 w-3" />
                    <span>{device.assignedInstallationId ? 'Asignada' : 'No Asignada'}</span>
                </div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-1">Fecha Asignación</div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">
                        {device.assignedDate
                            ? format(new Date(device.assignedDate), "dd/MM/yyyy", { locale: es })
                            : 'Aún no asignada'
                        }
                    </span>
                </div>
            </div>
        </div>
    );

    const bottomSectionContent = (
        <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div>
                <div className="text-xs text-muted-foreground mb-1">MAC Address</div>
                <div className="font-medium">{device.macAddress || '00:00:00:00:00:00'}</div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-1">Número de Serie</div>
                <div className="font-medium">{device.serialNumber || '-'}</div>
            </div>
        </div>
    );

    return (
        <>
            <div className="p-4 border rounded-lg shadow-sm bg-card text-card-foreground flex flex-col min-h-[280px]">
                {/* Sección Superior */}
                {topSectionContent}

                {/* Sección Media */}
                <div className="flex-1 flex flex-col justify-around">
                    {middleSectionContent}

                    {/* Sección Inferior con divisor */}
                    {bottomSectionContent && (
                        <div className="border-t pt-3 mt-3">
                            {bottomSectionContent}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Equipo */}
            <EquipmentModal
                equipment={device}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
} 