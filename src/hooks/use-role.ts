import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { Role } from "@/types/roles/role"

function mapRoleFromApi(apiRole: any): Role {
    return {
        id: apiRole.id,
        name: apiRole.name,
        description: apiRole.description,
        allowAll: apiRole.allowAll,
        isPublic: apiRole.isPublic,
        created_at: new Date(apiRole.created_at),
        updated_at: new Date(apiRole.updated_at),
    }
}

export function useRoles() {
    const [ roles, setRoles ] = useState<Role[]>([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const fetchRoles = useCallback(async (
        page: number = 1,
        pageSize: number = 10,
        search?: string
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const params: Record<string, any> = {
                page: page.toString(),
                limit: pageSize.toString()
            };

            if (search) {
                params.search = search;
            }

            const response = await api.get<{ data: Role[], total: number }>("/roles", {
                params
            });

            const mappedRoles = response.data.data.map(mapRoleFromApi);
            setRoles(mappedRoles);
            return { data: mappedRoles, total: response.data.total };
        } catch (error) {
            console.error("Error fetching roles:", error);
            setError("Error al cargar roles");
            return { data: [], total: 0 };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getRoleById = useCallback(async (id: number): Promise<Role> => {
        try {
            const response = await api.get<Role>(`/roles/${id}`);
            return mapRoleFromApi(response.data);
        } catch (error) {
            console.error(`Error fetching role with ID ${id}:`, error);
            throw error;
        }
    }, []);

    const createRole = useCallback(async (roleData: any): Promise<Role> => {
        try {
            const response = await api.post<Role>("/roles", roleData);
            await fetchRoles();
            return mapRoleFromApi(response.data);
        } catch (error) {
            console.error("Error creating role:", error);
            throw error;
        }
    }, [ fetchRoles ]);

    const updateRole = useCallback(async (id: number, roleData: any): Promise<Role> => {
        try {
            const response = await api.patch<Role>(`/roles/${id}`, roleData);
            await fetchRoles();
            return mapRoleFromApi(response.data);
        } catch (error) {
            console.error("Error updating role:", error);
            throw error;
        }
    }, [ fetchRoles ]);

    const deleteRole = useCallback(async (id: number): Promise<void> => {
        try {
            await api.delete(`/roles/${id}`);
            await fetchRoles();
        } catch (error) {
            console.error("Error deleting role:", error);
            throw error;
        }
    }, [ fetchRoles ]);

    return {
        roles,
        isLoading,
        error,
        fetchRoles,
        getRoleById,
        createRole,
        updateRole,
        deleteRole
    };
} 