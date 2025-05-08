import { z } from 'zod';
export const PaymentTypeEnum = z.enum(['TRANSFER', 'CASH', 'YAPE', 'PLIN', 'OTHER']);
export const PaymentStatusEnum = z.enum(['PENDING', 'PAYMENT_DAILY', 'LATE_PAYMENT']);

export const PaymentSchema = z.object({
    id: z.number().optional(),
    paymentDate: z.string().min(1, "* La fecha de pago es requerida"),
    reference: z.string().min(1, "* La referencia es requerida").optional(),
    reconnection: z.boolean().optional(),
    paymentType: PaymentTypeEnum,
    transfername: z.string().min(1, "* El nombre del transfe es requerido").optional(),
    state: PaymentStatusEnum,
    amount: z.number().min(0, "* El monto debe ser positivo").nullable().optional(),
    discount: z.number().min(0, "* El descuento debe ser positivo").nullable().optional(),
    dueDate: z.string().optional(),
    client: z.number({ required_error: "* El cliente es requerido" }),

});

export type PaymentFormData = z.infer<typeof PaymentSchema>;
