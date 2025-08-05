import { useState, useEffect, useCallback } from "react"
import { ServicesAPI } from "@/services"
import { Service } from "@/types/services/service"

export function useServicesAPI() {
    const [ services, setServices ] = useState<Service[]>([])
    const [ isLoading, setIsLoading ] = useState(false)
    const [ summary, setSummary ] = useState<any>(null)

    const loadServices = useCallback(async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        category?: string;
    }) => {
        setIsLoading(true)
        try {
            const response = await ServicesAPI.getAll(params)
            setServices(response.data)
            return response
        } catch (error) {
            console.error("Error loading services:", error)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getServiceById = useCallback(async (id: number): Promise<Service> => {
        try {
            const response = await ServicesAPI.getById(id)
            return response
        } catch (error) {
            console.error("Error fetching service:", error)
            throw error
        }
    }, [])

    const createService = useCallback(async (data: any): Promise<Service> => {
        try {
            const response = await ServicesAPI.create(data)
            await loadServices()
            return response
        } catch (error) {
            console.error("Error creating service:", error)
            throw error
        }
    }, [ loadServices ])

    const updateService = useCallback(async (id: number, data: any): Promise<Service> => {
        try {
            const response = await ServicesAPI.update(id, data)
            await loadServices()
            return response
        } catch (error) {
            console.error("Error updating service:", error)
            throw error
        }
    }, [ loadServices ])

    const deleteService = useCallback(async (id: number): Promise<void> => {
        try {
            await ServicesAPI.delete(id)
            await loadServices()
        } catch (error) {
            console.error("Error deleting service:", error)
            throw error
        }
    }, [ loadServices ])

    const getActiveServices = useCallback(async (): Promise<Service[]> => {
        try {
            const response = await ServicesAPI.getActive()
            return response
        } catch (error) {
            console.error("Error fetching active services:", error)
            throw error
        }
    }, [])

    const getSummary = useCallback(async () => {
        try {
            const response = await ServicesAPI.getSummary()
            setSummary(response)
            return response
        } catch (error) {
            console.error("Error fetching service summary:", error)
            throw error
        }
    }, [])

    const filterServices = useCallback(async (filters: any): Promise<Service[]> => {
        try {
            const response = await ServicesAPI.filter(filters)
            return response
        } catch (error) {
            console.error("Error filtering services:", error)
            throw error
        }
    }, [])

    const toggleActive = useCallback(async (id: number): Promise<Service> => {
        try {
            const response = await ServicesAPI.toggleActive(id)
            await loadServices()
            return response
        } catch (error) {
            console.error("Error toggling service active status:", error)
            throw error
        }
    }, [ loadServices ])

    const searchByName = useCallback(async (name: string): Promise<Service[]> => {
        try {
            const response = await ServicesAPI.searchByName(name)
            return response
        } catch (error) {
            console.error("Error searching service by name:", error)
            throw error
        }
    }, [])

    const getByCategory = useCallback(async (category: string): Promise<Service[]> => {
        try {
            const response = await ServicesAPI.getByCategory(category)
            return response
        } catch (error) {
            console.error("Error fetching services by category:", error)
            throw error
        }
    }, [])

    const getByPriceRange = useCallback(async (minPrice: number, maxPrice: number): Promise<Service[]> => {
        try {
            const response = await ServicesAPI.getByPriceRange(minPrice, maxPrice)
            return response
        } catch (error) {
            console.error("Error fetching services by price range:", error)
            throw error
        }
    }, [])

    const getPopular = useCallback(async (limit: number = 5): Promise<Service[]> => {
        try {
            const response = await ServicesAPI.getPopular(limit)
            return response
        } catch (error) {
            console.error("Error fetching popular services:", error)
            throw error
        }
    }, [])

    const getStatistics = useCallback(async () => {
        try {
            const response = await ServicesAPI.getStatistics()
            return response
        } catch (error) {
            console.error("Error fetching service statistics:", error)
            throw error
        }
    }, [])

    const duplicateService = useCallback(async (id: number, newName: string): Promise<Service> => {
        try {
            const response = await ServicesAPI.duplicate(id, newName)
            await loadServices()
            return response
        } catch (error) {
            console.error("Error duplicating service:", error)
            throw error
        }
    }, [ loadServices ])

    const getWithClients = useCallback(async (): Promise<Service[]> => {
        try {
            const response = await ServicesAPI.getWithClients()
            return response
        } catch (error) {
            console.error("Error fetching services with clients:", error)
            throw error
        }
    }, [])

    const getCategories = useCallback(async (): Promise<string[]> => {
        try {
            const response = await ServicesAPI.getCategories()
            return response
        } catch (error) {
            console.error("Error fetching service categories:", error)
            throw error
        }
    }, [])

    useEffect(() => {
        loadServices()
        getSummary()
    }, [ loadServices, getSummary ])

    return {
        services,
        isLoading,
        summary,
        loadServices,
        getServiceById,
        createService,
        updateService,
        deleteService,
        getActiveServices,
        getSummary,
        filterServices,
        toggleActive,
        searchByName,
        getByCategory,
        getByPriceRange,
        getPopular,
        getStatistics,
        duplicateService,
        getWithClients,
        getCategories
    }
} 