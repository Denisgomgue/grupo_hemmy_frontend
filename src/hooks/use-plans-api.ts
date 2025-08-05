import { useState, useEffect, useCallback } from "react"
import { PlansAPI } from "@/services"
import { Plan } from "@/types/plans/plan"

export function usePlansAPI() {
    const [ plans, setPlans ] = useState<Plan[]>([])
    const [ isLoading, setIsLoading ] = useState(false)
    const [ summary, setSummary ] = useState<any>(null)

    const loadPlans = useCallback(async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }) => {
        setIsLoading(true)
        try {
            const response = await PlansAPI.getAll(params)
            setPlans(response.data)
            return response
        } catch (error) {
            console.error("Error loading plans:", error)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getPlanById = useCallback(async (id: number): Promise<Plan> => {
        try {
            const response = await PlansAPI.getById(id)
            return response
        } catch (error) {
            console.error("Error fetching plan:", error)
            throw error
        }
    }, [])

    const createPlan = useCallback(async (data: any): Promise<Plan> => {
        try {
            const response = await PlansAPI.create(data)
            await loadPlans()
            return response
        } catch (error) {
            console.error("Error creating plan:", error)
            throw error
        }
    }, [ loadPlans ])

    const updatePlan = useCallback(async (id: number, data: any): Promise<Plan> => {
        try {
            const response = await PlansAPI.update(id, data)
            await loadPlans()
            return response
        } catch (error) {
            console.error("Error updating plan:", error)
            throw error
        }
    }, [ loadPlans ])

    const deletePlan = useCallback(async (id: number): Promise<void> => {
        try {
            await PlansAPI.delete(id)
            await loadPlans()
        } catch (error) {
            console.error("Error deleting plan:", error)
            throw error
        }
    }, [ loadPlans ])

    const getActivePlans = useCallback(async (): Promise<Plan[]> => {
        try {
            const response = await PlansAPI.getActive()
            return response
        } catch (error) {
            console.error("Error fetching active plans:", error)
            throw error
        }
    }, [])

    const getSummary = useCallback(async () => {
        try {
            const response = await PlansAPI.getSummary()
            setSummary(response)
            return response
        } catch (error) {
            console.error("Error fetching plan summary:", error)
            throw error
        }
    }, [])

    const filterPlans = useCallback(async (filters: any): Promise<Plan[]> => {
        try {
            const response = await PlansAPI.filter(filters)
            return response
        } catch (error) {
            console.error("Error filtering plans:", error)
            throw error
        }
    }, [])

    const toggleActive = useCallback(async (id: number): Promise<Plan> => {
        try {
            const response = await PlansAPI.toggleActive(id)
            await loadPlans()
            return response
        } catch (error) {
            console.error("Error toggling plan active status:", error)
            throw error
        }
    }, [ loadPlans ])

    const searchByName = useCallback(async (name: string): Promise<Plan[]> => {
        try {
            const response = await PlansAPI.searchByName(name)
            return response
        } catch (error) {
            console.error("Error searching plan by name:", error)
            throw error
        }
    }, [])

    const getByPriceRange = useCallback(async (minPrice: number, maxPrice: number): Promise<Plan[]> => {
        try {
            const response = await PlansAPI.getByPriceRange(minPrice, maxPrice)
            return response
        } catch (error) {
            console.error("Error fetching plans by price range:", error)
            throw error
        }
    }, [])

    const getPopular = useCallback(async (limit: number = 5): Promise<Plan[]> => {
        try {
            const response = await PlansAPI.getPopular(limit)
            return response
        } catch (error) {
            console.error("Error fetching popular plans:", error)
            throw error
        }
    }, [])

    const getStatistics = useCallback(async () => {
        try {
            const response = await PlansAPI.getStatistics()
            return response
        } catch (error) {
            console.error("Error fetching plan statistics:", error)
            throw error
        }
    }, [])

    const duplicatePlan = useCallback(async (id: number, newName: string): Promise<Plan> => {
        try {
            const response = await PlansAPI.duplicate(id, newName)
            await loadPlans()
            return response
        } catch (error) {
            console.error("Error duplicating plan:", error)
            throw error
        }
    }, [ loadPlans ])

    const getWithClients = useCallback(async (): Promise<Plan[]> => {
        try {
            const response = await PlansAPI.getWithClients()
            return response
        } catch (error) {
            console.error("Error fetching plans with clients:", error)
            throw error
        }
    }, [])

    useEffect(() => {
        loadPlans()
        getSummary()
    }, [ loadPlans, getSummary ])

    return {
        plans,
        isLoading,
        summary,
        loadPlans,
        getPlanById,
        createPlan,
        updatePlan,
        deletePlan,
        getActivePlans,
        getSummary,
        filterPlans,
        toggleActive,
        searchByName,
        getByPriceRange,
        getPopular,
        getStatistics,
        duplicatePlan,
        getWithClients
    }
} 