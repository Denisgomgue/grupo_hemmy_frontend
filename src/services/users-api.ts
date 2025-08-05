import axios from '@/lib/axios'
import { User } from '@/types/user/user'

export interface CreateUserData {
    name: string;
    lastName: string;
    email: string;
    password: string;
    roleId?: number;
    isActive?: boolean;
    phone?: string;
    address?: string;
}

export interface UpdateUserData extends Partial<Omit<CreateUserData, 'password'>> {
    password?: string;
}

export interface UserFilters {
    isActive?: boolean;
    roleId?: number;
    search?: string;
}

export interface UserSummary {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
}

export class UsersAPI {
    // Obtener todos los usuarios
    static async getAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        roleId?: number;
    }): Promise<{ data: User[]; total: number }> {
        const response = await axios.get('/user', { params });
        return response.data;
    }

    // Obtener usuario por ID
    static async getById(id: number): Promise<User> {
        const response = await axios.get(`/user/${id}`);
        return response.data;
    }

    // Crear nuevo usuario
    static async create(data: CreateUserData): Promise<User> {
        const response = await axios.post('/user', data);
        return response.data;
    }

    // Actualizar usuario
    static async update(id: number, data: UpdateUserData): Promise<User> {
        const response = await axios.patch(`/user/${id}`, data);
        return response.data;
    }

    // Eliminar usuario
    static async delete(id: number): Promise<void> {
        await axios.delete(`/user/${id}`);
    }

    // Obtener usuarios activos
    static async getActive(): Promise<User[]> {
        const response = await axios.get('/user/active');
        return response.data;
    }

    // Obtener resumen de usuarios
    static async getSummary(): Promise<UserSummary> {
        const response = await axios.get('/user/summary');
        return response.data;
    }

    // Filtrar usuarios
    static async filter(filters: UserFilters): Promise<User[]> {
        const response = await axios.get('/user/filter', { params: filters });
        return response.data;
    }

    // Activar/Desactivar usuario
    static async toggleActive(id: number): Promise<User> {
        const response = await axios.patch(`/user/${id}/toggle-active`);
        return response.data;
    }

    // Buscar usuarios por nombre
    static async searchByName(name: string): Promise<User[]> {
        const response = await axios.get(`/user/search/name/${name}`);
        return response.data;
    }

    // Buscar usuarios por email
    static async searchByEmail(email: string): Promise<User[]> {
        const response = await axios.get(`/user/search/email/${email}`);
        return response.data;
    }

    // Obtener usuario con rol
    static async getWithRole(id: number): Promise<User & { role: any }> {
        const response = await axios.get(`/user/${id}/with-role`);
        return response.data;
    }

    // Obtener usuarios con roles
    static async getWithRoles(): Promise<(User & { role: any })[]> {
        const response = await axios.get('/user/with-roles');
        return response.data;
    }

    // Obtener usuarios por rol
    static async getByRole(roleId: number): Promise<User[]> {
        const response = await axios.get(`/user/role/${roleId}`);
        return response.data;
    }

    // Obtener usuarios con paginación
    static async getPaginated(params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        roleId?: number;
    }): Promise<{ data: User[]; total: number }> {
        const response = await axios.get('/user', { params });
        return response.data;
    }

    // Obtener estadísticas de usuarios
    static async getStatistics(): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        byRole: Record<string, number>;
        roleWithMostUsers: string | null;
    }> {
        const response = await axios.get('/user/statistics');
        return response.data;
    }

    // Cambiar contraseña de usuario
    static async changePassword(id: number, newPassword: string): Promise<User> {
        const response = await axios.patch(`/user/${id}/change-password`, { password: newPassword });
        return response.data;
    }

    // Asignar rol a usuario
    static async assignRole(id: number, roleId: number): Promise<User> {
        const response = await axios.patch(`/user/${id}/assign-role`, { roleId });
        return response.data;
    }

    // Validar email de usuario
    static async validateEmail(email: string): Promise<{ valid: boolean; message: string }> {
        const response = await axios.get(`/user/validate-email/${email}`);
        return response.data;
    }

    // Obtener perfil del usuario actual
    static async getProfile(): Promise<User> {
        const response = await axios.get('/user/profile');
        return response.data;
    }

    // Actualizar perfil del usuario actual
    static async updateProfile(data: Partial<UpdateUserData>): Promise<User> {
        const response = await axios.patch('/user/profile', data);
        return response.data;
    }
} 