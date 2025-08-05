"use client";

import { Device } from "@/types/devices/device";
import { DeviceCard } from "./device-card";

export const headers = [
    {
        key: 'card',
        label: 'Dispositivo',
        render: (device: Device | undefined, onEdit: (device: Device) => void) => {
            if (!device) {
                return null;
            }
            return <DeviceCard device={device} onEdit={onEdit} />;
        }
    }
]; 