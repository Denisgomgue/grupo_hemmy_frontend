import axios from '@/lib/axios'
import { Installation, InstallationStatus } from '@/types/installations/installation'

export interface CreateInstallationData {
    clientId: number;
    employeeId?: number;
    installationDate: string;
    status: InstallationStatus;
    address: string;
    coordinates?: string;
    description?: string;
    notes?: string;
    equipmentList?: string;
    installationType?: string;
}

export interface UpdateInstallationData extends Partial<CreateInstallationData> { }

export interface InstallationFilters {
    status?: InstallationStatus;
    clientId?: number;
    employeeId?: number;
    installationDate?: string;
    installationType?: string;
}

export interface InstallationSummary {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    cancelled: number;
    byStatus: Record<InstallationStatus, number>;
    byType: Record<string, number>;
}

export class InstallationsAPI {
    // Obtener todas las instalaciones
    static async getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: InstallationStatus;
        clientId?: number;
        employeeId?: number;
    }): Promise<{ data: Installation[]; total: number }> {
        const response = await axios.get('/installations', { params });
        return response.data;
    }

    // Obtener instalación por ID
    static async getById(id: number): Promise<Installation> {
        const response = await axios.get(`/installations/${id}`);
        return response.data;
    }

    // Crear nueva instalación
    static async create(data: CreateInstallationData): Promise<Installation> {
        const response = await axios.post('/installations', data);
        return response.data;
    }

    // Actualizar instalación
    static async update(id: number, data: UpdateInstallationData): Promise<Installation> {
        const response = await axios.patch(`/installations/${id}`, data);
        return response.data;
    }

    // Eliminar instalación
    static async delete(id: number): Promise<void> {
        await axios.delete(`/installations/${id}`);
    }

    // Obtener instalaciones por cliente
    static async getByClient(clientId: number): Promise<Installation[]> {
        const response = await axios.get(`/installations/client/${clientId}`);
        return response.data;
    }

    // Obtener instalaciones por empleado
    static async getByEmployee(employeeId: number): Promise<Installation[]> {
        const response = await axios.get(`/installations/employee/${employeeId}`);
        return response.data;
    }

    // Obtener resumen de instalaciones
    static async getSummary(): Promise<InstallationSummary> {
        const response = await axios.get('/installations/summary');
        return response.data;
    }

    // Filtrar instalaciones
    static async filter(filters: InstallationFilters): Promise<Installation[]> {
        const response = await axios.get('/installations/filter', { params: filters });
        return response.data;
    }

    // Actualizar estado de instalación
    static async updateStatus(id: number, status: InstallationStatus): Promise<Installation> {
        const response = await axios.patch(`/installations/${id}/status`, { status });
        return response.data;
    }

    // Asignar empleado a instalación
    static async assignEmployee(id: number, employeeId: number): Promise<Installation> {
        const response = await axios.patch(`/installations/${id}/assign-employee`, { employeeId });
        return response.data;
    }

    // Obtener instalaciones pendientes
    static async getPending(): Promise<Installation[]> {
        const response = await axios.get('/installations/pending');
        return response.data;
    }

    // Obtener instalaciones en progreso
    static async getInProgress(): Promise<Installation[]> {
        const response = await axios.get('/installations/in-progress');
        return response.data;
    }

    // Obtener instalaciones completadas
    static async getCompleted(): Promise<Installation[]> {
        const response = await axios.get('/installations/completed');
        return response.data;
    }

    // Obtener instalaciones por fecha
    static async getByDate(date: string): Promise<Installation[]> {
        const response = await axios.get(`/installations/date/${date}`);
        return response.data;
    }

    // Obtener instalaciones por rango de fechas
    static async getByDateRange(startDate: string, endDate: string): Promise<Installation[]> {
        const response = await axios.get('/installations/date-range', {
            params: { startDate, endDate }
        });
        return response.data;
    }

    // Obtener instalaciones por tipo
    static async getByType(type: string): Promise<Installation[]> {
        const response = await axios.get(`/installations/type/${type}`);
        return response.data;
    }

    // Buscar instalaciones por dirección
    static async searchByAddress(address: string): Promise<Installation[]> {
        const response = await axios.get(`/installations/search/address/${address}`);
        return response.data;
    }

    // Obtener instalaciones con paginación
    static async getPaginated(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: InstallationStatus;
        clientId?: number;
        employeeId?: number;
        installationType?: string;
    }): Promise<{ data: Installation[]; total: number }> {
        const response = await axios.get('/installations', { params });
        return response.data;
    }

    // Obtener estadísticas de instalaciones
    static async getStatistics(): Promise<{
        totalInstallations: number;
        installationsThisMonth: number;
        installationsThisYear: number;
        averageCompletionTime: number;
    }> {
        const response = await axios.get('/installations/statistics');
        return response.data;
    }
} 