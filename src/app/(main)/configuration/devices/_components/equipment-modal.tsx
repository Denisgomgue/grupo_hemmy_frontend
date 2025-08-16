"use client";

import { Device, DeviceType, DeviceStatus, DeviceUseType } from "@/types/devices/device";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Cpu,
    Wifi,
    Settings,
    Tag,
    User,
    Building,
    FileText,
    Hash,
    CalendarDays
} from "lucide-react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import {
    getDeviceTypeLabel,
    getDeviceStatusLabel,
    getDeviceUseTypeLabel,
    getDeviceStatusColor
} from "@/utils/device-utils";

interface EquipmentModalProps {
    equipment: Device;
    isOpen: boolean;
    onClose: () => void;
}

// Helpers
const getTypeIcon = (type: DeviceType) => {
    switch (type) {
        case DeviceType.ROUTER:
            return <Wifi className="h-7 w-7 text-blue-500" />
        case DeviceType.SWITCH:
            return <Cpu className="h-7 w-7 text-purple-500" />
        case DeviceType.ONT:
            return <Cpu className="h-7 w-7 text-green-500" />
        case DeviceType.DECO:
            return <Wifi className="h-7 w-7 text-orange-500" />
        case DeviceType.LAPTOP:
            return <Cpu className="h-7 w-7 text-indigo-500" />
        case DeviceType.CRIMPADORA:
            return <Settings className="h-7 w-7 text-gray-500" />
        case DeviceType.TESTER:
            return <Settings className="h-7 w-7 text-yellow-500" />
        case DeviceType.ANTENA:
            return <Wifi className="h-7 w-7 text-red-500" />
        case DeviceType.FIBRA:
            return <Settings className="h-7 w-7 text-pink-500" />
        case DeviceType.CONECTOR:
            return <Settings className="h-7 w-7 text-teal-500" />
        case DeviceType.OTRO:
            return <Settings className="h-7 w-7 text-gray-500" />
        default:
            return <Cpu className="h-7 w-7 text-muted-foreground" />
    }
};

const formatDate = (date: Date | string) => {
    if (!date) return "No disponible";
    try {
        return format(new Date(date), "dd/MM/yyyy", { locale: es });
    } catch {
        return "Fecha inválida";
    }
};

const formatClientName = (client: any) => {
    if (!client) return "Cliente no disponible";

    const name = client.name || "";
    const lastName = client.lastName || "";

    if (!name && !lastName) return "Cliente no disponible";

    // Si solo hay nombre, mostrar solo el nombre
    if (name && !lastName) return name;

    // Si solo hay apellido, mostrar solo el apellido
    if (!name && lastName) return lastName;

    // Formatear nombres: primer nombre completo, segundo nombre con inicial
    const nameParts = name.trim().split(/\s+/);
    let formattedName = "";

    if (nameParts.length >= 2) {
        const firstName = nameParts[ 0 ];
        const secondNameInitial = nameParts[ 1 ].charAt(0).toUpperCase();
        formattedName = `${firstName} ${secondNameInitial}.`;
    } else {
        formattedName = name;
    }

    // Formatear apellidos: primer apellido completo, segundo apellido con inicial
    const lastNameParts = lastName.trim().split(/\s+/);
    if (lastNameParts.length >= 2) {
        const firstLastName = lastNameParts[ 0 ];
        const secondLastNameInitial = lastNameParts[ 1 ].charAt(0).toUpperCase();
        return `${formattedName} ${firstLastName} ${secondLastNameInitial}.`;
    } else {
        // Si solo hay un apellido
        return `${formattedName} ${lastName}`;
    }
};

const formatEmployeeName = (employee: any) => {
    if (!employee) return "Empleado no disponible";

    const name = employee.name || "";
    const lastName = employee.lastName || "";

    if (!name && !lastName) return "Empleado no disponible";

    // Si solo hay nombre, mostrar solo el nombre
    if (name && !lastName) return name;

    // Si solo hay apellido, mostrar solo el apellido
    if (!name && lastName) return lastName;

    // Formatear nombres: primer nombre completo, segundo nombre con inicial
    const nameParts = name.trim().split(/\s+/);
    let formattedName = "";

    if (nameParts.length >= 2) {
        const firstName = nameParts[ 0 ];
        const secondNameInitial = nameParts[ 1 ].charAt(0).toUpperCase();
        formattedName = `${firstName} ${secondNameInitial}.`;
    } else {
        formattedName = name;
    }

    // Formatear apellidos: primer apellido completo, segundo apellido con inicial
    const lastNameParts = lastName.trim().split(/\s+/);
    if (lastNameParts.length >= 2) {
        const firstLastName = lastNameParts[ 0 ];
        const secondLastNameInitial = lastNameParts[ 1 ].charAt(0).toUpperCase();
        return `${formattedName} ${firstLastName} ${secondLastNameInitial}.`;
    } else {
        // Si solo hay un apellido
        return `${formattedName} ${lastName}`;
    }
};

