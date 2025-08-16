import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { Installation } from "@/types/installations/installation"

function mapInstallationFromApi(apiInstallation: any): Installation {
    return {
        id: apiInstallation.id,
        clientId: apiInstallation.clientId,
        installationDate: apiInstallation.installationDate ? new Date(apiInstallation.installationDate) : new Date(),
        reference: apiInstallation.reference,
        ipAddress: apiInstallation.ipAddress,
        referenceImage: apiInstallation.referenceImage,
        plan: apiInstallation.plan,
        sector: apiInstallation.sector,
        devices: apiInstallation.devices || [],
        created_at: new Date(apiInstallation.created_at),
        updated_at: new Date(apiInstallation.updated_at),
    }
}

export function useInstallations() {
    const [ installations, setInstallations ] = useState<Installation[]>([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const fetchInstallations = useCallback(async (
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        clientId?: number
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

            if (clientId) {
                params.clientId = clientId.toString();
            }

            const response = await api.get<{ data: Installation[], total: number }>("/installations", {
                params
            });

            const mappedInstallations = response.data.data.map(mapInstallationFromApi);
            setInstallations(mappedInstallations);
            return { data: mappedInstallations, total: response.data.total };
        } catch (error) {
            console.error("Error fetching installations:", error);
            setError("Error al cargar instalaciones");
            return { data: [], total: 0 };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getInstallationById = useCallback(async (id: number): Promise<Installation> => {
        try {
            const response = await api.get<Installation>(`/installations/${id}`);
            return mapInstallationFromApi(response.data);
        } catch (error) {
            console.error(`Error fetching installation with ID ${id}:`, error);
            throw error;
        }
    }, []);

    const createInstallation = useCallback(async (installationData: any): Promise<Installation> => {
        try {
            const response = await api.post<Installation>("/installations", installationData);
            // No llamar fetchInstallations aquí para evitar re-renders
            return mapInstallationFromApi(response.data);
        } catch (error) {
            console.error("Error creating installation:", error);
            throw error;
        }
    }, []);

    const updateInstallation = useCallback(async (id: number, installationData: any): Promise<Installation> => {
        try {
            const response = await api.patch<Installation>(`/installations/${id}`, installationData);
            // No llamar fetchInstallations aquí para evitar re-renders
            return mapInstallationFromApi(response.data);
        } catch (error) {
            console.error("Error updating installation:", error);
            throw error;
        }
    }, []);

    const deleteInstallation = useCallback(async (id: number): Promise<void> => {
        try {
            await api.delete(`/installations/${id}`);
            // No llamar fetchInstallations aquí para evitar re-renders
        } catch (error) {
            console.error("Error deleting installation:", error);
            throw error;
        }
    }, []);

    const getInstallationsByClient = useCallback(async (clientId: number): Promise<Installation[]> => {
        try {
            const response = await api.get<Installation[]>(`/installations/client/${clientId}`);
            return response.data.map(mapInstallationFromApi);
        } catch (error) {
            console.error("Error fetching client installations:", error);
            throw error;
        }
    }, []);

    return {
        installations,
        isLoading,
        error,
        fetchInstallations,
        getInstallationById,
        createInstallation,
        updateInstallation,
        deleteInstallation,
        getInstallationsByClient
    };
} 