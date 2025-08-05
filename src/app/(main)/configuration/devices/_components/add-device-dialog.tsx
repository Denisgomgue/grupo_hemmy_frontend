"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Device } from "@/types/devices/device"
import { DeviceForm } from "./device-form"

interface AddDeviceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: any) => void
    device?: Device | null
    isLoading?: boolean
    mode?: "add" | "edit"
}

export function AddDeviceDialog({ open, onOpenChange, onSubmit, device, isLoading = false, mode = "add" }: AddDeviceDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{mode === "edit" ? "Editar Dispositivo" : "Agregar Dispositivo"}</DialogTitle>
                </DialogHeader>
                <DeviceForm device={device} onSubmit={onSubmit} isLoading={isLoading} onCancel={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    )
} 