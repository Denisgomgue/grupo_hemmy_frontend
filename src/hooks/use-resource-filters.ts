import { useState, useMemo } from 'react'
import { Resource } from './use-resources-api'

export function useResourceFilters(resources: Resource[]) {
    const [ searchTerm, setSearchTerm ] = useState('')
    const [ filters, setFilters ] = useState('all')
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ pageSize, setPageSize ] = useState(10)
    const [ viewMode, setViewMode ] = useState<'list' | 'grid'>('list')

    const filteredResources = useMemo(() => {
        let filtered = resources

        // Aplicar filtros
        if (filters === 'active') {
            filtered = filtered.filter(resource => resource.isActive)
        } else if (filters === 'inactive') {
            filtered = filtered.filter(resource => !resource.isActive)
        }

        // Aplicar búsqueda
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            filtered = filtered.filter(resource =>
                resource.displayName.toLowerCase().includes(searchLower) ||
                resource.routeCode.toLowerCase().includes(searchLower) ||
                (resource.description && resource.description.toLowerCase().includes(searchLower))
            )
        }

        return filtered
    }, [ resources, filters, searchTerm ])

    const paginatedResources = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        return filteredResources.slice(startIndex, endIndex)
    }, [ filteredResources, currentPage, pageSize ])

    const totalRecords = filteredResources.length

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
        paginatedResources,
        totalRecords,
        filteredResources
    }
} 