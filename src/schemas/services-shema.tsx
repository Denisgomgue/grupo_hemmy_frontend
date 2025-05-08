import * as z from "zod"
export const ServiceStatus = z.enum(['ACTIVE', 'INACTIVE']);


export const servicesFormSchema = z.object({
    id: z.number(),
    name: z.string().min(1, "* El nombre es requerido").nullable(),
    description: z.string().nullable().optional(),
    status: ServiceStatus,
})

export type ServicesFormData = z.infer<typeof servicesFormSchema>

