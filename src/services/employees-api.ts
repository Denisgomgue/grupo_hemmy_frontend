import axios from '@/lib/axios'
import { Employee } from '@/types/employees/employee'

export interface CreateEmployeeData {
    name: string;
    lastName: string;
    dni: string;
    phone?: string;
    email?: string;
    address?: string;
    position?: string;
    department?: string;
    hireDate?: string;
    salary?: number;
    isActive?: boolean;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> { }

export interface EmployeeFilters {
    isActive?: boolean;
    department?: string;
    position?: string;
    search?: string;
}

export interface EmployeeSummary {
    total: number;
    active: number;
    inactive: number;
    byDepartment: Record<string, number>;
    byPosition: Record<string, number>;
}

export class EmployeesAPI {
    // Obtener todos los empleados
    static async getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        department?: string;
        position?: string;
    }): Promise<{ data: Employee[]; total: number }> {
        const response = await axios.get('/employees', { params });
        return response.data;
    }

    // Obtener empleado por ID
    static async getById(id: number): Promise<Employee> {
        const response = await axios.get(`/employees/${id}`);
        return response.data;
    }

    // Crear nuevo empleado
    static async create(data: CreateEmployeeData): Promise<Employee> {
        const response = await axios.post('/employees', data);
        return response.data;
    }

    // Actualizar empleado
    static async update(id: number, data: UpdateEmployeeData): Promise<Employee> {
        const response = await axios.patch(`/employees/${id}`, data);
        return response.data;
    }

    // Eliminar empleado
    static async delete(id: number): Promise<void> {
        await axios.delete(`/employees/${id}`);
    }

    // Obtener resumen de empleados
    static async getSummary(): Promise<EmployeeSummary> {
        const response = await axios.get('/employees/summary');
        return response.data;
    }

    // Filtrar empleados
    static async filter(filters: EmployeeFilters): Promise<Employee[]> {
        const response = await axios.get('/employees/filter', { params: filters });
        return response.data;
    }

    // Obtener empleados activos
    static async getActive(): Promise<Employee[]> {
        const response = await axios.get('/employees/active');
        return response.data;
    }

    // Obtener empleados por departamento
    static async getByDepartment(department: string): Promise<Employee[]> {
        const response = await axios.get(`/employees/department/${department}`);
        return response.data;
    }

    // Obtener empleados por posición
    static async getByPosition(position: string): Promise<Employee[]> {
        const response = await axios.get(`/employees/position/${position}`);
        return response.data;
    }

    // Buscar empleados por DNI
    static async searchByDni(dni: string): Promise<Employee[]> {
        const response = await axios.get(`/employees/search/dni/${dni}`);
        return response.data;
    }

    // Buscar empleados por nombre
    static async searchByName(name: string): Promise<Employee[]> {
        const response = await axios.get(`/employees/search/name/${name}`);
        return response.data;
    }

    // Activar/Desactivar empleado
    static async toggleActive(id: number): Promise<Employee> {
        const response = await axios.patch(`/employees/${id}/toggle-active`);
        return response.data;
    }

    // Obtener empleados con dispositivos asignados
    static async getWithDevices(): Promise<Employee[]> {
        const response = await axios.get('/employees/with-devices');
        return response.data;
    }

    // Obtener empleados con instalaciones asignadas
    static async getWithInstallations(): Promise<Employee[]> {
        const response = await axios.get('/employees/with-installations');
        return response.data;
    }

    // Validar DNI de empleado
    static async validateDni(dni: string): Promise<{ valid: boolean; message: string }> {
        const response = await axios.get(`/employees/validate-dni/${dni}`);
        return response.data;
    }

    // Obtener empleados con paginación
    static async getPaginated(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        department?: string;
        position?: string;
    }): Promise<{ data: Employee[]; total: number }> {
        const response = await axios.get('/employees', { params });
        return response.data;
    }
} 