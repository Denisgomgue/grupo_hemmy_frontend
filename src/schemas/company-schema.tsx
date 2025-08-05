import * as z from "zod"

// Schema para crear empresa
export const createCompanySchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(255, "El nombre no puede exceder 255 caracteres"),
    businessName: z.string().min(2, "La razón social debe tener al menos 2 caracteres").max(255, "La razón social no puede exceder 255 caracteres"),
    ruc: z.string().length(11, "El RUC debe tener exactamente 11 dígitos").regex(/^\d+$/, "El RUC solo debe contener números"),
    address: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    website: z.string().url("URL inválida").optional().or(z.literal("")),
    description: z.string().optional(),
    slogan: z.string().optional(),
    mission: z.string().optional(),
    vision: z.string().optional(),
    socialMedia: z.string().optional(),
    businessHours: z.string().optional(),
    taxCategory: z.string().optional(),
    economicActivity: z.string().optional(),
    isActive: z.boolean().default(true),
})

// Schema para actualizar empresa (todos los campos opcionales)
export const updateCompanySchema = createCompanySchema.partial()

// Schema para validar RUC
export const rucSchema = z.object({
    ruc: z.string().length(11, "El RUC debe tener exactamente 11 dígitos").regex(/^\d+$/, "El RUC solo debe contener números"),
})

// Schema para validar email
export const emailSchema = z.object({
    email: z.string().email("Email inválido"),
})

// Schema para validar teléfono
export const phoneSchema = z.object({
    phone: z.string().min(9, "El teléfono debe tener al menos 9 dígitos").regex(/^[\d\s\-\+\(\)]+$/, "Formato de teléfono inválido"),
})

// Schema para validar redes sociales
export const socialMediaSchema = z.object({
    facebook: z.string().url("URL de Facebook inválida").optional().or(z.literal("")),
    instagram: z.string().url("URL de Instagram inválida").optional().or(z.literal("")),
    twitter: z.string().url("URL de Twitter inválida").optional().or(z.literal("")),
    linkedin: z.string().url("URL de LinkedIn inválida").optional().or(z.literal("")),
    youtube: z.string().url("URL de YouTube inválida").optional().or(z.literal("")),
})

// Schema para validar archivo de logo
export const logoFileSchema = z.object({
    file: z
        .instanceof(File, { message: "Debe seleccionar un archivo" })
        .refine((file) => file.size <= 5 * 1024 * 1024, "El archivo no puede exceder 5MB")
        .refine(
            (file) => [ "image/png", "image/jpeg", "image/jpg", "image/svg+xml" ].includes(file.type),
            "Solo se permiten archivos PNG, JPG, JPEG o SVG"
        ),
})

// Schema para validar tipo de logo
export const logoTypeSchema = z.object({
    type: z.enum([ "normal", "horizontal", "reduced", "negative" ], {
        errorMap: () => ({ message: "Tipo de logo inválido" }),
    }),
})

// Schema para información de contacto
export const contactInfoSchema = z.object({
    phone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    website: z.string().url("URL inválida").optional().or(z.literal("")),
    address: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
})

// Schema para información corporativa
export const corporateInfoSchema = z.object({
    slogan: z.string().optional(),
    mission: z.string().optional(),
    vision: z.string().optional(),
    businessHours: z.string().optional(),
    taxCategory: z.string().optional(),
    economicActivity: z.string().optional(),
})

// Schema para información básica
export const basicInfoSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    businessName: z.string().min(2, "La razón social debe tener al menos 2 caracteres"),
    ruc: z.string().length(11, "El RUC debe tener exactamente 11 dígitos").regex(/^\d+$/, "El RUC solo debe contener números"),
    description: z.string().optional(),
})

// Tipos TypeScript derivados de los schemas
export type CreateCompanyFormData = z.infer<typeof createCompanySchema>
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>
export type RucFormData = z.infer<typeof rucSchema>
export type EmailFormData = z.infer<typeof emailSchema>
export type PhoneFormData = z.infer<typeof phoneSchema>
export type SocialMediaFormData = z.infer<typeof socialMediaSchema>
export type LogoFileFormData = z.infer<typeof logoFileSchema>
export type LogoTypeFormData = z.infer<typeof logoTypeSchema>
export type ContactInfoFormData = z.infer<typeof contactInfoSchema>
export type CorporateInfoFormData = z.infer<typeof corporateInfoSchema>
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>

// Funciones de validación adicionales
export const validateRUC = (ruc: string): boolean => {
    if (ruc.length !== 11) return false;
    if (!/^\d+$/.test(ruc)) return false;

    // Validación básica de RUC peruano
    const tipo = ruc.substring(0, 2);
    const numero = ruc.substring(2, 10);
    const digito = ruc.substring(10, 11);

    // Tipos válidos de RUC
    const tiposValidos = [ '10', '15', '17', '20' ];
    if (!tiposValidos.includes(tipo)) return false;

    return true;
};

export const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');

    // Número peruano: 9 dígitos o 11 dígitos con código de país
    if (cleanPhone.length === 9) return true;
    if (cleanPhone.length === 11 && cleanPhone.startsWith('51')) return true;

    return false;
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateWebsite = (website: string): boolean => {
    try {
        new URL(website);
        return true;
    } catch {
        return false;
    }
}; 