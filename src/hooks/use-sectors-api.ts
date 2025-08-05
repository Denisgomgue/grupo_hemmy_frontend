import { useState, useEffect, useCallback } from "react"
import { SectorsAPI } from "@/services"
import { Sector } from "@/types/sectors/sector"

export function useSectorsAPI() {
    const [ sectors, setSectors ] = useState<Sector[]>([])
    const [ isLoading, setIsLoading ] = useState(false)
    const [ summary, setSummary ] = useState<any>(null)

    const loadSectors = useCallback(async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }) => {
        setIsLoading(true)
        try {
            const response = await SectorsAPI.getAll(params)
            setSectors(response.data)
            return response
        } catch (error) {
            console.error("Error loading sectors:", error)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getSectorById = useCallback(async (id: number): Promise<Sector> => {
        try {
            const response = await SectorsAPI.getById(id)
            return response
        } catch (error) {
            console.error("Error fetching sector:", error)
            throw error
        }
    }, [])

    const createSector = useCallback(async (data: any): Promise<Sector> => {
        try {
            const response = await SectorsAPI.create(data)
            await loadSectors()
            return response
        } catch (error) {
            console.error("Error creating sector:", error)
            throw error
        }
    }, [ loadSectors ])

    const updateSector = useCallback(async (id: number, data: any): Promise<Sector> => {
        try {
            const response = await SectorsAPI.update(id, data)
            await loadSectors()
            return response
        } catch (error) {
            console.error("Error updating sector:", error)
            throw error
        }
    }, [ loadSectors ])

    const deleteSector = useCallback(async (id: number): Promise<void> => {
        try {
            await SectorsAPI.delete(id)
            await loadSectors()
        } catch (error) {
            console.error("Error deleting sector:", error)
            throw error
        }
    }, [ loadSectors ])

    const getActiveSectors = useCallback(async (): Promise<Sector[]> => {
        try {
            const response = await SectorsAPI.getActive()
            return response
        } catch (error) {
            console.error("Error fetching active sectors:", error)
            throw error
        }
    }, [])

    const getSummary = useCallback(async () => {
        try {
            const response = await SectorsAPI.getSummary()
            setSummary(response)
            return response
        } catch (error) {
            console.error("Error fetching sector summary:", error)
            throw error
        }
    }, [])

    const filterSectors = useCallback(async (filters: any): Promise<Sector[]> => {
        try {
            const response = await SectorsAPI.filter(filters)
            return response
        } catch (error) {
            console.error("Error filtering sectors:", error)
            throw error
        }
    }, [])

    const toggleActive = useCallback(async (id: number): Promise<Sector> => {
        try {
            const response = await SectorsAPI.toggleActive(id)
            await loadSectors()
            return response
        } catch (error) {
            console.error("Error toggling sector active status:", error)
            throw error
        }
    }, [ loadSectors ])

    const searchByName = useCallback(async (name: string): Promise<Sector[]> => {
        try {
            const response = await SectorsAPI.searchByName(name)
            return response
        } catch (error) {
            console.error("Error searching sector by name:", error)
            throw error
        }
    }, [])

    const getWithClients = useCallback(async (id: number) => {
        try {
            const response = await SectorsAPI.getWithClients(id)
            return response
        } catch (error) {
            console.error("Error fetching sector with clients:", error)
            throw error
        }
    }, [])

    const getWithClientStats = useCallback(async () => {
        try {
            const response = await SectorsAPI.getWithClientStats()
            return response
        } catch (error) {
            console.error("Error fetching sectors with client stats:", error)
            throw error
        }
    }, [])

    const getStatistics = useCallback(async () => {
        try {
            const response = await SectorsAPI.getStatistics()
            return response
        } catch (error) {
            console.error("Error fetching sector statistics:", error)
            throw error
        }
    }, [])

    const getByLocation = useCallback(async (location: string): Promise<Sector[]> => {
        try {
            const response = await SectorsAPI.getByLocation(location)
            return response
        } catch (error) {
            console.error("Error fetching sectors by location:", error)
            throw error
        }
    }, [])

    const getWithInstallations = useCallback(async (): Promise<Sector[]> => {
        try {
            const response = await SectorsAPI.getWithInstallations()
            return response
        } catch (error) {
            console.error("Error fetching sectors with installations:", error)
            throw error
        }
    }, [])

    useEffect(() => {
        loadSectors()
        getSummary()
    }, [ loadSectors, getSummary ])

    return {
        sectors,
        isLoading,
        summary,
        loadSectors,
        getSectorById,
        createSector,
        updateSector,
        deleteSector,
        getActiveSectors,
        getSummary,
        filterSectors,
        toggleActive,
        searchByName,
        getWithClients,
        getWithClientStats,
        getStatistics,
        getByLocation,
        getWithInstallations
    }
} 