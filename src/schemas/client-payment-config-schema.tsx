import { z } from 'zod';

export const PaymentStatusEnum = z.enum([ 'SUSPENDED', 'EXPIRED', 'EXPIRING', 'PAID' ]);

export const ClientPaymentConfigSchema = z.object({
    id: z.number().optional(),
    initialPaymentDate: z.date({ required_error: "* La fecha de próximo pago es requerida" }),
    installationId: z.number({ required_error: "* La instalación es requerida" }),
    advancePayment: z.boolean().default(false),
    paymentStatus: PaymentStatusEnum.default("PAID"),
});

export const UpdateClientPaymentConfigSchema = ClientPaymentConfigSchema.partial();

export type ClientPaymentConfigFormData = z.infer<typeof ClientPaymentConfigSchema>;
export type UpdateClientPaymentConfigFormData = z.infer<typeof UpdateClientPaymentConfigSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>; 