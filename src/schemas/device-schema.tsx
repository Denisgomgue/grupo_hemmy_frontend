import * as z from "zod"

export const DeviceTypeEnum = z.enum([ "router", "deco", "ont", "switch", "laptop", "crimpadora", "tester", "antena", "fibra", "conector", "otro" ]);
export const DeviceStatusEnum = z.enum([ "STOCK", "ASSIGNED", "SOLD", "MAINTENANCE", "LOST", "USED" ]);
export const DeviceUseTypeEnum = z.enum([ "CLIENT", "EMPLOYEE", "COMPANY", "CONSUMABLE" ]);

export const deviceSchema = z.object({
    id: z.number().optional(),
    serialNumber: z.string().min(1, "El número de serie es requerido"),
    macAddress: z.string().optional().or(z.literal("")).refine((val) => {
        if (!val) return true
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
        return macRegex.test(val)
    }, "Dirección MAC inválida"),
    type: DeviceTypeEnum,
    brand: z.string().optional().or(z.literal("")),
    model: z.string().optional().or(z.literal("")),
    status: DeviceStatusEnum,
    assignedDate: z.string().optional().or(z.literal("")),
    useType: DeviceUseTypeEnum,
    assignedInstallationId: z.number().optional(),
    assignedEmployeeId: z.number().optional(),
    assignedClientId: z.number().optional(),
    notes: z.string().optional().or(z.literal("")),
});

export const updateDeviceSchema = deviceSchema.partial().omit({ serialNumber: true });

export type DeviceFormData = z.infer<typeof deviceSchema>
export type UpdateDeviceFormData = z.infer<typeof updateDeviceSchema>
export type DeviceType = z.infer<typeof DeviceTypeEnum>;
export type DeviceStatus = z.infer<typeof DeviceStatusEnum>;
export type DeviceUseType = z.infer<typeof DeviceUseTypeEnum>; 