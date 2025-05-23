import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { Client } from "@/types/clients/client"

let clientList: Client[] = []
let listeners: Array<() => void> = []

const notifyListeners = () => {
    listeners.forEach((listener) => listener())
}

interface ClientSummary {
    totalClientes: number;
    clientesActivos: number;
    clientesVencidos: number;
    clientesPorVencer: number;
    period: string;
}

export function useClient() {
    const [ client, setClient ] = useState<Client[]>(clientList)

    const refreshClient = useCallback(async (page: number = 1, pageSize: number = 10) => {
        try {
            const response = await api.get<Client[]>("/client", {
                params: {
                    page,
                    pageSize
                }
            })
            clientList = response.data
            notifyListeners()
            return { data: clientList, total: clientList.length }
        } catch (error) {
            console.error("Error fetching clients:", error)
            throw error
        }
    }, [])

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

    useEffect(() => {
        const listener = () => setClient([ ...clientList ])
        listeners.push(listener)

        return () => {
            listeners = listeners.filter((l) => l !== listener)
        }
    }, [])

    return { client, refreshClient, getClientById, getClientSummary }
}