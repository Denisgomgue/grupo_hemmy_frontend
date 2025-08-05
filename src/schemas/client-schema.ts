import { z } from "zod";
import { InstallationSchema } from "./installation-schema";

export const AccountStatusEnum = z.enum([ "ACTIVE", "SUSPENDED", "INACTIVE" ]);

export const ClientSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "* Los nombres son requeridos"),
    lastName: z.string().min(1, "* Los apellidos son requeridos"),
    dni: z.string()
        .min(8, "* DNI debe tener 8 dígitos")
        .max(8, "* DNI debe tener 8 dígitos")
        .regex(/^\d+$/, "* DNI solo debe contener números"),
    phone: z.string()
        .min(1, "* El teléfono es requerido")
        .refine((phone) => {
            const cleanPhone = phone.replace(/\D/g, '');
            return cleanPhone.length >= 9;
        }, "* Teléfono debe tener al menos 9 dígitos"),
    address: z.string().min(1, "* La dirección es requerida"),
    description: z.string().optional().or(z.literal('')),
    birthdate: z.date().optional(),
    status: AccountStatusEnum.default("ACTIVE"),
    // Campos de instalación
    installationDate: z.date().optional(),
    plan: z.number().optional(),
    sector: z.number().optional(),
    reference: z.string().optional(),
    ipAddress: z.string().optional(),
    referenceImage: z.any().optional(), // File o string
    // Campos de pago
    paymentDate: z.date().optional(),
    advancePayment: z.boolean().optional(),
    // Campos de dispositivos
    routerSerial: z.string().optional(),
    decoSerial: z.string().optional(),
    // instalacion
    installationId: z.number().optional(),
   
});

export type ClientFormData = z.infer<typeof ClientSchema>;
export type AccountStatus = z.infer<typeof AccountStatusEnum>; 
export type InstallationFormData = z.infer<typeof InstallationSchema>;