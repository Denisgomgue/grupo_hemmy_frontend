"use client";

import { Device } from "@/types/devices/device";
import { headers } from "./headers";
import { Card, CardContent } from "@/components/ui/card";

interface DeviceResponsiveTableProps {
    devices: Device[];
    onEdit: (device: Device) => void;
    isLoading?: boolean;
}

export function DeviceResponsiveTable({ devices, onEdit, isLoading = false }: DeviceResponsiveTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[ ...Array(5) ].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="h-32 bg-gray-200 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!devices || devices.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron dispositivos</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {devices.map((device) => {
                const header = headers.find(h => h.key === 'card');
                if (!header || !header.render) return null;

                return (
                    <Card key={device.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                            {header.render(device, onEdit)}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
} 