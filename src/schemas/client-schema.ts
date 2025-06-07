import { z } from "zod";

export const AccountStatusEnum = z.enum([ "ACTIVE", "SUSPENDED", "INACTIVE" ]);
export const PaymentStatusEnum = z.enum([ "PAID", "EXPIRED", "EXPIRING", "SUSPENDED" ]);

const FileSchema = z.custom<File>((val) => val instanceof File || val === null || val === undefined)
    .nullable()
    .optional();

export const ClientSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "* Nombre es requerido"),
    lastName: z.string().min(1, "* Apellido es requerido"),
    dni: z.string()
        .min(8, "* DNI debe tener 8 dígitos")
        .max(8, "* DNI debe tener 8 dígitos")
        .regex(/^\d+$/, "* DNI solo debe contener números"),
    phone: z.string()
        .min(9, "* Teléfono debe tener al menos 9 dígitos")
        .regex(/^\d+$/, "* Teléfono solo debe contener números")
        .optional()
        .or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    installationDate: z.string().min(1, "* Fecha instalación requerida"),
    reference: z.string().optional().or(z.literal('')),
    paymentDate: z.string().min(1, "* Fecha de pago requerida"),
    advancePayment: z.boolean().default(false),
    status: AccountStatusEnum.default("ACTIVE"),
    plan: z.number({ required_error: "* Plan es requerido" }),
    sector: z.number({ required_error: "* Sector es requerido" }),
    description: z.string().optional().or(z.literal('')),
    paymentStatus: PaymentStatusEnum.optional(),
    decoSerial: z.string().optional().or(z.literal('')),
    routerSerial: z.string().optional().or(z.literal('')),
    referenceImage: FileSchema,
}).refine((data) => {
    if (!data.paymentDate) return true;
    const installDate = new Date(data.installationDate);
    const payDate = new Date(data.paymentDate);
    return installDate <= payDate;
}, {
    message: "* La fecha de instalación debe ser anterior o igual a la fecha de pago",
    path: [ "paymentDate" ]
});

export type ClientFormData = z.infer<typeof ClientSchema>;

export type AccountStatus = z.infer<typeof AccountStatusEnum>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>; 