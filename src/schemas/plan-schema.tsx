import { z } from 'zod';

export const PlanSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "* El nombre es requerido"),
    service: z.number({ required_error: "* Servicio es requerido" }),
    speed: z.number().min(0, "* Velocidad debe ser positiva").nullable().optional(),
    price: z.number().min(0, "* Precio debe ser positivo").nullable().optional(),
    description: z.string().nullable().optional(),

});

export type PlanFormData = z.infer<typeof PlanSchema>;
