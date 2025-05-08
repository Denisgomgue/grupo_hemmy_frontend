import * as z from "zod"

export const TypeDocumentSupplierManagement = z.enum(['DNI', 'CARNE_EXTRANJERIA', 'PASAPORTE', 'OTHER',]);

export const StatusSupplierManagement = z.enum(['ACTIVE', 'INACTIVE',]);

export const SupplierManagementFormSchema = z.object({
    id: z.number().optional(),
    type_document: TypeDocumentSupplierManagement,
    type_document_name: z.string(),
    document: z.string(),
    supplier_name: z.string(),
    category: z.string(),
    business_name: z.string(),
    address: z.string(),
    phone: z.string(),
    email: z.string(),
    status: StatusSupplierManagement,
})

export type SupplierManagementFormData = z.infer<typeof SupplierManagementFormSchema>

