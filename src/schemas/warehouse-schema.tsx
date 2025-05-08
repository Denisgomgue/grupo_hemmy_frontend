import { z } from "zod"

export const WarehouseSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  address: z.string().nullable(),
  responsible: z.string().nullable(),
  maximum_capacity: z.number().int().nonnegative().nullable(),
})

export type WarehouseFormData = z.infer<typeof WarehouseSchema>