import { useState, useMemo } from "react"
import { User } from "@/types/users/user"

interface UserFilters {
    searchTerm?: string
    status?: string
    roleId?: string
    documentType?: string
}

export function useUserFilters(users: User[]) {
    const [ searchTerm, setSearchTerm ] = useState("")
    const [ filters, setFilters ] = useState<UserFilters>({})
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ pageSize, setPageSize ] = useState(10)
    const [ viewMode, setViewMode ] = useState<"table" | "grid">("table")

    const filteredUsers = useMemo(() => {
        let filtered = [ ...users ]

        // Filtro por término de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term) ||
                user.username?.toLowerCase().includes(term) ||
                user.documentNumber?.toLowerCase().includes(term)
            )
        }

        // Filtro por estado
        if (filters.status) {
            if (filters.status === "active") {
                filtered = filtered.filter(user => user.isActive)
            } else if (filters.status === "inactive") {
                filtered = filtered.filter(user => !user.isActive)
            }
        }

        // Filtro por rol
        if (filters.roleId && filters.roleId !== "all") {
            filtered = filtered.filter(user =>
                user.role?.id.toString() === filters.roleId
            )
        }

        // Filtro por tipo de documento
        if (filters.documentType && filters.documentType !== "all") {
            filtered = filtered.filter(user =>
                user.documentType === filters.documentType
            )
        }

        return filtered
    }, [ users, searchTerm, filters ])

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        return filteredUsers.slice(startIndex, endIndex)
    }, [ filteredUsers, currentPage, pageSize ])

    const totalRecords = filteredUsers.length

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
        paginatedUsers,
        totalRecords,
        filteredUsers
    }
} 