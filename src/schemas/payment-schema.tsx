import { z } from 'zod';

// Enumeraciones
export const PaymentTypeEnum = z.enum([ 'TRANSFER', 'CASH', 'YAPE', 'PLIN', 'OTHER' ]);
export const PaymentStatusEnum = z.enum([ 'PENDING', 'PAYMENT_DAILY', 'LATE_PAYMENT' ]);

// Esquema base
const paymentBaseSchema = {
    id: z.number().optional(),
    paymentDate: z.string().min(1, "* La fecha de pago es requerida"),
    reference: z.string().optional(),
    reconnection: z.boolean().optional(),
    paymentType: PaymentTypeEnum,
    transfername: z.string().optional(),
    state: PaymentStatusEnum,
    amount: z.number().min(0, "* El monto debe ser positivo"),
    discount: z.number().min(0, "* El descuento debe ser positivo").default(0),
    dueDate: z.string().min(1, "* La fecha de vencimiento es requerida"),
    client: z.number({ required_error: "* El cliente es requerido" }),
    advancePayment: z.boolean().default(false),
    referenceImage: z.instanceof(File).optional().nullable(),
};

// Crear el esquema final con refinamiento
export const PaymentSchema = z.object({
    client: z.number().optional(),
    amount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
    paymentDate: z.string().optional(),
    paymentType: PaymentTypeEnum,
    reference: z.string().optional(),
    transfername: z.string().optional(),
    reconnection: z.boolean(),
    discount: z.number().min(0, "El descuento debe ser mayor o igual a 0").optional(),
    dueDate: z.string(),
    advancePayment: z.boolean().default(false),
    referenceImage: z.instanceof(File).optional().nullable(),
});

// Tipo inferido para el formulario
export type PaymentFormData = z.infer<typeof PaymentSchema>;
