import * as z from "zod"

const roleHasPermissionSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    routeCode: z.string().min(1, "El código de ruta es requerido"),
    actions: z.array(z.string()).optional(),
    restrictions: z.array(z.string()).optional(),
    isSubRoute: z.boolean().default(false),
    permissionId: z.number().min(1, "Debe seleccionar un permiso"),
});

export const roleSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres"),
    description: z.string().optional().or(z.literal("")),
    allowAll: z.boolean().default(false),
    isPublic: z.boolean().default(false),
    role_has_permissions: z.array(roleHasPermissionSchema).min(1, "Debe agregar al menos un permiso"),
});

export const updateRoleSchema = roleSchema.partial();

export type RoleFormData = z.infer<typeof roleSchema>
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>
export type RoleHasPermissionFormData = z.infer<typeof roleHasPermissionSchema> 