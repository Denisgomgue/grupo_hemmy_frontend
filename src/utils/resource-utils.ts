import { Resource } from "@/types/resources"

/**
 * Ordena los recursos por su orderIndex
 */
export const sortResourcesByOrder = (resources: Resource[]): Resource[] => {
    return [ ...resources ].sort((a, b) => {
        const orderA = a.orderIndex ?? 0
        const orderB = b.orderIndex ?? 0
        return orderA - orderB
    })
}

/**
 * Filtra recursos activos
 */
export const filterActiveResources = (resources: Resource[]): Resource[] => {
    return resources.filter(resource => resource.isActive)
}

/**
 * Obtiene recursos ordenados y activos
 */
export const getActiveSortedResources = (resources: Resource[]): Resource[] => {
    const activeResources = filterActiveResources(resources)
    return sortResourcesByOrder(activeResources)
}

/**
 * Busca un recurso por routeCode
 */
export const findResourceByRouteCode = (resources: Resource[], routeCode: string): Resource | undefined => {
    return resources.find(resource => resource.routeCode === routeCode)
}

/**
 * Busca un recurso por ID
 */
export const findResourceById = (resources: Resource[], id: number): Resource | undefined => {
    return resources.find(resource => resource.id === id)
}

/**
 * Valida si un routeCode ya existe
 */
export const isRouteCodeDuplicate = (resources: Resource[], routeCode: string, excludeId?: number): boolean => {
    return resources.some(resource =>
        resource.routeCode === routeCode && resource.id !== excludeId
    )
}

/**
 * Valida si un displayName ya existe
 */
export const isDisplayNameDuplicate = (resources: Resource[], displayName: string, excludeId?: number): boolean => {
    return resources.some(resource =>
        resource.displayName === displayName && resource.id !== excludeId
    )
}

/**
 * Obtiene el siguiente orderIndex disponible
 */
export const getNextOrderIndex = (resources: Resource[]): number => {
    if (resources.length === 0) return 0

    const maxOrderIndex = Math.max(...resources.map(r => r.orderIndex ?? 0))
    return maxOrderIndex + 1
}

/**
 * Formatea un routeCode para mostrar
 */
export const formatRouteCode = (routeCode: string): string => {
    return routeCode.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Genera un routeCode a partir de un displayName
 */
export const generateRouteCode = (displayName: string): string => {
    return displayName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim()
} 