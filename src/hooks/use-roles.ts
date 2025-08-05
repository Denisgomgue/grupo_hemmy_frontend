import { useState, useEffect } from "react"
import { Role, CreateRoleData, UpdateRoleData, RoleSummary } from "@/types/roles/role"
import { api } from "@/lib/axios"
import { useAuth } from "@/contexts/AuthContext"

function mapRoleFromApi(apiRole: any): Role {
    return {
        id: apiRole.id,
        name: apiRole.name,
        description: apiRole.description,
        allowAll: apiRole.allowAll,
        isPublic: apiRole.isPublic,
        role_has_permissions: apiRole.role_has_permissions?.map((rhp: any) => ({
            id: rhp.id,
            name: rhp.name,
            routeCode: rhp.routeCode,
            actions: rhp.actions || [],
            restrictions: rhp.restrictions || [],
            isSubRoute: rhp.isSubRoute,
            permissionId: rhp.permissionId,
            permission: rhp.permission,
            createdAt: rhp.createdAt ? new Date(rhp.createdAt) : new Date(),
            updatedAt: rhp.updatedAt ? new Date(rhp.updatedAt) : new Date(),
        })) || [],
        employees: apiRole.employees,
        created_at: apiRole.created_at ? new Date(apiRole.created_at) : new Date(),
        updated_at: apiRole.updated_at ? new Date(apiRole.updated_at) : new Date(),
    }
}

export function useRoles() {
    const [ roles, setRoles ] = useState<Role[]>([])
    const [ isLoading, setIsLoading ] = useState(true)
    const [ error, setError ] = useState<string | null>(null)
    const { user } = useAuth()

    const fetchRoles = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await api.get("/roles")
            setRoles(response.data.map(mapRoleFromApi))
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al cargar roles")
        } finally {
            setIsLoading(false)
        }
    }

    const createRole = async (roleData: CreateRoleData): Promise<Role> => {
        try {
            const response = await api.post("/roles", roleData)
            await fetchRoles()
            return mapRoleFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al crear rol")
        }
    }

    const updateRole = async (id: number, roleData: UpdateRoleData): Promise<Role> => {
        try {
            const response = await api.patch(`/roles/${id}`, roleData)
            await fetchRoles()
            return mapRoleFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al actualizar rol")
        }
    }

    const deleteRole = async (id: number): Promise<void> => {
        try {
            await api.delete(`/roles/${id}`)
            await fetchRoles()
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al eliminar rol")
        }
    }

    const getRoleById = async (id: number): Promise<Role> => {
        try {
            const response = await api.get(`/roles/${id}`)
            return mapRoleFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al obtener rol")
        }
    }

    const getRoleSummary = async (): Promise<RoleSummary> => {
        try {
            const response = await api.get("/roles/summary")
            return response.data
        } catch (err: any) {
            console.error("Error fetching role summary:", err)
            // Retornar datos por defecto si falla
            return {
                total: 0,
                active: 0,
                inactive: 0,
                publicRoles: 0,
                privateRoles: 0,
                rolesWithPermissions: 0,
                rolesWithoutPermissions: 0
            }
        }
    }

    useEffect(() => {
        if (user) {
            fetchRoles()
        }
    }, [ user ])

    return {
        roles,
        isLoading,
        error,
        refetch: fetchRoles,
        createRole,
        updateRole,
        deleteRole,
        getRoleById,
        getRoleSummary
    }
} 