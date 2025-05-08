import * as z from "zod"

export const stateFormSchema = z.object({
    id: z.number(),
    name: z.string().min(1, "* El tipo de documento es requerido").nullable(),
    country: z.number().nullable().optional(),
})

export type StateFormData = z.infer<typeof stateFormSchema>

