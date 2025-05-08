import { z } from "zod"

export const StatusEnum = z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
export const PaymentMethodEnum = z.enum(["EFECTIVE", "CARD", "OTHER"])

export const TransactionSchema = z.object({
  id: z.number().optional(),
  transaction_type: z.string().nullable(),
  status: StatusEnum.nullable(),
  payment_method: PaymentMethodEnum.nullable(),
  amount: z.number().nullable(),
  transactionDate: z.string().nullable().optional(),
  client: z.number().nullable().optional(),
})

export type TransactionFormData = z.infer<typeof TransactionSchema>