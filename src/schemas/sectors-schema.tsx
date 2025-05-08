import * as z from "zod";


export const sectorsFormSchema = z.object({
    id: z.number(),
    name: z.string().min(1, "* El nombre es requerido").nullable(),
    description: z.string().nullable().optional(),
})

export type SectorsFormData = z.infer<typeof sectorsFormSchema>

