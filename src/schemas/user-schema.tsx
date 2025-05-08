import * as z from "zod";

export const formSchema = z
    .object({
        name: z.string().min(2, {
            message: "Complete este campo",
        }),
        surname: z.string().min(2, {
            message: "Complete este campo",
        }),
        email: z.string().email({
            message: "Por favor ingrese un email válido.",
        }),
        phone: z.string().optional(),
        roleId: z.number().min(1, {
            message: "Complete este campo",
        }).optional(),
        documentNumber: z.string().min(1, {
            message: "Complete este campo",
        }),
        documentType: z.string().min(1, {
            message: "Complete este campo",
        }),
        username: z.string().min(3, {
            message: "Complete este campo",
        }),
        password: z.string().min(8, {
            message: "Complete este campo",
        }).optional(),
        confirmPassword: z.string().min(8, {
            message: "Complete este campo",
        }).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

export type UserFormData = z.infer<typeof formSchema>;