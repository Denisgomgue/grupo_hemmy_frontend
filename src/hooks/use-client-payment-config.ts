import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { ClientPaymentConfig, PaymentStatus } from "@/types/client-payment-configs/client-payment-config"

function mapClientPaymentConfigFromApi(apiConfig: any): ClientPaymentConfig {
    return {
        id: apiConfig.id,
        initialPaymentDate: apiConfig.initialPaymentDate ? new Date(apiConfig.initialPaymentDate) : undefined,
        installationId: apiConfig.installationId,
        advancePayment: apiConfig.advancePayment,
        paymentStatus: apiConfig.paymentStatus,
        Installation: apiConfig.Installation,
        created_at: new Date(apiConfig.created_at),
        updated_at: new Date(apiConfig.updated_at),
    }
}

export function useClientPaymentConfigs() {
    const [ configs, setConfigs ] = useState<ClientPaymentConfig[]>([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const fetchConfigs = useCallback(async (
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        installationId?: number,
        paymentStatus?: PaymentStatus
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const params: Record<string, any> = {
                page: page.toString(),
                limit: pageSize.toString()
            };

            if (search) {
                params.search = search;
            }

            if (installationId) {
                params.installationId = installationId.toString();
            }

            if (paymentStatus) {
                params.paymentStatus = paymentStatus;
            }

            const response = await api.get<{ data: ClientPaymentConfig[], total: number }>("/client-payment-configs", {
                params
            });

            const mappedConfigs = response.data.data.map(mapClientPaymentConfigFromApi);
            setConfigs(mappedConfigs);
            return { data: mappedConfigs, total: response.data.total };
        } catch (error) {
            console.error("Error fetching client payment configs:", error);
            setError("Error al cargar configuraciones de pago");
            return { data: [], total: 0 };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getConfigById = useCallback(async (id: number): Promise<ClientPaymentConfig> => {
        try {
            const response = await api.get<ClientPaymentConfig>(`/client-payment-configs/${id}`);
            return mapClientPaymentConfigFromApi(response.data);
        } catch (error) {
            console.error(`Error fetching config with ID ${id}:`, error);
            throw error;
        }
    }, []);

    const createConfig = useCallback(async (configData: any): Promise<ClientPaymentConfig> => {
        try {
            const response = await api.post<ClientPaymentConfig>("/client-payment-configs", configData);
            // No llamar fetchConfigs aquí para evitar re-renders
            return mapClientPaymentConfigFromApi(response.data);
        } catch (error) {
            console.error("Error creating client payment config:", error);
            throw error;
        }
    }, []);

    const updateConfig = useCallback(async (id: number, configData: any): Promise<ClientPaymentConfig> => {
        try {
            const response = await api.patch<ClientPaymentConfig>(`/client-payment-configs/${id}`, configData);
            // No llamar fetchConfigs aquí para evitar re-renders
            return mapClientPaymentConfigFromApi(response.data);
        } catch (error) {
            console.error("Error updating client payment config:", error);
            throw error;
        }
    }, []);

    const deleteConfig = useCallback(async (id: number): Promise<void> => {
        try {
            await api.delete(`/client-payment-configs/${id}`);
            // No llamar fetchConfigs aquí para evitar re-renders
        } catch (error) {
            console.error("Error deleting client payment config:", error);
            throw error;
        }
    }, []);

    const getConfigByInstallation = useCallback(async (installationId: number): Promise<ClientPaymentConfig | null> => {
        try {
            const response = await api.get<ClientPaymentConfig>(`/client-payment-configs/installation/${installationId}`);
            return mapClientPaymentConfigFromApi(response.data);
        } catch (error) {
            console.error("Error fetching config by installation:", error);
            return null;
        }
    }, []);

    const updatePaymentStatus = useCallback(async (id: number, status: PaymentStatus): Promise<ClientPaymentConfig> => {
        try {
            const response = await api.patch<ClientPaymentConfig>(`/client-payment-configs/${id}/status`, { status });
            // No llamar fetchConfigs aquí para evitar re-renders
            return mapClientPaymentConfigFromApi(response.data);
        } catch (error) {
            console.error("Error updating payment status:", error);
            throw error;
        }
    }, []);

    return {
        configs,
        isLoading,
        error,
        fetchConfigs,
        getConfigById,
        createConfig,
        updateConfig,
        deleteConfig,
        getConfigByInstallation,
        updatePaymentStatus
    };
} 