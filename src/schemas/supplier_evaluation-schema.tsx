import * as z from "zod"

export const StatusEvaluationManagement = z.enum(['ACTIVE', 'INACTIVE','PENDING','COMPLETED',]);

export const SupplierEvaluationFormSchema = z.object({
    id: z.number().optional(),
    supplier: z.number().nullable().optional(),
    evaluationDate: z.string(),
    final_score: z.number(),
    observation: z.string(),
    recommendation: z.string(),
    user: z.number().nullable().optional(),
    status: StatusEvaluationManagement,
})

export type SupplierEvaluationFormData = z.infer<typeof SupplierEvaluationFormSchema>

