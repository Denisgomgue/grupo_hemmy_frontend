import axios from '@/lib/axios'
import { Sector } from '@/types/sectors/sector'

export interface CreateSectorData {
    name: string;
    description?: string;
    location?: string;
    coordinates?: string;
    isActive?: boolean;
}

export interface UpdateSectorData extends Partial<CreateSectorData> { }

export interface SectorFilters {
    isActive?: boolean;
    search?: string;
}

export interface SectorSummary {
    total: number;
    active: number;
    inactive: number;
    totalClients: number;
    averageClientsPerSector: number;
}

export class SectorsAPI {
    // Obtener todos los sectores
    static async getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<{ data: Sector[]; total: number }> {
        const response = await axios.get('/sectors', { params });
        return response.data;
    }

    // Obtener sector por ID
    static async getById(id: number): Promise<Sector> {
        const response = await axios.get(`/sectors/${id}`);
        return response.data;
    }

    // Crear nuevo sector
    static async create(data: CreateSectorData): Promise<Sector> {
        const response = await axios.post('/sectors', data);
        return response.data;
    }

    // Actualizar sector
    static async update(id: number, data: UpdateSectorData): Promise<Sector> {
        const response = await axios.patch(`/sectors/${id}`, data);
        return response.data;
    }

    // Eliminar sector
    static async delete(id: number): Promise<void> {
        await axios.delete(`/sectors/${id}`);
    }

    // Obtener sectores activos
    static async getActive(): Promise<Sector[]> {
        const response = await axios.get('/sectors/active');
        return response.data;
    }

    // Obtener resumen de sectores
    static async getSummary(): Promise<SectorSummary> {
        const response = await axios.get('/sectors/summary');
        return response.data;
    }

    // Filtrar sectores
    static async filter(filters: SectorFilters): Promise<Sector[]> {
        const response = await axios.get('/sectors/filter', { params: filters });
        return response.data;
    }

    // Activar/Desactivar sector
    static async toggleActive(id: number): Promise<Sector> {
        const response = await axios.patch(`/sectors/${id}/toggle-active`);
        return response.data;
    }

    // Buscar sectores por nombre
    static async searchByName(name: string): Promise<Sector[]> {
        const response = await axios.get(`/sectors/search/name/${name}`);
        return response.data;
    }

    // Obtener sector con clientes
    static async getWithClients(id: number): Promise<Sector & { clients: any[] }> {
        const response = await axios.get(`/sectors/${id}/with-clients`);
        return response.data;
    }

    // Obtener sectores con estadísticas de clientes
    static async getWithClientStats(): Promise<(Sector & { clientCount: number })[]> {
        const response = await axios.get('/sectors/with-client-stats');
        return response.data;
    }

    // Obtener sectores con paginación
    static async getPaginated(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<{ data: Sector[]; total: number }> {
        const response = await axios.get('/sectors', { params });
        return response.data;
    }

    // Obtener estadísticas de sectores
    static async getStatistics(): Promise<{
        totalSectors: number;
        activeSectors: number;
        totalClients: number;
        averageClientsPerSector: number;
        sectorWithMostClients: Sector | null;
    }> {
        const response = await axios.get('/sectors/statistics');
        return response.data;
    }

    // Obtener sectores por ubicación
    static async getByLocation(location: string): Promise<Sector[]> {
        const response = await axios.get(`/sectors/location/${location}`);
        return response.data;
    }

    // Obtener sectores con instalaciones
    static async getWithInstallations(): Promise<Sector[]> {
        const response = await axios.get('/sectors/with-installations');
        return response.data;
    }
} 