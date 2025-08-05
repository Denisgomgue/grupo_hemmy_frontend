import { Role, RoleHasPermission } from "@/types/roles/role";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Función para obtener el nombre del rol
export const getRoleName = (role: Role): string => {
    return role.name || "Sin nombre";
};

// Función para obtener la descripción del rol
export const getRoleDescription = (role: Role): string => {
    return role.description || "Sin descripción";
};

// Función para obtener el estado del rol
export const getRoleStatus = (role: Role): string => {
    if (role.allowAll) return "Acceso Total";
    if (role.isPublic) return "Público";
    return "Privado";
};

// Función para obtener el color del estado del rol
export const getRoleStatusColor = (role: Role): string => {
    if (role.allowAll) return "text-red-600";
    if (role.isPublic) return "text-green-600";
    return "text-blue-600";
};

// Función para obtener el badge del estado del rol
export const getRoleStatusBadge = (role: Role): string => {
    if (role.allowAll) return "destructive";
    if (role.isPublic) return "default";
    return "secondary";
};

// Función para obtener el icono del rol
export const getRoleIcon = (roleName: string): string => {
    const role = roleName.toLowerCase();
    switch (role) {
        case "admin":
        case "administrador":
            return "👑";
        case "manager":
        case "gerente":
            return "👔";
        case "technician":
        case "técnico":
            return "🔧";
        case "operator":
        case "operador":
            return "💼";
        case "user":
        case "usuario":
            return "👤";
        default:
            return "🎭";
    }
};

// Función para obtener el color del avatar basado en el nombre
export const getRoleAvatarColor = (name: string): string => {
    const colors = [
        "bg-purple-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-red-500",
        "bg-teal-500"
    ];

    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[ seed % colors.length ];
};

// Función para generar iniciales del rol
export const getRoleInitials = (role: Role): string => {
    const name = role.name || "";
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
};

// Función para contar permisos del rol
export const getRolePermissionsCount = (role: Role): number => {
    return role.role_has_permissions?.length || 0;
};

// Función para obtener permisos del rol
export const getRolePermissions = (role: Role): RoleHasPermission[] => {
    return role.role_has_permissions || [];
};

// Función para verificar si el rol tiene permisos
export const hasRolePermissions = (role: Role): boolean => {
    return (role.role_has_permissions?.length || 0) > 0;
};

// Función para contar empleados del rol
export const getRoleEmployeesCount = (role: Role): number => {
    return role.employees?.length || 0;
};

// Función para formatear fecha
export const formatRoleDate = (date: Date | string): string => {
    if (!date) return "";
    
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    // Validar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
        return "Fecha inválida";
    }
    
    return format(dateObj, "dd/MM/yyyy", { locale: es });
};

// Función para obtener estadísticas de roles
export const getRoleStats = (roles: Role[]) => {
    const stats = {
        total: roles.length,
        publicRoles: 0,
        privateRoles: 0,
        rolesWithPermissions: 0,
        rolesWithoutPermissions: 0,
        rolesWithEmployees: 0,
        rolesWithoutEmployees: 0,
        allowAllRoles: 0,
    };

    roles.forEach(role => {
        if (role.isPublic) stats.publicRoles++;
        else stats.privateRoles++;

        if (hasRolePermissions(role)) {
            stats.rolesWithPermissions++;
        } else {
            stats.rolesWithoutPermissions++;
        }

        if (getRoleEmployeesCount(role) > 0) {
            stats.rolesWithEmployees++;
        } else {
            stats.rolesWithoutEmployees++;
        }

        if (role.allowAll) stats.allowAllRoles++;
    });

    return stats;
};

// Función para ordenar roles
export const sortRoles = (roles: Role[], sortBy: string = "name", order: "asc" | "desc" = "asc") => {
    return [ ...roles ].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
            case "name":
                aValue = getRoleName(a);
                bValue = getRoleName(b);
                break;
            case "permissions":
                aValue = getRolePermissionsCount(a);
                bValue = getRolePermissionsCount(b);
                break;
            case "employees":
                aValue = getRoleEmployeesCount(a);
                bValue = getRoleEmployeesCount(b);
                break;
            case "created_at":
                aValue = new Date(a.created_at);
                bValue = new Date(b.created_at);
                break;
            default:
                aValue = getRoleName(a);
                bValue = getRoleName(b);
        }

        if (order === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
};

// Función para obtener acciones de permisos
export const getPermissionActions = (roleHasPermission: RoleHasPermission): string[] => {
    return roleHasPermission.actions || [];
};

// Función para obtener restricciones de permisos
export const getPermissionRestrictions = (roleHasPermission: RoleHasPermission): string[] => {
    return roleHasPermission.restrictions || [];
};

// Función para verificar si un permiso es subruta
export const isSubRoute = (roleHasPermission: RoleHasPermission): boolean => {
    return roleHasPermission.isSubRoute;
};

// Función para obtener el código de ruta formateado
export const getFormattedRouteCode = (routeCode: string): string => {
    return routeCode.replace(/([A-Z])/g, ' $1').trim();
};

// Función para obtener el nombre del permiso
export const getPermissionName = (roleHasPermission: RoleHasPermission): string => {
    return roleHasPermission.name || "Sin nombre";
};

// Función para obtener el nombre del permiso relacionado
export const getRelatedPermissionName = (roleHasPermission: RoleHasPermission): string => {
    return roleHasPermission.permission?.name || "Sin permiso relacionado";
}; 