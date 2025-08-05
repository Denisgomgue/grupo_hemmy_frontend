import { useState, useEffect, useCallback } from "react"
import { InstallationsAPI } from "@/services"
import { Installation, InstallationStatus } from "@/types/installations/installation"

export function useInstallationsAPI() {
    const [ installations, setInstallations ] = useState<Installation[]>([])
    const [ isLoading, setIsLoading ] = useState(false)
    const [ summary, setSummary ] = useState<any>(null)

    const loadInstallations = useCallback(async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: InstallationStatus;
        clientId?: number;
        employeeId?: number;
    }) => {
        setIsLoading(true)
        try {
            const response = await InstallationsAPI.getAll(params)
            setInstallations(response.data)
            return response
        } catch (error) {
            console.error("Error loading installations:", error)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getInstallationById = useCallback(async (id: number): Promise<Installation> => {
        try {
            const response = await InstallationsAPI.getById(id)
            return response
        } catch (error) {
            console.error("Error fetching installation:", error)
            throw error
        }
    }, [])

    const createInstallation = useCallback(async (data: any): Promise<Installation> => {
        try {
            const response = await InstallationsAPI.create(data)
            await loadInstallations()
            return response
        } catch (error) {
            console.error("Error creating installation:", error)
            throw error
        }
    }, [ loadInstallations ])

    const updateInstallation = useCallback(async (id: number, data: any): Promise<Installation> => {
        try {
            const response = await InstallationsAPI.update(id, data)
            await loadInstallations()
            return response
        } catch (error) {
            console.error("Error updating installation:", error)
            throw error
        }
    }, [ loadInstallations ])

    const deleteInstallation = useCallback(async (id: number): Promise<void> => {
        try {
            await InstallationsAPI.delete(id)
            await loadInstallations()
        } catch (error) {
            console.error("Error deleting installation:", error)
            throw error
        }
    }, [ loadInstallations ])

    const getInstallationsByClient = useCallback(async (clientId: number): Promise<Installation[]> => {
        try {
            const response = await InstallationsAPI.getByClient(clientId)
            return response
        } catch (error) {
            console.error("Error fetching client installations:", error)
            throw error
        }
    }, [])

    const getInstallationsByEmployee = useCallback(async (employeeId: number): Promise<Installation[]> => {
        try {
            const response = await InstallationsAPI.getByEmployee(employeeId)
            return response
        } catch (error) {
            console.error("Error fetching employee installations:", error)
            throw error
        }
    }, [])

    const getSummary = useCallback(async () => {
        try {
            const response = await InstallationsAPI.getSummary()
            setSummary(response)
            return response
        } catch (error) {
            console.error("Error fetching installation summary:", error)
            throw error
        }
    }, [])

    const updateStatus = useCallback(async (id: number, status: InstallationStatus): Promise<Installation> => {
        try {
            const response = await InstallationsAPI.updateStatus(id, status)
            await loadInstallations()
            return response
        } catch (error) {
            console.error("Error updating installation status:", error)
            throw error
        }
    }, [ loadInstallations ])

    const assignEmployee = useCallback(async (id: number, employeeId: number): Promise<Installation> => {
        try {
            const response = await InstallationsAPI.assignEmployee(id, employeeId)
            await loadInstallations()
            return response
        } catch (error) {
            console.error("Error assigning employee to installation:", error)
            throw error
        }
    }, [ loadInstallations ])

    const getPending = useCallback(async (): Promise<Installation[]> => {
        try {
            const response = await InstallationsAPI.getPending()
            return response
        } catch (error) {
            console.error("Error fetching pending installations:", error)
            throw error
        }
    }, [])

    const getInProgress = useCallback(async (): Promise<Installation[]> => {
        try {
            const response = await InstallationsAPI.getInProgress()
            return response
        } catch (error) {
            console.error("Error fetching in-progress installations:", error)
            throw error
        }
    }, [])

    const getCompleted = useCallback(async (): Promise<Installation[]> => {
        try {
            const response = await InstallationsAPI.getCompleted()
            return response
        } catch (error) {
            console.error("Error fetching completed installations:", error)
            throw error
        }
    }, [])

    const getByDate = useCallback(async (date: string): Promise<Installation[]> => {
        try {
            const response = await InstallationsAPI.getByDate(date)
            return response
        } catch (error) {
            console.error("Error fetching installations by date:", error)
            throw error
        }
    }, [])

    const getByDateRange = useCallback(async (startDate: string, endDate: string): Promise<Installation[]> => {
        try {
            const response = await InstallationsAPI.getByDateRange(startDate, endDate)
            return response
        } catch (error) {
            console.error("Error fetching installations by date range:", error)
            throw error
        }
    }, [])

    const getByType = useCallback(async (type: string): Promise<Installation[]> => {
        try {
            const response = await InstallationsAPI.getByType(type)
            return response
        } catch (error) {
            console.error("Error fetching installations by type:", error)
            throw error
        }
    }, [])

    const searchByAddress = useCallback(async (address: string): Promise<Installation[]> => {
        try {
            const response = await InstallationsAPI.searchByAddress(address)
            return response
        } catch (error) {
            console.error("Error searching installations by address:", error)
            throw error
        }
    }, [])

    const getStatistics = useCallback(async () => {
        try {
            const response = await InstallationsAPI.getStatistics()
            return response
        } catch (error) {
            console.error("Error fetching installation statistics:", error)
            throw error
        }
    }, [])

    const filterInstallations = useCallback(async (filters: any): Promise<Installation[]> => {
        try {
            const response = await InstallationsAPI.filter(filters)
            return response
        } catch (error) {
            console.error("Error filtering installations:", error)
            throw error
        }
    }, [])

    useEffect(() => {
        loadInstallations()
        getSummary()
    }, [ loadInstallations, getSummary ])

    return {
        installations,
        isLoading,
        summary,
        loadInstallations,
        getInstallationById,
        createInstallation,
        updateInstallation,
        deleteInstallation,
        getInstallationsByClient,
        getInstallationsByEmployee,
        getSummary,
        updateStatus,
        assignEmployee,
        getPending,
        getInProgress,
        getCompleted,
        getByDate,
        getByDateRange,
        getByType,
        searchByAddress,
        getStatistics,
        filterInstallations
    }
} 