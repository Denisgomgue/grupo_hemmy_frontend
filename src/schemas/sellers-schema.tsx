import { z } from "zod"

export const SellerSchema = z.object({
    id: z.number().optional(),
    people: z.number().nullable(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    startDate: z.string(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    typeDocument: z.string(),
    document: z.string(),
    otherDocumentName: z.string().optional(),
    peopleFullName: z.string().optional(),
})

export type SellerFormData = z.infer<typeof SellerSchema>

