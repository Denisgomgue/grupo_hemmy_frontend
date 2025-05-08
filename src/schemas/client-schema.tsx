import { z } from 'zod';

export const AccountStatusEnum = z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']);


export const ClientSchema = z.object({
    id: z.number().optional(),
  
    name: z.string().min(1, "* Nombre es requerido"),
    lastName: z.string().min(1, "* Apellido es requerido"),
    dni: z.string().min(1, "* DNI es requerido").max(8, "* DNI debe tener 8 caracteres"), 
    phone: z.string().optional(),
    address: z.string().optional(),
    installationDate: z.string().min(1, "* Fecha instalación requerida"),
    reference: z.string().optional(),
    paymentDate: z.string().optional(),
    advancePayment: z.boolean().optional().default(false),
    status: AccountStatusEnum, 
    plan: z.number({ required_error: "* Plan es requerido" }),
    sector: z.number({ required_error: "* Sector es requerido" }),
    description: z.string().optional(),
});

export type ClientFormData = z.infer<typeof ClientSchema>;
