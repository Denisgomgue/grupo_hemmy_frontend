import axios from '@/lib/axios'
import { Role } from '@/types/roles/role'

export interface CreateRoleData {
    name: string;
    description?: string;
    isActive?: boolean;
    permissions?: number[];
}

export interface UpdateRoleData extends Partial<CreateRoleData> { }

export interface RoleFilters {
    isActive?: boolean;
    search?: string;
}

export interface RoleSummary {
    total: number;
    active: number;
    inactive: number;
    totalUsers: number;
    averageUsersPerRole: number;
}

export class RolesAPI {
    // Obtener todos los roles
    static async getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<{ data: Role[]; total: number }> {
        const response = await axios.get('/role', { params });
        return response.data;
    }

    // Obtener rol por ID
    static async getById(id: number): Promise<Role> {
        const response = await axios.get(`/role/${id}`);
        return response.data;
    }

    // Crear nuevo rol
    static async create(data: CreateRoleData): Promise<Role> {
        const response = await axios.post('/role', data);
        return response.data;
    }

    // Actualizar rol
    static async update(id: number, data: UpdateRoleData): Promise<Role> {
        const response = await axios.patch(`/role/${id}`, data);
        return response.data;
    }

    // Eliminar rol
    static async delete(id: number): Promise<void> {
        await axios.delete(`/role/${id}`);
    }

    // Obtener roles activos
    static async getActive(): Promise<Role[]> {
        const response = await axios.get('/role/active');
        return response.data;
    }

    // Obtener resumen de roles
    static async getSummary(): Promise<RoleSummary> {
        const response = await axios.get('/role/summary');
        return response.data;
    }

    // Filtrar roles
    static async filter(filters: RoleFilters): Promise<Role[]> {
        const response = await axios.get('/role/filter', { params: filters });
        return response.data;
    }

    // Activar/Desactivar rol
    static async toggleActive(id: number): Promise<Role> {
        const response = await axios.patch(`/role/${id}/toggle-active`);
        return response.data;
    }

    // Buscar roles por nombre
    static async searchByName(name: string): Promise<Role[]> {
        const response = await axios.get(`/role/search/name/${name}`);
        return response.data;
    }

    // Obtener rol con permisos
    static async getWithPermissions(id: number): Promise<Role & { permissions: any[] }> {
        const response = await axios.get(`/role/${id}/with-permissions`);
        return response.data;
    }

    // Obtener roles con estadísticas de usuarios
    static async getWithUserStats(): Promise<(Role & { userCount: number })[]> {
        const response = await axios.get('/role/with-user-stats');
        return response.data;
    }

    // Obtener roles con paginación
    static async getPaginated(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<{ data: Role[]; total: number }> {
        const response = await axios.get('/role', { params });
        return response.data;
    }

    // Obtener estadísticas de roles
    static async getStatistics(): Promise<{
        totalRoles: number;
        activeRoles: number;
        totalUsers: number;
        averageUsersPerRole: number;
        roleWithMostUsers: Role | null;
    }> {
        const response = await axios.get('/role/statistics');
        return response.data;
    }

    // Asignar permisos a rol
    static async assignPermissions(id: number, permissionIds: number[]): Promise<Role> {
        const response = await axios.post(`/role/${id}/assign-permissions`, { permissionIds });
        return response.data;
    }

    // Remover permisos de rol
    static async removePermissions(id: number, permissionIds: number[]): Promise<Role> {
        const response = await axios.delete(`/role/${id}/remove-permissions`, {
            data: { permissionIds }
        });
        return response.data;
    }

    // Obtener roles con usuarios
    static async getWithUsers(): Promise<Role[]> {
        const response = await axios.get('/role/with-users');
        return response.data;
    }

    // Duplicar rol
    static async duplicate(id: number, newName: string): Promise<Role> {
        const response = await axios.post(`/role/${id}/duplicate`, { name: newName });
        return response.data;
    }
} 