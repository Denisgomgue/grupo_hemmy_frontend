import axios from '@/lib/axios'
import { Plan } from '@/types/plans/plan'

export interface CreatePlanData {
    name: string;
    description?: string;
    price: number;
    speed?: string;
    features?: string[];
    isActive?: boolean;
    duration?: number;
    maxClients?: number;
}

export interface UpdatePlanData extends Partial<CreatePlanData> { }

export interface PlanFilters {
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
}

export interface PlanSummary {
    total: number;
    active: number;
    inactive: number;
    averagePrice: number;
    totalRevenue: number;
}

export class PlansAPI {
    // Obtener todos los planes
    static async getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<{ data: Plan[]; total: number }> {
        const response = await axios.get('/plans', { params });
        return response.data;
    }

    // Obtener plan por ID
    static async getById(id: number): Promise<Plan> {
        const response = await axios.get(`/plans/${id}`);
        return response.data;
    }

    // Crear nuevo plan
    static async create(data: CreatePlanData): Promise<Plan> {
        const response = await axios.post('/plans', data);
        return response.data;
    }

    // Actualizar plan
    static async update(id: number, data: UpdatePlanData): Promise<Plan> {
        const response = await axios.patch(`/plans/${id}`, data);
        return response.data;
    }

    // Eliminar plan
    static async delete(id: number): Promise<void> {
        await axios.delete(`/plans/${id}`);
    }

    // Obtener planes activos
    static async getActive(): Promise<Plan[]> {
        const response = await axios.get('/plans/active');
        return response.data;
    }

    // Obtener resumen de planes
    static async getSummary(): Promise<PlanSummary> {
        const response = await axios.get('/plans/summary');
        return response.data;
    }

    // Filtrar planes
    static async filter(filters: PlanFilters): Promise<Plan[]> {
        const response = await axios.get('/plans/filter', { params: filters });
        return response.data;
    }

    // Activar/Desactivar plan
    static async toggleActive(id: number): Promise<Plan> {
        const response = await axios.patch(`/plans/${id}/toggle-active`);
        return response.data;
    }

    // Buscar planes por nombre
    static async searchByName(name: string): Promise<Plan[]> {
        const response = await axios.get(`/plans/search/name/${name}`);
        return response.data;
    }

    // Obtener planes por rango de precio
    static async getByPriceRange(minPrice: number, maxPrice: number): Promise<Plan[]> {
        const response = await axios.get('/plans/price-range', {
            params: { minPrice, maxPrice }
        });
        return response.data;
    }

    // Obtener planes más populares
    static async getPopular(limit: number = 5): Promise<Plan[]> {
        const response = await axios.get('/plans/popular', { params: { limit } });
        return response.data;
    }

    // Obtener planes con paginación
    static async getPaginated(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<{ data: Plan[]; total: number }> {
        const response = await axios.get('/plans', { params });
        return response.data;
    }

    // Obtener estadísticas de planes
    static async getStatistics(): Promise<{
        totalPlans: number;
        activePlans: number;
        totalRevenue: number;
        averagePrice: number;
        mostPopularPlan: Plan | null;
    }> {
        const response = await axios.get('/plans/statistics');
        return response.data;
    }

    // Duplicar plan
    static async duplicate(id: number, newName: string): Promise<Plan> {
        const response = await axios.post(`/plans/${id}/duplicate`, { name: newName });
        return response.data;
    }

    // Obtener planes con clientes
    static async getWithClients(): Promise<Plan[]> {
        const response = await axios.get('/plans/with-clients');
        return response.data;
    }
} 