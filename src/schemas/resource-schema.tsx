import * as z from "zod"

export const resourceSchema = z.object({
    routeCode: z.string()
        .min(1, "El código de ruta es requerido")
        .max(50, "El código de ruta no puede exceder 50 caracteres")
        .regex(/^[a-z0-9-]+$/, "El código de ruta solo puede contener letras minúsculas, números y guiones"),
    displayName: z.string()
        .min(1, "El nombre de visualización es requerido")
        .max(100, "El nombre de visualización no puede exceder 100 caracteres"),
    description: z.string()
        .max(500, "La descripción no puede exceder 500 caracteres")
        .optional(),
    isActive: z.boolean().default(true),
    orderIndex: z.number()
        .min(0, "El índice de orden debe ser mayor o igual a 0")
        .optional()
})

export const createResourceSchema = resourceSchema

export const updateResourceSchema = resourceSchema.partial()

export type ResourceFormData = z.infer<typeof resourceSchema>
export type CreateResourceFormData = z.infer<typeof createResourceSchema>
export type UpdateResourceFormData = z.infer<typeof updateResourceSchema> 