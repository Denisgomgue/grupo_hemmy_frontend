import { useState, useEffect, useCallback } from "react"
import { ClientPaymentConfigAPI } from "@/services"
import { ClientPaymentConfig } from "@/types/client-payment-configs/client-payment-config"

export function useClientPaymentConfigAPI() {
    const [ configs, setConfigs ] = useState<ClientPaymentConfig[]>([])
    const [ isLoading, setIsLoading ] = useState(false)
    const [ summary, setSummary ] = useState<any>(null)

    const loadConfigs = useCallback(async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        clientId?: number;
        paymentMethodId?: number;
        isActive?: boolean;
    }) => {
        setIsLoading(true)
        try {
            const response = await ClientPaymentConfigAPI.getAll(params)
            setConfigs(response.data)
            return response
        } catch (error) {
            console.error("Error loading client payment configs:", error)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getConfigById = useCallback(async (id: number): Promise<ClientPaymentConfig> => {
        try {
            const response = await ClientPaymentConfigAPI.getById(id)
            return response
        } catch (error) {
            console.error("Error fetching client payment config:", error)
            throw error
        }
    }, [])

    const createConfig = useCallback(async (data: any): Promise<ClientPaymentConfig> => {
        try {
            const response = await ClientPaymentConfigAPI.create(data)
            await loadConfigs()
            return response
        } catch (error) {
            console.error("Error creating client payment config:", error)
            throw error
        }
    }, [ loadConfigs ])

    const updateConfig = useCallback(async (id: number, data: any): Promise<ClientPaymentConfig> => {
        try {
            const response = await ClientPaymentConfigAPI.update(id, data)
            await loadConfigs()
            return response
        } catch (error) {
            console.error("Error updating client payment config:", error)
            throw error
        }
    }, [ loadConfigs ])

    const deleteConfig = useCallback(async (id: number): Promise<void> => {
        try {
            await ClientPaymentConfigAPI.delete(id)
            await loadConfigs()
        } catch (error) {
            console.error("Error deleting client payment config:", error)
            throw error
        }
    }, [ loadConfigs ])

    const getActiveConfigs = useCallback(async (): Promise<ClientPaymentConfig[]> => {
        try {
            const response = await ClientPaymentConfigAPI.getActive()
            return response
        } catch (error) {
            console.error("Error fetching active client payment configs:", error)
            throw error
        }
    }, [])

    const getSummary = useCallback(async () => {
        try {
            const response = await ClientPaymentConfigAPI.getSummary()
            setSummary(response)
            return response
        } catch (error) {
            console.error("Error fetching client payment config summary:", error)
            throw error
        }
    }, [])

    const filterConfigs = useCallback(async (filters: any): Promise<ClientPaymentConfig[]> => {
        try {
            const response = await ClientPaymentConfigAPI.filter(filters)
            return response
        } catch (error) {
            console.error("Error filtering client payment configs:", error)
            throw error
        }
    }, [])

    const toggleActive = useCallback(async (id: number): Promise<ClientPaymentConfig> => {
        try {
            const response = await ClientPaymentConfigAPI.toggleActive(id)
            await loadConfigs()
            return response
        } catch (error) {
            console.error("Error toggling client payment config active status:", error)
            throw error
        }
    }, [ loadConfigs ])

    const getByClient = useCallback(async (clientId: number): Promise<ClientPaymentConfig[]> => {
        try {
            const response = await ClientPaymentConfigAPI.getByClient(clientId)
            return response
        } catch (error) {
            console.error("Error fetching client payment configs by client:", error)
            throw error
        }
    }, [])

    const getByPaymentMethod = useCallback(async (paymentMethodId: number): Promise<ClientPaymentConfig[]> => {
        try {
            const response = await ClientPaymentConfigAPI.getByPaymentMethod(paymentMethodId)
            return response
        } catch (error) {
            console.error("Error fetching client payment configs by payment method:", error)
            throw error
        }
    }, [])

    const getActiveByClient = useCallback(async (clientId: number): Promise<ClientPaymentConfig | null> => {
        try {
            const response = await ClientPaymentConfigAPI.getActiveByClient(clientId)
            return response
        } catch (error) {
            console.error("Error fetching active client payment config by client:", error)
            throw error
        }
    }, [])

    const getStatistics = useCallback(async () => {
        try {
            const response = await ClientPaymentConfigAPI.getStatistics()
            return response
        } catch (error) {
            console.error("Error fetching client payment config statistics:", error)
            throw error
        }
    }, [])

    const validate = useCallback(async (data: any) => {
        try {
            const response = await ClientPaymentConfigAPI.validate(data)
            return response
        } catch (error) {
            console.error("Error validating client payment config:", error)
            throw error
        }
    }, [])

    const getWithDetails = useCallback(async () => {
        try {
            const response = await ClientPaymentConfigAPI.getWithDetails()
            return response
        } catch (error) {
            console.error("Error fetching client payment configs with details:", error)
            throw error
        }
    }, [])

    const duplicateConfig = useCallback(async (id: number, newClientId: number): Promise<ClientPaymentConfig> => {
        try {
            const response = await ClientPaymentConfigAPI.duplicate(id, newClientId)
            await loadConfigs()
            return response
        } catch (error) {
            console.error("Error duplicating client payment config:", error)
            throw error
        }
    }, [ loadConfigs ])

    useEffect(() => {
        loadConfigs()
        getSummary()
    }, [ loadConfigs, getSummary ])

    return {
        configs,
        isLoading,
        summary,
        loadConfigs,
        getConfigById,
        createConfig,
        updateConfig,
        deleteConfig,
        getActiveConfigs,
        getSummary,
        filterConfigs,
        toggleActive,
        getByClient,
        getByPaymentMethod,
        getActiveByClient,
        getStatistics,
        validate,
        getWithDetails,
        duplicateConfig
    }
} 