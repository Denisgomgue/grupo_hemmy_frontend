import * as z from "zod"

// Opciones predefinidas para tipos de documento
const DOCUMENT_TYPE_OPTIONS = [
    { value: "DNI", label: "DNI" },
    { value: "CE", label: "Carné de Extranjería" },
    { value: "PASSPORT", label: "Pasaporte" },
    { value: "RUC", label: "RUC" },
    { value: "OTHER", label: "Otro" },
]

const userSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
    surname: z.string().optional(),
    email: z.string().email("Email inválido").min(1, "El email es requerido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().optional(),
    documentType: z.string().optional(),
    documentNumber: z.string().optional(),
    username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(50, "El nombre de usuario no puede exceder 50 caracteres"),
    phone: z.string().optional(),
    address: z.string().optional(),
    roleId: z.string().optional(),
    isActive: z.boolean().default(true),
    allowAll: z.boolean().default(false),
    isPublic: z.boolean().default(false),
}).refine((data) => {
    if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Las contraseñas no coinciden",
    path: [ "confirmPassword" ],
});

// Schema para edición (sin password requerido)
const userEditSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
    surname: z.string().optional(),
    email: z.string().email("Email inválido").min(1, "El email es requerido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
    confirmPassword: z.string().optional(),
    documentType: z.string().optional(),
    documentNumber: z.string().optional(),
    username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(50, "El nombre de usuario no puede exceder 50 caracteres"),
    phone: z.string().optional(),
    address: z.string().optional(),
    roleId: z.string().optional(),
    isActive: z.boolean().default(true),
    allowAll: z.boolean().default(false),
    isPublic: z.boolean().default(false),
}).refine((data) => {
    if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Las contraseñas no coinciden",
    path: [ "confirmPassword" ],
});

type UserFormData = z.infer<typeof userSchema>
type UserEditFormData = z.infer<typeof userEditSchema>

// Exportar los tipos y schemas
export type { UserFormData, UserEditFormData }
export const UserFormSchema = userSchema
export const UserEditFormSchema = userEditSchema