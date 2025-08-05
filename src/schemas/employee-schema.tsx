import * as z from "zod"

export const employeeSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(1, "El apellido es requerido").min(2, "El apellido debe tener al menos 2 caracteres"),
    dni: z.string().min(1, "El DNI es requerido").regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
    phone: z.string().optional().or(z.literal("")).refine((val) => {
        if (!val) return true
        const phoneRegex = /^(\+51\s?)?[9]\d{8}$/
        return phoneRegex.test(val)
    }, "Número de teléfono inválido"),
    roleId: z.number().min(1, "Debe seleccionar un rol"),
});

export const updateEmployeeSchema = employeeSchema.partial();

export type EmployeeFormData = z.infer<typeof employeeSchema>
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema> 