export function EquipmentModal({ equipment, isOpen, onClose }: EquipmentModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[68vh] overflow-y-auto p-0 leading-9 w-[90vw] max-w-[1000px] h-auto">
                <DialogHeader className="px-8 py-6 border-b bg-gradient-to-r from-[#5E3583]/5 to-transparent">
                    <DialogTitle className="flex items-center gap-4 text-2xl font-bold">
                        <div className="p-2 rounded-lg bg-[#5E3583]/10">
                            {getTypeIcon(equipment.type)}
                        </div>
                        <div className="flex flex-col">
                            <span>Equipo #{equipment.id}</span>
                            <span className="text-base font-medium text-muted-foreground">
                                {getDeviceTypeLabel(equipment.type)} • {equipment.brand || 'Sin marca'} {equipment.model || 'Sin modelo'}
                            </span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="px-8">
                    <div className="space-y-2">
                        {/* Status and Basic Info Row */}
                        <div className="flex flex-wrap gap-4 items-center justify-between p-6 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Estado Actual</p>
                                    <Badge className={`${getDeviceStatusColor(equipment.status)} px-4 py-2 text-sm font-semibold`}>
                                        {getDeviceStatusLabel(equipment.status)}
                                    </Badge>
                                </div>
                                <Separator orientation="vertical" className="h-12" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Tipo de Uso</p>
                                    <Badge variant="outline" className="border-[#5E3583] text-[#5E3583] px-4 py-2 text-sm font-semibold">
                                        {getDeviceUseTypeLabel(equipment.useType)}
                                    </Badge>
                                </div>
                            </div>

                            {equipment.assignedDate && (
                                <div className="text-right">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Fecha de Asignación</p>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <CalendarDays className="h-4 w-4 text-[#5E3583]" />
                                        {formatDate(equipment.assignedDate)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Equipment Details */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-1">
                                    <CardTitle className="flex items-center gap-3 text-lg text-[#5E3583]">
                                        <Tag className="h-5 w-5" />
                                        Detalles del Equipo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Marca</p>
                                            <p className="font-semibold text-lg">{equipment.brand || "No especificada"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Modelo</p>
                                            <p className="font-semibold text-lg">{equipment.model || "No especificado"}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Número de Serie</p>
                                            <div className="font-mono text-sm bg-slate-100 px-4 py-3 rounded-lg border">
                                                {equipment.serialNumber || "No disponible"}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Dirección MAC</p>
                                            <div className="font-mono text-sm bg-slate-100 px-4 py-3 rounded-lg border">
                                                {equipment.macAddress || "No disponible"}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Assignment Information */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-1">
                                    <CardTitle className="flex items-center gap-3 text-lg text-[#5E3583]">
                                        <User className="h-5 w-5" />
                                        Información de Asignación
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {equipment.client && (
                                        <div className="p-4 bg-[#5E3583]/5 rounded-lg border border-[#5E3583]/20">
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Cliente Asignado</p>
                                            <p className="font-bold text-xl text-[#5E3583]">
                                                {formatClientName(equipment.client)}
                                            </p>
                                        </div>
                                    )}

                                    {equipment.employee && (
                                        <div className="p-4 bg-[#5E3583]/5 rounded-lg border border-[#5E3583]/20">
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Empleado Asignado</p>
                                            <p className="font-bold text-xl text-[#5E3583]">
                                                {formatEmployeeName(equipment.employee)}
                                            </p>
                                        </div>
                                    )}

                                    {equipment.assignedInstallationId && (
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Building className="h-5 w-5 text-[#5E3583]" />
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">ID Instalación</p>
                                                    <p className="font-semibold text-lg">#{equipment.assignedInstallationId}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!equipment.client && !equipment.employee && !equipment.assignedInstallationId && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                            <p>No hay asignaciones activas</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Notes Section */}
                        {equipment.notes && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-lg text-[#5E3583]">
                                        <FileText className="h-5 w-5" />
                                        Notas y Observaciones
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-slate-50 p-6 rounded-lg border">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{equipment.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
