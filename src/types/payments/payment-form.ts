import { z } from 'zod';

// Esquema para datos de pago del frontend (con clientId)
export const FrontendPaymentSchema = z.object({
    clientId: z.number({ required_error: "* El cliente es requerido" }),
    amount: z.coerce.number().min(0, "* El monto debe ser positivo"),
    paymentDate: z.string().optional(),
    paymentType: z.string().optional(),
    reference: z.string().optional(),
    transfername: z.string().optional(),
    reconnection: z.boolean().default(false),
    discount: z.coerce.number().min(0, "* El descuento debe ser positivo").default(0),
    dueDate: z.string().optional(),
    engagementDate: z.string().optional(),
    status: z.string().optional(),
    advancePayment: z.boolean().default(false),
});

// Esquema para datos de pago del backend (con client)
export const BackendPaymentSchema = z.object({
    client: z.number({ required_error: "* El cliente es requerido" }),
    amount: z.coerce.number().min(0, "* El monto debe ser positivo"),
    paymentDate: z.string().optional(),
    paymentType: z.string().optional(),
    reference: z.string().optional(),
    transfername: z.string().optional(),
    reconnection: z.boolean().default(false),
    discount: z.coerce.number().min(0, "* El descuento debe ser positivo").default(0),
    dueDate: z.string().optional(),
    engagementDate: z.string().optional(),
    status: z.string().optional(),
    advancePayment: z.boolean().default(false),
});

// Tipos inferidos
export type FrontendPaymentData = z.infer<typeof FrontendPaymentSchema>;
export type BackendPaymentData = z.infer<typeof BackendPaymentSchema>;

// Interfaz para la función de transformación
export interface PaymentDataTransformer {
    transform: (data: FrontendPaymentData) => BackendPaymentData;
    validate: (data: BackendPaymentData) => boolean;
} 