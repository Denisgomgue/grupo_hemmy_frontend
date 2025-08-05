import axios from '@/lib/axios'
import { ClientPaymentConfig } from '@/types/client-payment-configs/client-payment-config'

export interface CreateClientPaymentConfigData {
    clientId: number;
    paymentMethodId: number;
    isActive?: boolean;
    configuration?: Record<string, any>;
}

export interface UpdateClientPaymentConfigData extends Partial<CreateClientPaymentConfigData> { }

export interface ClientPaymentConfigFilters {
    clientId?: number;
    paymentMethodId?: number;
    isActive?: boolean;
}

export interface ClientPaymentConfigSummary {
    total: number;
    active: number;
    inactive: number;
    byPaymentMethod: Record<string, number>;
}

export class ClientPaymentConfigAPI {
    // Obtener todas las configuraciones de pago de clientes
    static async getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        clientId?: number;
        paymentMethodId?: number;
        isActive?: boolean;
    }): Promise<{ data: ClientPaymentConfig[]; total: number }> {
        const response = await axios.get('/client-payment-config', { params });
        return response.data;
    }

    // Obtener configuración por ID
    static async getById(id: number): Promise<ClientPaymentConfig> {
        const response = await axios.get(`/client-payment-config/${id}`);
        return response.data;
    }

    // Crear nueva configuración
    static async create(data: CreateClientPaymentConfigData): Promise<ClientPaymentConfig> {
        const response = await axios.post('/client-payment-config', data);
        return response.data;
    }

    // Actualizar configuración
    static async update(id: number, data: UpdateClientPaymentConfigData): Promise<ClientPaymentConfig> {
        const response = await axios.patch(`/client-payment-config/${id}`, data);
        return response.data;
    }

    // Eliminar configuración
    static async delete(id: number): Promise<void> {
        await axios.delete(`/client-payment-config/${id}`);
    }

    // Obtener configuraciones activas
    static async getActive(): Promise<ClientPaymentConfig[]> {
        const response = await axios.get('/client-payment-config/active');
        return response.data;
    }

    // Obtener resumen de configuraciones
    static async getSummary(): Promise<ClientPaymentConfigSummary> {
        const response = await axios.get('/client-payment-config/summary');
        return response.data;
    }

    // Filtrar configuraciones
    static async filter(filters: ClientPaymentConfigFilters): Promise<ClientPaymentConfig[]> {
        const response = await axios.get('/client-payment-config/filter', { params: filters });
        return response.data;
    }

    // Activar/Desactivar configuración
    static async toggleActive(id: number): Promise<ClientPaymentConfig> {
        const response = await axios.patch(`/client-payment-config/${id}/toggle-active`);
        return response.data;
    }

    // Obtener configuraciones por cliente
    static async getByClient(clientId: number): Promise<ClientPaymentConfig[]> {
        const response = await axios.get(`/client-payment-config/client/${clientId}`);
        return response.data;
    }

    // Obtener configuraciones por método de pago
    static async getByPaymentMethod(paymentMethodId: number): Promise<ClientPaymentConfig[]> {
        const response = await axios.get(`/client-payment-config/payment-method/${paymentMethodId}`);
        return response.data;
    }

    // Obtener configuración activa por cliente
    static async getActiveByClient(clientId: number): Promise<ClientPaymentConfig | null> {
        const response = await axios.get(`/client-payment-config/client/${clientId}/active`);
        return response.data;
    }

    // Obtener configuraciones con paginación
    static async getPaginated(params?: {
        page?: number;
        limit?: number;
        search?: string;
        clientId?: number;
        paymentMethodId?: number;
        isActive?: boolean;
    }): Promise<{ data: ClientPaymentConfig[]; total: number }> {
        const response = await axios.get('/client-payment-config', { params });
        return response.data;
    }

    // Obtener estadísticas de configuraciones
    static async getStatistics(): Promise<{
        totalConfigs: number;
        activeConfigs: number;
        inactiveConfigs: number;
        byPaymentMethod: Record<string, number>;
        mostUsedPaymentMethod: string | null;
    }> {
        const response = await axios.get('/client-payment-config/statistics');
        return response.data;
    }

    // Validar configuración
    static async validate(data: CreateClientPaymentConfigData): Promise<{ valid: boolean; message: string }> {
        const response = await axios.post('/client-payment-config/validate', data);
        return response.data;
    }

    // Obtener configuraciones con detalles de cliente y método de pago
    static async getWithDetails(): Promise<(ClientPaymentConfig & {
        client: any;
        paymentMethod: any
    })[]> {
        const response = await axios.get('/client-payment-config/with-details');
        return response.data;
    }

    // Duplicar configuración
    static async duplicate(id: number, newClientId: number): Promise<ClientPaymentConfig> {
        const response = await axios.post(`/client-payment-config/${id}/duplicate`, { clientId: newClientId });
        return response.data;
    }
} 