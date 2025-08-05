import { User } from "@/types/users/user"

export function formatDocumentType(documentType?: string): string {
    if (!documentType) return "N/A"

    const types: Record<string, string> = {
        DNI: "DNI",
        CE: "Carné de Extranjería",
        PASSPORT: "Pasaporte",
        RUC: "RUC",
        OTHER: "Otro"
    }

    return types[ documentType ] || documentType
}

export function formatUserStatus(isActive?: boolean): string {
    return isActive ? "Activo" : "Inactivo"
}

export function getUserStatusColor(isActive?: boolean): string {
    return isActive ? "text-green-600" : "text-red-600"
}

export function getUserStatusBadge(isActive?: boolean): "default" | "destructive" | "secondary" {
    if (isActive === undefined) return "secondary"
    return isActive ? "default" : "destructive"
}

export function formatUserName(user: User): string {
    if (user.name) return user.name
    if (user.username) return user.username
    return "Usuario sin nombre"
}

export function getUserInitials(user: User): string {
    if (user.name) {
        const names = user.name.split(" ")
        if (names.length >= 2) {
            return `${names[ 0 ][ 0 ]}${names[ 1 ][ 0 ]}`.toUpperCase()
        }
        return names[ 0 ][ 0 ].toUpperCase()
    }
    if (user.username) {
        return user.username.substring(0, 2).toUpperCase()
    }
    return "U"
}

export function getUserDisplayName(user: User): string {
    return user.name || user.username || "Usuario sin nombre"
}

export function getUserContactInfo(user: User): string {
    const contact = []
    if (user.email) contact.push(user.email)
    if (user.phone) contact.push(user.phone)
    return contact.join(" • ") || "Sin información de contacto"
}

export function getUserRoleName(user: User): string {
    return user.role?.name || "Sin rol asignado"
}

export function hasUserRole(user: User): boolean {
    return !!user.role
}

export function isUserActive(user: User): boolean {
    return user.isActive === true
}

export function getUserPermissions(user: User): string[] {
    if (!user.role?.role_has_permissions) return []
    return user.role.role_has_permissions.map(rhp => rhp.name)
}

export function getUserPermissionsCount(user: User): number {
    return getUserPermissions(user).length
}

export function filterUsers(users: User[], filters: any): User[] {
    let filtered = [ ...users ]

    // Filtro por nombre, email o username
    if (filters.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(user =>
            user.name?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search) ||
            user.username?.toLowerCase().includes(search) ||
            user.documentNumber?.toLowerCase().includes(search)
        )
    }

    // Filtro por estado
    if (filters.isActive !== undefined) {
        filtered = filtered.filter(user => user.isActive === filters.isActive)
    }

    // Filtro por rol
    if (filters.roleId) {
        filtered = filtered.filter(user => user.role?.id === filters.roleId)
    }

    // Filtro por tipo de documento
    if (filters.documentType) {
        filtered = filtered.filter(user => user.documentType === filters.documentType)
    }

    return filtered
}

export function sortUsers(users: User[], sortBy: string, sortOrder: "asc" | "desc" = "asc"): User[] {
    const sorted = [ ...users ]

    sorted.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortBy) {
            case "name":
                aValue = a.name || ""
                bValue = b.name || ""
                break
            case "email":
                aValue = a.email || ""
                bValue = b.email || ""
                break
            case "username":
                aValue = a.username || ""
                bValue = b.username || ""
                break
            case "created_at":
                aValue = a.created_at ? new Date(a.created_at).getTime() : 0
                bValue = b.created_at ? new Date(b.created_at).getTime() : 0
                break
            case "isActive":
                aValue = a.isActive ? 1 : 0
                bValue = b.isActive ? 1 : 0
                break
            default:
                aValue = a.name || ""
                bValue = b.name || ""
        }

        if (sortOrder === "asc") {
            return aValue > bValue ? 1 : -1
        } else {
            return aValue < bValue ? 1 : -1
        }
    })

    return sorted
}

export function getUserStats(users: User[]) {
    const total = users.length
    const active = users.filter(user => user.isActive).length
    const inactive = total - active
    const withRole = users.filter(user => user.role).length
    const withoutRole = total - withRole
    const verified = users.filter(user => user.emailVerified).length
    const unverified = total - verified

    return {
        total,
        active,
        inactive,
        withRole,
        withoutRole,
        verified,
        unverified
    }
} 