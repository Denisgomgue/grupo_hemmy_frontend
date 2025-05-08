import { z } from 'zod';

// Enumeraciones
export const PaymentTypeEnum = z.enum(['TRANSFER', 'CASH', 'YAPE', 'PLIN', 'OTHER']);
export const PaymentStatusEnum = z.enum(['PENDING', 'PAYMENT_DAILY', 'LATE_PAYMENT']);

// Esquema base
const paymentBaseSchema = {
    id: z.number().optional(),
    paymentDate: z.string().min(1, "* La fecha de pago es requerida"),
    reference: z.string().min(1, "* La referencia es requerida").optional(),
    reconnection: z.boolean().optional(),
    paymentType: PaymentTypeEnum,
    transfername: z.string().optional(),
    state: PaymentStatusEnum,
    amount: z.number().min(0, "* El monto debe ser positivo"),
    discount: z.number().min(0, "* El descuento debe ser positivo").default(0),
    dueDate: z.string().min(1, "* La fecha de vencimiento es requerida"),
    client: z.number({ required_error: "* El cliente es requerido" }),
};

// Crear el esquema final con refinamiento
export const PaymentSchema = z.object(paymentBaseSchema).refine((data) => {
    // Si el tipo de pago es TRANSFER, YAPE o PLIN, el nombre de transferencia es obligatorio
    if (['TRANSFER', 'YAPE', 'PLIN'].includes(data.paymentType)) {
        return !!data.transfername && data.transfername.trim().length > 0;
    }
    // Para otros tipos de pago, no es obligatorio
    return true;
}, {
    message: "* El nombre/referencia es obligatorio para transferencias, Yape o Plin",
    path: ["transfername"],
});

// Tipo inferido para el formulario
export type PaymentFormData = z.infer<typeof PaymentSchema>;
