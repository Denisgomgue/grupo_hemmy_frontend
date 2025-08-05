import axios from '@/lib/axios'
import { Client, AccountStatus } from '@/types/clients/client'

export interface ClientSummary {
    totalClientes: number;
    clientesActivos: number;
    clientesSuspendidos: number;
    clientesInactivos: number;
    period: number; // Cambiado de string a number
    // Campos adicionales del backend
    clientesPagados?: number;
    clientesPorVencer?: number;
    clientesVencidos?: number;
    clientesSuspendidosPago?: number;
}

export interface CreateClientData {
    name: string;
    lastName: string;
    dni: string;
    phone?: string;
    address?: string;
    description?: string;
    birthdate?: string;
    status: AccountStatus;
    installationDate?: string;
    reference?: string;
    paymentDate?: string;
    advancePayment?: boolean;
    plan?: number;
    sector?: number;
    paymentStatus?: string;
    decoSerial?: string;
    routerSerial?: string;
    ipAddress?: string;
    referenceImage?: File;
}

export interface UpdateClientData extends Partial<CreateClientData> { }

export interface ClientFilters {
    status?: Record<AccountStatus, boolean>;
    name?: string;
    dni?: string;
    services?: string[];
    sectors?: string[];
    minCost?: number;
    maxCost?: number;
}

export interface ClientMinimal {
    id: number;
    name: string;
    lastName: string;
    dni: string;
    phone?: string;
}

export class ClientsAPI {
    // Obtener todos los clientes
    static async getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string[];
        services?: string[];
        sectors?: string[];
        minCost?: number;
        maxCost?: number;
        minimal?: boolean;
    }): Promise<{ data: Client[]; total: number }> {
        const response = await axios.get('/client', { params });
        return response.data;
    }

    // Obtener cliente por ID
    static async getById(id: number | string): Promise<Client> {
        const response = await axios.get(`/client/${id}`);
        return response.data;
    }

    // Crear nuevo cliente
    static async create(data: CreateClientData): Promise<Client> {
        const formData = new FormData();

        // Agregar campos al FormData
        Object.entries(data).forEach(([ key, value ]) => {
            if (value !== undefined) {
                if (key === 'referenceImage' && value instanceof File) {
                    formData.append(key, value);
                } else if (key === 'advancePayment') {
                    formData.append(key, value ? '1' : '0');
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        const response = await axios.post('/client', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    // Actualizar cliente
    static async update(id: number, data: UpdateClientData): Promise<Client> {
        const formData = new FormData();

        // Agregar campos al FormData
        Object.entries(data).forEach(([ key, value ]) => {
            if (value !== undefined) {
                if (key === 'referenceImage' && value instanceof File) {
                    formData.append(key, value);
                } else if (key === 'advancePayment') {
                    formData.append(key, value ? '1' : '0');
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        const response = await axios.patch(`/client/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    // Eliminar cliente
    static async delete(id: number): Promise<void> {
        await axios.delete(`/client/${id}`);
    }

    // Obtener resumen de clientes
    static async getSummary(): Promise<ClientSummary> {
        try {
            const response = await axios.get('/client/summary');

            // Mapear los datos del backend al formato esperado por el frontend
            const backendData = response.data;
            return {
                totalClientes: backendData.totalClients || 0,
                clientesActivos: backendData.activeClients || 0,
                clientesSuspendidos: backendData.suspendedClients || 0,
                clientesInactivos: backendData.inactiveClients || 0,
                period: 0, // Siempre 0 ya que no usamos period en el frontend
                // Campos adicionales del backend
                clientesPagados: backendData.paidClients || 0,
                clientesPorVencer: backendData.expiringClients || 0,
                clientesVencidos: backendData.expiredClients || 0,
                clientesSuspendidosPago: backendData.suspendedPaymentClients || 0
            };
        } catch (error: any) {
            console.error('❌ Error fetching client summary:', error);
            // Devolver valores por defecto si hay error
            return {
                totalClientes: 0,
                clientesActivos: 0,
                clientesSuspendidos: 0,
                clientesInactivos: 0,
                period: 0, // Siempre 0 ya que no usamos period en el frontend
                clientesPagados: 0,
                clientesPorVencer: 0,
                clientesVencidos: 0,
                clientesSuspendidosPago: 0
            };
        }
    }

    // Validar DNI
    static async validateDni(dni: string): Promise<{ valid: boolean; message: string }> {
        const response = await axios.get(`/client/validate-dni/${dni}`);
        return response.data;
    }

    // Sincronizar estados de clientes
    static async syncStates(): Promise<{ message: string }> {
        const response = await axios.post('/client/sync-states');
        return response.data;
    }

    // Obtener clientes nuevos (últimos 30 días)
    static async getNewClients(): Promise<{ data: Client[]; total: number }> {
        const response = await axios.get('/client/new');
        return response.data;
    }

    // Obtener clientes con filtros avanzados
    static async getWithFilters(filters: ClientFilters, page: number = 1, limit: number = 10): Promise<{ data: Client[]; total: number }> {
        const params: Record<string, any> = {
            page: page.toString(),
            limit: limit.toString()
        };

        // Procesar filtros de estado
        if (filters.status) {
            const activeStatuses = Object.entries(filters.status)
                .filter(([ _, value ]) => value)
                .map(([ key ]) => key);
            if (activeStatuses.length > 0) {
                params.status = activeStatuses;
            }
        }

        if (filters.name) {
            params.name = filters.name;
        }

        if (filters.dni) {
            params.dni = filters.dni;
        }

        if (filters.services && filters.services.length > 0) {
            params.services = filters.services;
        }

        if (filters.sectors && filters.sectors.length > 0) {
            params.sectors = filters.sectors;
        }

        if (filters.minCost !== undefined) {
            params.minCost = filters.minCost.toString();
        }

        if (filters.maxCost !== undefined) {
            params.maxCost = filters.maxCost.toString();
        }

        const response = await axios.get('/client', { params });
        return response.data;
    }
} 