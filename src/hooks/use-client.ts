import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { Client } from "@/types/clients/client"

interface ClientSummary {
    totalClientes: number;
    clientesActivos: number;
    clientesVencidos: number;
    clientesPorVencer: number;
    period: string;
}

export function useClient() {
    const [ clients, setClients ] = useState<Client[]>([]);

    const refreshClient = useCallback(async (
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        filters?: any,
        selectedSectors?: string[]
    ) => {
        try {
            const params: Record<string, any> = {
                page: page.toString(),
                limit: pageSize.toString()
            };

            if (search) {
                params.search = search;
            }

            // Procesar filtros avanzados
            if (filters?.status) {
                const activeStatuses = Object.entries(filters.status)
                    .filter(([ _, value ]) => value)
                    .map(([ key ]) => key);
                if (activeStatuses.length > 0) {
                    params.status = activeStatuses;
                }
            }

            if (filters?.services) {
                const activeServices = Object.entries(filters.services)
                    .filter(([ _, value ]) => value)
                    .map(([ key ]) => key);
                if (activeServices.length > 0) {
                    params.services = activeServices;
                }
            }

            if (filters?.planCost) {
                params.minCost = filters.planCost.min.toString();
                params.maxCost = filters.planCost.max.toString();
            }

            if (selectedSectors && selectedSectors.length > 0) {
                params.sectors = selectedSectors;
            }

            const response = await api.get<{ data: Client[], total: number }>("/client", {
                params
            });

            setClients(response.data.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching clients:", error);
            return { data: [], total: 0 };
        }
    }, []);

    const getClientById = useCallback(async (id: string | number): Promise<Client> => {
        try {
            const response = await api.get<Client>(`/client/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching client with ID ${id}:`, error);
            throw error;
        }
    }, []);

    const getClientSummary = useCallback(async (period?: string) => {
        try {
            const response = await api.get<ClientSummary>("/client/summary", {
                params: period ? { period } : {}
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching client summary:", error);
            return {
                totalClientes: 0,
                clientesActivos: 0,
                clientesVencidos: 0,
                clientesPorVencer: 0,
                period: period || "all"
            };
        }
    }, []);

    return { clients, refreshClient, getClientById, getClientSummary };
}