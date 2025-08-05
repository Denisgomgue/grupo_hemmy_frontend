import { Employee } from "@/types/employees/employee";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Función para obtener el nombre completo del empleado
export const getFullName = (employee: Employee): string => {
    return `${employee.name} ${employee.lastName}`.trim();
};

// Función para formatear el DNI
export const formatDni = (dni: string): string => {
    if (!dni) return "";
    return dni.replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3");
};

// Función para formatear el teléfono
export const formatPhone = (phone: string): string => {
    if (!phone) return "";
    // Remover espacios y caracteres especiales
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 9) {
        return cleanPhone.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
    }
    return phone;
};

// Función para validar DNI
export const validateDni = (dni: string): boolean => {
    if (!dni) return false;
    const dniRegex = /^\d{8}$/;
    return dniRegex.test(dni);
};

// Función para validar teléfono
export const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Opcional
    const phoneRegex = /^(\+51\s?)?[9]\d{8}$/;
    return phoneRegex.test(phone);
};

// Función para obtener estadísticas de empleados
export const getEmployeeStats = (employees: Employee[]) => {
    const stats = {
        total: employees.length,
        byRole: {} as Record<string, number>,
        withPhone: 0,
        withoutPhone: 0,
    };

    employees.forEach(employee => {
        // Contar por rol
        const roleName = employee.role?.name || "Sin rol";
        stats.byRole[ roleName ] = (stats.byRole[ roleName ] || 0) + 1;

        // Contar con/sin teléfono
        if (employee.phone) {
            stats.withPhone++;
        } else {
            stats.withoutPhone++;
        }
    });

    return stats;
};

// Función para obtener etiquetas de estado
export const getEmployeeStatusLabel = (employee: Employee): string => {
    if (!employee.role) return "Sin rol asignado";
    return employee.role.name;
};

// Función para obtener color de estado
export const getEmployeeStatusColor = (employee: Employee): string => {
    if (!employee.role) return "text-gray-500";

    const roleName = employee.role.name.toLowerCase();
    switch (roleName) {
        case "admin":
        case "administrador":
            return "text-red-600";
        case "manager":
        case "gerente":
            return "text-blue-600";
        case "technician":
        case "técnico":
            return "text-green-600";
        case "operator":
        case "operador":
            return "text-purple-600";
        default:
            return "text-gray-600";
    }
};

// Función para obtener icono de rol
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
        default:
            return "👤";
    }
};

// Función para formatear fecha
export const formatEmployeeDate = (date: Date | string): string => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "dd/MM/yyyy", { locale: es });
};

// Función para generar iniciales
export const getInitials = (employee: Employee): string => {
    const name = employee.name?.charAt(0) || "";
    const lastName = employee.lastName?.charAt(0) || "";
    return (name + lastName).toUpperCase();
};

// Función para generar color de avatar basado en el nombre
export const getAvatarColor = (name: string): string => {
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

// Función para ordenar empleados
export const sortEmployees = (employees: Employee[], sortBy: string = "name", order: "asc" | "desc" = "asc") => {
    return [ ...employees ].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
            case "name":
                aValue = getFullName(a);
                bValue = getFullName(b);
                break;
            case "dni":
                aValue = a.dni;
                bValue = b.dni;
                break;
            case "role":
                aValue = a.role?.name || "";
                bValue = b.role?.name || "";
                break;
            case "created_at":
                aValue = new Date(a.created_at);
                bValue = new Date(b.created_at);
                break;
            default:
                aValue = getFullName(a);
                bValue = getFullName(b);
        }

        if (order === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
}; 