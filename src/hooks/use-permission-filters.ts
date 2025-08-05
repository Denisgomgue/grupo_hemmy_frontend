import { useState, useMemo } from "react"
import { Permission, PermissionFilters } from "@/types/permissions/permission"

export function usePermissionFilters(permissions: Permission[]) {
    const [ filters, setFilters ] = useState<PermissionFilters>({})
    const [ searchTerm, setSearchTerm ] = useState("")
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ pageSize, setPageSize ] = useState(10)
    const [ sortBy, setSortBy ] = useState<keyof Permission>("name")
    const [ sortOrder, setSortOrder ] = useState<"asc" | "desc">("asc")

    const filteredPermissions = useMemo(() => {
        let filtered = [ ...permissions ]

        // Filtro por término de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(permission =>
                permission.name.toLowerCase().includes(term) ||
                permission.routeCode.toLowerCase().includes(term) ||
                permission.actions.some(action => action.toLowerCase().includes(term)) ||
                (permission.restrictions && permission.restrictions.some(restriction => restriction.toLowerCase().includes(term)))
            )
        }

        // Filtro por nombre
        if (filters.name) {
            filtered = filtered.filter(permission =>
                permission.name.toLowerCase().includes(filters.name!.toLowerCase())
            )
        }

        // Filtro por código de ruta
        if (filters.routeCode) {
            filtered = filtered.filter(permission =>
                permission.routeCode.toLowerCase().includes(filters.routeCode!.toLowerCase())
            )
        }

        // Filtro por subruta
        if (filters.isSubRoute !== undefined) {
            filtered = filtered.filter(permission => permission.isSubRoute === filters.isSubRoute)
        }

        // Filtro por acciones
        if (filters.hasActions !== undefined) {
            if (filters.hasActions) {
                filtered = filtered.filter(permission => permission.actions.length > 0)
            } else {
                filtered = filtered.filter(permission => permission.actions.length === 0)
            }
        }

        // Filtro por restricciones
        if (filters.hasRestrictions !== undefined) {
            if (filters.hasRestrictions) {
                filtered = filtered.filter(permission => permission.restrictions && permission.restrictions.length > 0)
            } else {
                filtered = filtered.filter(permission => !permission.restrictions || permission.restrictions.length === 0)
            }
        }

        return filtered
    }, [ permissions, filters, searchTerm ])

    const sortedPermissions = useMemo(() => {
        const sorted = [ ...filteredPermissions ].sort((a, b) => {
            let aValue: any
            let bValue: any

            switch (sortBy) {
                case "name":
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
                    break
                case "routeCode":
                    aValue = a.routeCode.toLowerCase()
                    bValue = b.routeCode.toLowerCase()
                    break
                case "actions":
                    aValue = a.actions.length
                    bValue = b.actions.length
                    break
                case "restrictions":
                    aValue = (a.restrictions || []).length
                    bValue = (b.restrictions || []).length
                    break
                case "isSubRoute":
                    aValue = a.isSubRoute ? 1 : 0
                    bValue = b.isSubRoute ? 1 : 0
                    break
                case "created_at":
                    aValue = new Date(a.created_at).getTime()
                    bValue = new Date(b.created_at).getTime()
                    break
                case "updated_at":
                    aValue = new Date(a.updated_at).getTime()
                    bValue = new Date(b.updated_at).getTime()
                    break
                default:
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
            }

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

        return sorted
    }, [ filteredPermissions, sortBy, sortOrder ])

    const paginatedPermissions = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        return sortedPermissions.slice(startIndex, endIndex)
    }, [ sortedPermissions, currentPage, pageSize ])

    const totalPages = Math.ceil(sortedPermissions.length / pageSize)

    const updateFilters = (newFilters: Partial<PermissionFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }))
        setCurrentPage(1) // Reset a la primera página cuando cambian los filtros
    }

    const clearFilters = () => {
        setFilters({})
        setSearchTerm("")
        setCurrentPage(1)
    }

    const updateSort = (newSortBy: keyof Permission, newSortOrder: "asc" | "desc") => {
        setSortBy(newSortBy)
        setSortOrder(newSortOrder)
    }

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const changePageSize = (newPageSize: number) => {
        setPageSize(newPageSize)
        setCurrentPage(1) // Reset a la primera página
    }

    return {
        // Estado
        filters,
        searchTerm,
        currentPage,
        pageSize,
        sortBy,
        sortOrder,
        totalPages,

        // Datos filtrados
        filteredPermissions: sortedPermissions,
        paginatedPermissions,

        // Acciones
        setSearchTerm,
        updateFilters,
        clearFilters,
        updateSort,
        goToPage,
        changePageSize,
        setCurrentPage,
    }
} 