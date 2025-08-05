import { useState, useMemo } from "react"
import { Role } from "@/types/roles/role"

interface RoleFilters {
    searchTerm?: string
    isPublic?: boolean
    allowAll?: boolean
}

export function useRoleFilters(roles: Role[]) {
    const [ searchTerm, setSearchTerm ] = useState("")
    const [ filters, setFilters ] = useState<RoleFilters>({})
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ pageSize, setPageSize ] = useState(10)
    const [ viewMode, setViewMode ] = useState<"table" | "grid">("table")

    const filteredRoles = useMemo(() => {
        let filtered = [ ...roles ]

        // Filtro por término de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(role =>
                role.name?.toLowerCase().includes(term) ||
                role.description?.toLowerCase().includes(term)
            )
        }

        // Filtro por visibilidad
        if (filters.isPublic !== undefined) {
            filtered = filtered.filter(role => role.isPublic === filters.isPublic)
        }

        // Filtro por acceso
        if (filters.allowAll !== undefined) {
            filtered = filtered.filter(role => role.allowAll === filters.allowAll)
        }

        return filtered
    }, [ roles, searchTerm, filters ])

    const paginatedRoles = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        return filteredRoles.slice(startIndex, endIndex)
    }, [ filteredRoles, currentPage, pageSize ])

    const totalRecords = filteredRoles.length

    return {
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        viewMode,
        setViewMode,
        paginatedRoles,
        totalRecords,
        filteredRoles
    }
} 