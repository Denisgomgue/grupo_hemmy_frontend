import axios from '@/lib/axios'
import { Company } from '@/types/company/company'

export interface CreateCompanyData {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: File;
    isActive?: boolean;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> { }

export interface CompanySummary {
    total: number;
    active: number;
    inactive: number;
    totalClients: number;
    totalRevenue: number;
}

export class CompanyAPI {
    // Obtener todas las empresas
    static async getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<{ data: Company[]; total: number }> {
        const response = await axios.get('/company', { params });
        return response.data;
    }

    // Obtener empresa por ID
    static async getById(id: number): Promise<Company> {
        const response = await axios.get(`/company/${id}`);
        return response.data;
    }

    // Crear nueva empresa
    static async create(data: CreateCompanyData): Promise<Company> {
        const formData = new FormData();

        // Agregar campos al FormData
        Object.entries(data).forEach(([ key, value ]) => {
            if (value !== undefined) {
                if (key === 'logo' && value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        const response = await axios.post('/company', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    // Actualizar empresa
    static async update(id: number, data: UpdateCompanyData): Promise<Company> {
        const formData = new FormData();

        // Agregar campos al FormData
        Object.entries(data).forEach(([ key, value ]) => {
            if (value !== undefined) {
                if (key === 'logo' && value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        const response = await axios.patch(`/company/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    // Eliminar empresa
    static async delete(id: number): Promise<void> {
        await axios.delete(`/company/${id}`);
    }

    // Obtener empresas activas
    static async getActive(): Promise<Company[]> {
        const response = await axios.get('/company/active');
        return response.data;
    }

    // Obtener resumen de empresas
    static async getSummary(): Promise<CompanySummary> {
        const response = await axios.get('/company/summary');
        return response.data;
    }

    // Activar/Desactivar empresa
    static async toggleActive(id: number): Promise<Company> {
        const response = await axios.patch(`/company/${id}/toggle-active`);
        return response.data;
    }

    // Buscar empresas por nombre
    static async searchByName(name: string): Promise<Company[]> {
        const response = await axios.get(`/company/search/name/${name}`);
        return response.data;
    }

    // Obtener empresa con clientes
    static async getWithClients(id: number): Promise<Company & { clients: any[] }> {
        const response = await axios.get(`/company/${id}/with-clients`);
        return response.data;
    }

    // Obtener empresas con estadísticas
    static async getWithStats(): Promise<(Company & { clientCount: number; revenue: number })[]> {
        const response = await axios.get('/company/with-stats');
        return response.data;
    }

    // Obtener empresas con paginación
    static async getPaginated(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<{ data: Company[]; total: number }> {
        const response = await axios.get('/company', { params });
        return response.data;
    }

    // Obtener estadísticas de empresas
    static async getStatistics(): Promise<{
        totalCompanies: number;
        activeCompanies: number;
        totalClients: number;
        totalRevenue: number;
        companyWithMostClients: Company | null;
    }> {
        const response = await axios.get('/company/statistics');
        return response.data;
    }

    // Obtener empresa principal (configuración actual)
    static async getMain(): Promise<Company> {
        const response = await axios.get('/company/main');
        return response.data;
    }

    // Actualizar empresa principal
    static async updateMain(data: UpdateCompanyData): Promise<Company> {
        const formData = new FormData();

        // Agregar campos al FormData
        Object.entries(data).forEach(([ key, value ]) => {
            if (value !== undefined) {
                if (key === 'logo' && value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        const response = await axios.patch('/company/main', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    // Validar nombre de empresa
    static async validateName(name: string): Promise<{ valid: boolean; message: string }> {
        const response = await axios.get(`/company/validate-name/${name}`);
        return response.data;
    }
} 