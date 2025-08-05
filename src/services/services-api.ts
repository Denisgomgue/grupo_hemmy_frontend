import axios from '@/lib/axios'
import { Service } from '@/types/services/service'

export interface CreateServiceData {
    name: string;
    description?: string;
    price: number;
    isActive?: boolean;
    category?: string;
    duration?: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> { }

export interface ServiceFilters {
    isActive?: boolean;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
}

export interface ServiceSummary {
    total: number;
    active: number;
    inactive: number;
    averagePrice: number;
    totalRevenue: number;
    byCategory: Record<string, number>;
}

export class ServicesAPI {
    // Obtener todos los servicios
    static async getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        category?: string;
    }): Promise<{ data: Service[]; total: number }> {
        const response = await axios.get('/services', { params });
        return response.data;
    }

    // Obtener servicio por ID
    static async getById(id: number): Promise<Service> {
        const response = await axios.get(`/services/${id}`);
        return response.data;
    }

    // Crear nuevo servicio
    static async create(data: CreateServiceData): Promise<Service> {
        const response = await axios.post('/services', data);
        return response.data;
    }

    // Actualizar servicio
    static async update(id: number, data: UpdateServiceData): Promise<Service> {
        const response = await axios.patch(`/services/${id}`, data);
        return response.data;
    }

    // Eliminar servicio
    static async delete(id: number): Promise<void> {
        await axios.delete(`/services/${id}`);
    }

    // Obtener servicios activos
    static async getActive(): Promise<Service[]> {
        const response = await axios.get('/services/active');
        return response.data;
    }

    // Obtener resumen de servicios
    static async getSummary(): Promise<ServiceSummary> {
        const response = await axios.get('/services/summary');
        return response.data;
    }

    // Filtrar servicios
    static async filter(filters: ServiceFilters): Promise<Service[]> {
        const response = await axios.get('/services/filter', { params: filters });
        return response.data;
    }

    // Activar/Desactivar servicio
    static async toggleActive(id: number): Promise<Service> {
        const response = await axios.patch(`/services/${id}/toggle-active`);
        return response.data;
    }

    // Buscar servicios por nombre
    static async searchByName(name: string): Promise<Service[]> {
        const response = await axios.get(`/services/search/name/${name}`);
        return response.data;
    }

    // Obtener servicios por categoría
    static async getByCategory(category: string): Promise<Service[]> {
        const response = await axios.get(`/services/category/${category}`);
        return response.data;
    }

    // Obtener servicios por rango de precio
    static async getByPriceRange(minPrice: number, maxPrice: number): Promise<Service[]> {
        const response = await axios.get('/services/price-range', {
            params: { minPrice, maxPrice }
        });
        return response.data;
    }

    // Obtener servicios más populares
    static async getPopular(limit: number = 5): Promise<Service[]> {
        const response = await axios.get('/services/popular', { params: { limit } });
        return response.data;
    }

    // Obtener servicios con paginación
    static async getPaginated(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<{ data: Service[]; total: number }> {
        const response = await axios.get('/services', { params });
        return response.data;
    }

    // Obtener estadísticas de servicios
    static async getStatistics(): Promise<{
        totalServices: number;
        activeServices: number;
        totalRevenue: number;
        averagePrice: number;
        mostPopularService: Service | null;
        byCategory: Record<string, number>;
    }> {
        const response = await axios.get('/services/statistics');
        return response.data;
    }

    // Duplicar servicio
    static async duplicate(id: number, newName: string): Promise<Service> {
        const response = await axios.post(`/services/${id}/duplicate`, { name: newName });
        return response.data;
    }

    // Obtener servicios con clientes
    static async getWithClients(): Promise<Service[]> {
        const response = await axios.get('/services/with-clients');
        return response.data;
    }

    // Obtener categorías de servicios
    static async getCategories(): Promise<string[]> {
        const response = await axios.get('/services/categories');
        return response.data;
    }
} 