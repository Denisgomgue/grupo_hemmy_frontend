import { useState, useEffect, useCallback } from "react"
import { ClientsAPI } from "@/services"
import { Client, AccountStatus } from "@/types/clients/client"

export function useClient() {
    const [ clients, setClients ] = useState<Client[]>([]);

    const refreshClient = useCallback(async (
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        filters?: {
            status?: Record<AccountStatus, boolean>;
            name?: string;
            dni?: string;
            services?: string[];
            sectors?: string[];
            minCost?: number;
            maxCost?: number;
        }
    ) => {
        try {
            // 🎯 SOLUCIÓN: Si hay búsqueda, resetear a página 1 y buscar en toda la BD
            const params: Record<string, any> = {};

            if (search && search.trim()) {
                // 🔍 BÚSQUEDA: Buscar en toda la base de datos
                params.search = search.trim();
                params.page = 1; // Siempre empezar en página 1
                params.limit = pageSize;
            } else {
                // 📄 PAGINACIÓN NORMAL: Sin búsqueda, usar página actual
                params.page = page;
                params.limit = pageSize;
            }

            // Procesar filtros de estado
            if (filters?.status) {
                const activeStatuses = Object.entries(filters.status)
                    .filter(([ _, value ]) => value)
                    .map(([ key ]) => key);
                if (activeStatuses.length > 0) {
                    params.status = activeStatuses;
                }
            }

            if (filters?.name) {
                params.name = filters.name;
            }

            if (filters?.dni) {
                params.dni = filters.dni;
            }

            // Procesar filtros avanzados
            if (filters?.services && filters.services.length > 0) {
                params.services = filters.services;
            }

            if (filters?.sectors && filters.sectors.length > 0) {
                params.sectors = filters.sectors;
            }

            if (filters?.minCost !== undefined) {
                params.minCost = filters.minCost;
            }

            if (filters?.maxCost !== undefined) {
                params.maxCost = filters.maxCost;
            }

            const response = await ClientsAPI.getAll(params);
            setClients(response.data);
            return response;
        } catch (error) {
            console.error("Error fetching clients:", error);
            return { data: [], total: 0 };
        }
    }, []);

    const getClientById = useCallback(async (id: string | number): Promise<Client> => {
        try {
            const response = await ClientsAPI.getById(id);
            return response;
        } catch (error) {
            console.error(`Error fetching client with ID ${id}:`, error);
            throw error;
        }
    }, []);

    const createClient = useCallback(async (clientData: any): Promise<Client> => {
        try {
            const response = await ClientsAPI.create(clientData);
            // No llamar refreshClient aquí para evitar re-renders
            return response;
        } catch (error) {
            console.error("Error creating client:", error);
            throw error;
        }
    }, []);

    const updateClient = useCallback(async (id: number, clientData: any): Promise<Client> => {
        try {
            const response = await ClientsAPI.update(id, clientData);
            // No llamar refreshClient aquí para evitar re-renders
            return response;
        } catch (error) {
            console.error("Error updating client:", error);
            throw error;
        }
    }, []);

    const deleteClient = useCallback(async (id: number): Promise<void> => {
        try {
            await ClientsAPI.delete(id);
            // No llamar refreshClient aquí para evitar re-renders
        } catch (error) {
            console.error("Error deleting client:", error);
            throw error;
        }
    }, []);

    const getClientSummary = useCallback(async () => {
        try {
            const response = await ClientsAPI.getSummary();
            return response;
        } catch (error) {
            console.error("Error fetching client summary:", error);
            return {
                totalClientes: 0,
                clientesActivos: 0,
                clientesSuspendidos: 0,
                clientesInactivos: 0,
                period: 0 // Siempre 0 ya que no usamos period en el frontend
            };
        }
    }, []);

    const validateDni = useCallback(async (dni: string) => {
        try {
            const response = await ClientsAPI.validateDni(dni);
            return response;
        } catch (error) {
            console.error("Error validating DNI:", error);
            throw error;
        }
    }, []);

    const syncStates = useCallback(async () => {
        try {
            const response = await ClientsAPI.syncStates();
            return response;
        } catch (error) {
            console.error("Error syncing client states:", error);
            throw error;
        }
    }, []);

    const getNewClients = useCallback(async () => {
        try {
            const response = await ClientsAPI.getNewClients();
            return response;
        } catch (error) {
            console.error("Error fetching new clients:", error);
            throw error;
        }
    }, []);

    const getWithFilters = useCallback(async (filters: any, page: number = 1, limit: number = 10) => {
        try {
            const response = await ClientsAPI.getWithFilters(filters, page, limit);
            return response;
        } catch (error) {
            console.error("Error fetching clients with filters:", error);
            throw error;
        }
    }, []);

    return {
        clients,
        refreshClient,
        getClientById,
        createClient,
        updateClient,
        deleteClient,
        getClientSummary,
        validateDni,
        syncStates,
        getNewClients,
        getWithFilters
    };
}