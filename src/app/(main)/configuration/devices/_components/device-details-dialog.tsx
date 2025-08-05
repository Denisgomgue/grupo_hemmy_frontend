"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Device } from "@/types/devices/device"
import { Button } from "@/components/ui/button"
import { Trash2, PencilLine } from "lucide-react"

interface DeviceDetailsDialogProps {
    device: Device
    isOpen: boolean
    onClose: () => void
    onEdit: (device: Device) => void
    onDelete: (deviceId: number) => void
}

export function DeviceDetailsDialog({
    device,
    isOpen,
    onClose,
    onEdit,
    onDelete
}: DeviceDetailsDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden">
                {/* Encabezado */}
                <div className="p-6 flex justify-between items-center bg-primary/90 text-white">
                    <div className="flex items-center gap-2">
                        <div className="text-lg font-semibold">Detalles del Dispositivo</div>
                        <div className="text-sm opacity-80">#{device.id.toString().padStart(4, "0")}</div>
                    </div>
                </div>
                {/* Información principal */}
                <div className="p-6">
                    <div className="flex flex-col gap-2">
                        <div><b>Serial:</b> {device.serial_number}</div>
                        <div><b>Tipo:</b> {device.type}</div>
                        <div><b>Estado:</b> {device.status}</div>
                        <div><b>Marca:</b> {device.brand}</div>
                        <div><b>Modelo:</b> {device.model}</div>
                        <div><b>MAC:</b> {device.mac_address}</div>
                        <div><b>IP:</b> {device.ip_address}</div>
                    </div>
                </div>
                {/* Acciones */}
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <Button
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(device.id)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                    </Button>
                    <Button
                        className="bg-primary hover:bg-primary/90 text-white"
                        onClick={() => onEdit(device)}
                    >
                        <PencilLine className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 