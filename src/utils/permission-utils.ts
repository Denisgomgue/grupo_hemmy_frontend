import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Permission, RoleHasPermission } from "@/types/permissions/permission"

// Función para obtener el nombre del permiso
export const getPermissionName = (permission: Permission): string => {
    return permission.name || "Sin nombre";
};

// Función para obtener el código de ruta del permiso
export const getPermissionRouteCode = (permission: Permission): string => {
    return permission.routeCode || "Sin código";
};

// Función para obtener las acciones del permiso
export const getPermissionActions = (permission: Permission): string[] => {
    return permission.actions || [];
};

// Función para obtener las restricciones del permiso
export const getPermissionRestrictions = (permission: Permission): string[] => {
    return permission.restrictions || [];
};

// Función para verificar si el permiso es subruta
export const isPermissionSubRoute = (permission: Permission): boolean => {
    return permission.isSubRoute;
};

// Función para obtener el estado del permiso
export const getPermissionStatus = (permission: Permission): string => {
    if (permission.actions.length > 0) return "Activo";
    return "Inactivo";
};

// Función para obtener el color del estado del permiso
export const getPermissionStatusColor = (permission: Permission): string => {
    if (permission.actions.length > 0) return "text-green-600";
    return "text-red-600";
};

// Función para obtener el badge del estado del permiso
export const getPermissionStatusBadge = (permission: Permission): string => {
    if (permission.actions.length > 0) return "default";
    return "destructive";
};

// Función para obtener el icono del permiso
export const getPermissionIcon = (permissionName: string): string => {
    const name = permissionName.toLowerCase();
    switch (name) {
        case "users":
        case "usuarios":
            return "👥";
        case "roles":
        case "roles":
            return "🛡️";
        case "permissions":
        case "permisos":
            return "🔐";
        case "clients":
        case "clientes":
            return "👤";
        case "payments":
        case "pagos":
            return "💰";
        case "reports":
        case "reportes":
            return "📊";
        case "settings":
        case "configuración":
            return "⚙️";
        case "dashboard":
        case "panel":
            return "📈";
        default:
            return "🔑";
    }
};

// Función para obtener el color del avatar basado en el nombre
export const getPermissionAvatarColor = (name: string): string => {
    const colors = [
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-yellow-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-red-500",
        "bg-teal-500"
    ];

    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[ seed % colors.length ];
};

// Función para generar iniciales del permiso
export const getPermissionInitials = (permission: Permission): string => {
    const name = permission.name || "";
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
};

// Función para contar roles que usan el permiso
export const getPermissionRolesCount = (permission: Permission): number => {
    return permission.role_has_permissions?.length || 0;
};

// Función para obtener roles que usan el permiso
export const getPermissionRoles = (permission: Permission): RoleHasPermission[] => {
    return permission.role_has_permissions || [];
};

// Función para verificar si el permiso tiene roles asignados
export const hasPermissionRoles = (permission: Permission): boolean => {
    return (permission.role_has_permissions?.length || 0) > 0;
};

// Función para formatear fecha
export const formatPermissionDate = (date: Date | string): string => {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Validar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
        return "Fecha inválida";
    }

    return format(dateObj, "dd/MM/yyyy", { locale: es });
};

// Función para obtener estadísticas de permisos
export const getPermissionStats = (permissions: Permission[]) => {
    const stats = {
        total: permissions.length,
        active: 0,
        inactive: 0,
        subRoutes: 0,
        mainRoutes: 0,
        permissionsWithActions: 0,
        permissionsWithoutActions: 0,
        permissionsWithRestrictions: 0,
        permissionsWithoutRestrictions: 0,
    };

    permissions.forEach(permission => {
        if (permission.actions.length > 0) {
            stats.active++;
            stats.permissionsWithActions++;
        } else {
            stats.inactive++;
            stats.permissionsWithoutActions++;
        }

        if (permission.isSubRoute) {
            stats.subRoutes++;
        } else {
            stats.mainRoutes++;
        }

        if (permission.restrictions && permission.restrictions.length > 0) {
            stats.permissionsWithRestrictions++;
        } else {
            stats.permissionsWithoutRestrictions++;
        }
    });

    return stats;
};

// Función para ordenar permisos
export const sortPermissions = (permissions: Permission[], sortBy: string = "name", order: "asc" | "desc" = "asc") => {
    return [ ...permissions ].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
            case "name":
                aValue = getPermissionName(a);
                bValue = getPermissionName(b);
                break;
            case "routeCode":
                aValue = getPermissionRouteCode(a);
                bValue = getPermissionRouteCode(b);
                break;
            case "actions":
                aValue = getPermissionActions(a).length;
                bValue = getPermissionActions(b).length;
                break;
            case "restrictions":
                aValue = getPermissionRestrictions(a).length;
                bValue = getPermissionRestrictions(b).length;
                break;
            case "roles":
                aValue = getPermissionRolesCount(a);
                bValue = getPermissionRolesCount(b);
                break;
            case "created_at":
                aValue = new Date(a.created_at);
                bValue = new Date(b.created_at);
                break;
            default:
                aValue = getPermissionName(a);
                bValue = getPermissionName(b);
        }

        if (order === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
};

// Función para obtener el código de ruta formateado
export const getFormattedRouteCode = (routeCode: string): string => {
    return routeCode.replace(/([A-Z])/g, ' $1').trim();
};

// Función para obtener la descripción de una acción
export const getActionDescription = (action: string): string => {
    const descriptions: Record<string, string> = {
        "create": "Crear nuevos registros",
        "read": "Ver registros existentes",
        "update": "Modificar registros",
        "delete": "Eliminar registros",
        "export": "Exportar datos",
        "import": "Importar datos",
        "approve": "Aprobar solicitudes",
        "reject": "Rechazar solicitudes",
    };
    return descriptions[ action ] || action;
};

// Función para obtener la descripción de una restricción
export const getRestrictionDescription = (restriction: string): string => {
    const descriptions: Record<string, string> = {
        "own_data": "Solo datos propios",
        "department_data": "Datos del departamento",
        "company_data": "Datos de la empresa",
        "read_only": "Solo lectura",
        "time_restricted": "Restricción temporal",
        "ip_restricted": "Restricción IP",
    };
    return descriptions[ restriction ] || restriction;
}; 