import { z } from 'zod';

export const PaymentSchema = z.object({
    id: z.number().optional(),
    paymentDate: z.string().min(1, "* La fecha de pago es requerida"),
    transfername: z.string().min(1, "* El nombre del transfe es requerido"),
    reference: z.string().min(1, "* La referencia es requerida"),
    reconnection: z.boolean().optional(),
    amount: z.number().min(0, "* El monto debe ser positivo").nullable().optional(),
    discount: z.number().min(0, "* El descuento debe ser positivo").nullable().optional(),
    dueDate: z.date().optional(),
    client: z.number({ required_error: "* El cliente es requerido" }),
    sector: z.number({ required_error: "* El sector es requerido" }),

});

export type PaymentFormData = z.infer<typeof PaymentSchema>;
