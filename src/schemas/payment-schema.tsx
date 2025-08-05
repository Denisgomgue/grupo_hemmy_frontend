import { z } from 'zod';

// Enumeraciones
export const PaymentTypeEnum = z.enum([ 'TRANSFER', 'CASH', 'YAPE', 'PLIN', 'OTHER' ]);
export const PaymentStatusEnum = z.enum([ 'PENDING', 'PAYMENT_DAILY', 'LATE_PAYMENT', 'VOIDED' ]);

// Esquema base
export const PaymentSchema = z.object({
    id: z.number().optional(),
    code: z.string().optional(),
    paymentDate: z.string({ required_error: "* La fecha de pago es requerida" }),
    reference: z.string().optional(),
    reconnection: z.boolean().default(false),
    amount: z.coerce.number().min(0, "* El monto debe ser positivo"),
    baseAmount: z.coerce.number().min(0, "* El monto base debe ser positivo").optional(),
    reconnectionFee: z.coerce.number().min(0, "* El cargo de reconexión debe ser positivo").default(0),
    status: PaymentStatusEnum.optional(),
    paymentType: PaymentTypeEnum.optional(),
    transfername: z.string().optional(), // Cambiado de transferName a transfername
    discount: z.coerce.number().min(0, "* El descuento debe ser positivo").default(0),
    dueDate: z.string().optional(),
    engagementDate: z.string().optional(), // Fecha de compromiso para pagos pendientes
    clientId: z.number({ required_error: "* El cliente es requerido" }),
    advancePayment: z.boolean().default(false),
});

// Tipo inferido para el formulario
export type PaymentFormData = z.infer<typeof PaymentSchema>;
export type PaymentType = z.infer<typeof PaymentTypeEnum>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
