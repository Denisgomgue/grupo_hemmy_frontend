import { useState, useEffect, useCallback } from "react"
import { CompanyAPI } from "@/services"
import { Company } from "@/types/company/company"

export function useCompanyAPI() {
    const [ companies, setCompanies ] = useState<Company[]>([])
    const [ isLoading, setIsLoading ] = useState(false)
    const [ summary, setSummary ] = useState<any>(null)
    const [ mainCompany, setMainCompany ] = useState<Company | null>(null)

    const loadCompanies = useCallback(async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }) => {
        setIsLoading(true)
        try {
            const response = await CompanyAPI.getAll(params)
            setCompanies(response.data)
            return response
        } catch (error) {
            console.error("Error loading companies:", error)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getCompanyById = useCallback(async (id: number): Promise<Company> => {
        try {
            const response = await CompanyAPI.getById(id)
            return response
        } catch (error) {
            console.error("Error fetching company:", error)
            throw error
        }
    }, [])

    const createCompany = useCallback(async (data: any): Promise<Company> => {
        try {
            const response = await CompanyAPI.create(data)
            await loadCompanies()
            return response
        } catch (error) {
            console.error("Error creating company:", error)
            throw error
        }
    }, [ loadCompanies ])

    const updateCompany = useCallback(async (id: number, data: any): Promise<Company> => {
        try {
            const response = await CompanyAPI.update(id, data)
            await loadCompanies()
            return response
        } catch (error) {
            console.error("Error updating company:", error)
            throw error
        }
    }, [ loadCompanies ])

    const deleteCompany = useCallback(async (id: number): Promise<void> => {
        try {
            await CompanyAPI.delete(id)
            await loadCompanies()
        } catch (error) {
            console.error("Error deleting company:", error)
            throw error
        }
    }, [ loadCompanies ])

    const getActiveCompanies = useCallback(async (): Promise<Company[]> => {
        try {
            const response = await CompanyAPI.getActive()
            return response
        } catch (error) {
            console.error("Error fetching active companies:", error)
            throw error
        }
    }, [])

    const getSummary = useCallback(async () => {
        try {
            const response = await CompanyAPI.getSummary()
            setSummary(response)
            return response
        } catch (error) {
            console.error("Error fetching company summary:", error)
            throw error
        }
    }, [])

    const toggleActive = useCallback(async (id: number): Promise<Company> => {
        try {
            const response = await CompanyAPI.toggleActive(id)
            await loadCompanies()
            return response
        } catch (error) {
            console.error("Error toggling company active status:", error)
            throw error
        }
    }, [ loadCompanies ])

    const searchByName = useCallback(async (name: string): Promise<Company[]> => {
        try {
            const response = await CompanyAPI.searchByName(name)
            return response
        } catch (error) {
            console.error("Error searching company by name:", error)
            throw error
        }
    }, [])

    const getWithClients = useCallback(async (id: number) => {
        try {
            const response = await CompanyAPI.getWithClients(id)
            return response
        } catch (error) {
            console.error("Error fetching company with clients:", error)
            throw error
        }
    }, [])

    const getWithStats = useCallback(async () => {
        try {
            const response = await CompanyAPI.getWithStats()
            return response
        } catch (error) {
            console.error("Error fetching companies with stats:", error)
            throw error
        }
    }, [])

    const getStatistics = useCallback(async () => {
        try {
            const response = await CompanyAPI.getStatistics()
            return response
        } catch (error) {
            console.error("Error fetching company statistics:", error)
            throw error
        }
    }, [])

    const getMain = useCallback(async (): Promise<Company> => {
        try {
            const response = await CompanyAPI.getMain()
            setMainCompany(response)
            return response
        } catch (error) {
            console.error("Error fetching main company:", error)
            throw error
        }
    }, [])

    const updateMain = useCallback(async (data: any): Promise<Company> => {
        try {
            const response = await CompanyAPI.updateMain(data)
            setMainCompany(response)
            await loadCompanies()
            return response
        } catch (error) {
            console.error("Error updating main company:", error)
            throw error
        }
    }, [ loadCompanies ])

    const validateName = useCallback(async (name: string) => {
        try {
            const response = await CompanyAPI.validateName(name)
            return response
        } catch (error) {
            console.error("Error validating company name:", error)
            throw error
        }
    }, [])

    useEffect(() => {
        loadCompanies()
        getSummary()
        getMain()
    }, [ loadCompanies, getSummary, getMain ])

    return {
        companies,
        isLoading,
        summary,
        mainCompany,
        loadCompanies,
        getCompanyById,
        createCompany,
        updateCompany,
        deleteCompany,
        getActiveCompanies,
        getSummary,
        toggleActive,
        searchByName,
        getWithClients,
        getWithStats,
        getStatistics,
        getMain,
        updateMain,
        validateName
    }
} 