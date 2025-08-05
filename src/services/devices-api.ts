import axios from '@/lib/axios'
import { Device, DeviceStatus, DeviceType, DeviceUseType } from '@/types/devices/device'

export interface CreateDeviceData {
    serialNumber: string;
    type: DeviceType;
    useType: DeviceUseType;
    status: DeviceStatus;
    assignedClientId?: number;
    assignedEmployeeId?: number;
    assignedDate?: string;
    description?: string;
    location?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
}

export interface UpdateDeviceData extends Partial<CreateDeviceData> { }

export interface DeviceFilters {
    status?: DeviceStatus;
    type?: DeviceType;
    useType?: DeviceUseType;
    assignedClientId?: number;
    assignedEmployeeId?: number;
}

export interface DeviceSummary {
    total: number;
    active: number;
    inactive: number;
    assigned: number;
    unassigned: number;
    byType: Record<DeviceType, number>;
    byStatus: Record<DeviceStatus, number>;
}

export class DevicesAPI {
    // Obtener todos los dispositivos
    static async getAll(): Promise<Device[]> {
        const response = await axios.get('/devices');
        return response.data;
    }

    // Obtener dispositivo por ID
    static async getById(id: number): Promise<Device> {
        const response = await axios.get(`/devices/${id}`);
        return response.data;
    }

    // Crear nuevo dispositivo
    static async create(data: CreateDeviceData): Promise<Device> {
        const response = await axios.post('/devices', data);
        return response.data;
    }

    // Actualizar dispositivo
    static async update(id: number, data: UpdateDeviceData): Promise<Device> {
        const response = await axios.patch(`/devices/${id}`, data);
        return response.data;
    }

    // Eliminar dispositivo
    static async delete(id: number): Promise<void> {
        await axios.delete(`/devices/${id}`);
    }

    // Obtener dispositivos por cliente
    static async getByClient(clientId: number): Promise<Device[]> {
        const response = await axios.get(`/devices/client/${clientId}`);
        return response.data;
    }

    // Obtener dispositivos por empleado
    static async getByEmployee(employeeId: number): Promise<Device[]> {
        const response = await axios.get(`/devices/employee/${employeeId}`);
        return response.data;
    }

    // Filtrar dispositivos
    static async filter(filters: DeviceFilters): Promise<Device[]> {
        const response = await axios.get('/devices/filter', { params: filters });
        return response.data;
    }

    // Obtener resumen de dispositivos
    static async getSummary(): Promise<DeviceSummary> {
        const response = await axios.get('/devices/summary');
        return response.data;
    }

    // Actualizar estado del dispositivo
    static async updateStatus(id: number, status: DeviceStatus): Promise<Device> {
        const response = await axios.patch(`/devices/${id}/status`, { status });
        return response.data;
    }

    // Asignar dispositivo a cliente
    static async assignToClient(id: number, clientId: number): Promise<Device> {
        const response = await axios.patch(`/devices/${id}/assign-client`, { clientId });
        return response.data;
    }

    // Asignar dispositivo a empleado
    static async assignToEmployee(id: number, employeeId: number): Promise<Device> {
        const response = await axios.patch(`/devices/${id}/assign-employee`, { employeeId });
        return response.data;
    }

    // Desasignar dispositivo
    static async unassign(id: number): Promise<Device> {
        const response = await axios.patch(`/devices/${id}/unassign`);
        return response.data;
    }

    // Obtener dispositivos disponibles (no asignados)
    static async getAvailable(): Promise<Device[]> {
        const response = await axios.get('/devices/available');
        return response.data;
    }

    // Obtener dispositivos por tipo
    static async getByType(type: DeviceType): Promise<Device[]> {
        const response = await axios.get(`/devices/type/${type}`);
        return response.data;
    }

    // Obtener dispositivos por estado
    static async getByStatus(status: DeviceStatus): Promise<Device[]> {
        const response = await axios.get(`/devices/status/${status}`);
        return response.data;
    }

    // Buscar dispositivos por número de serie
    static async searchBySerial(serialNumber: string): Promise<Device[]> {
        const response = await axios.get(`/devices/search/serial/${serialNumber}`);
        return response.data;
    }

    // Obtener historial de cambios de estado
    static async getStatusHistory(id: number): Promise<any[]> {
        const response = await axios.get(`/devices/${id}/status-history`);
        return response.data;
    }

    // Obtener dispositivos con paginación
    static async getPaginated(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: DeviceStatus;
        type?: DeviceType;
        useType?: DeviceUseType;
    }): Promise<{ data: Device[]; total: number }> {
        const response = await axios.get('/devices', { params });
        return response.data;
    }
} 