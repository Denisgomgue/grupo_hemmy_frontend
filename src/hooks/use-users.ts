import { useState, useEffect } from "react"
import { User, CreateUserData, UpdateUserData, UserSummary } from "@/types/users/user"
import { api } from "@/lib/axios"
import { useAuth } from "@/contexts/AuthContext"

function mapUserFromApi(apiUser: any): User {
    return {
        id: apiUser.id,
        name: apiUser.name,
        surname: apiUser.surname,
        documentType: apiUser.documentType,
        documentNumber: apiUser.documentNumber,
        username: apiUser.username,
        email: apiUser.email,
        phone: apiUser.phone,
        password: apiUser.password,
        isActive: apiUser.isActive,
        role: apiUser.role ? {
            id: apiUser.role.id,
            name: apiUser.role.name,
            description: apiUser.role.description,
            allowAll: apiUser.role.allowAll,
            isPublic: apiUser.role.isPublic,
            role_has_permissions: apiUser.role.role_has_permissions?.map((rhp: any) => ({
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
            created_at: apiUser.role.created_at ? new Date(apiUser.role.created_at) : new Date(),
            updated_at: apiUser.role.updated_at ? new Date(apiUser.role.updated_at) : new Date(),
        } : undefined,
        created_at: apiUser.created_at ? new Date(apiUser.created_at) : new Date(),
        updated_at: apiUser.updated_at ? new Date(apiUser.updated_at) : new Date(),
    }
}

export function useUsers() {
    const [ users, setUsers ] = useState<User[]>([])
    const [ isLoading, setIsLoading ] = useState(true)
    const [ error, setError ] = useState<string | null>(null)
    const { user } = useAuth()

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await api.get("/user")
            setUsers(response.data.map(mapUserFromApi))
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al cargar usuarios")
        } finally {
            setIsLoading(false)
        }
    }

    const createUser = async (userData: any): Promise<User> => {
        try {
            // Convertir roleId de string a number si existe
            const dataToSend = {
                ...userData,
                roleId: userData.roleId ? parseInt(userData.roleId, 10) : undefined
            }
            const response = await api.post("/user", dataToSend)
            await fetchUsers()
            return mapUserFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al crear usuario")
        }
    }

    const updateUser = async (id: number, userData: any): Promise<User> => {
        try {
            // Convertir roleId de string a number si existe
            const dataToSend = {
                ...userData,
                roleId: userData.roleId ? parseInt(userData.roleId, 10) : undefined
            }
            const response = await api.patch(`/user/${id}`, dataToSend)
            await fetchUsers()
            return mapUserFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al actualizar usuario")
        }
    }

    const deleteUser = async (id: number): Promise<void> => {
        try {
            await api.delete(`/user/${id}`)
            await fetchUsers()
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al eliminar usuario")
        }
    }

    const getUserById = async (id: number): Promise<User> => {
        try {
            const response = await api.get(`/user/${id}`)
            return mapUserFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al obtener usuario")
        }
    }

    const getUserSummary = async (): Promise<UserSummary> => {
        try {
            const response = await api.get("/user/summary")
            return response.data
        } catch (err: any) {
            console.error("Error fetching user summary:", err)
            // Retornar datos por defecto si falla
            return {
                total: 0,
                active: 0,
                inactive: 0,
                withRole: 0,
                withoutRole: 0,
                verified: 0,
                unverified: 0
            }
        }
    }

    const assignRole = async (userId: number, roleId: number): Promise<void> => {
        try {
            await api.post(`/user/${userId}/role/${roleId}`)
            await fetchUsers()
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al asignar rol")
        }
    }

    const changePassword = async (userId: number, currentPassword: string, newPassword: string): Promise<void> => {
        try {
            await api.patch(`/user/${userId}/change-password`, {
                currentPassword,
                newPassword
            })
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al cambiar contraseña")
        }
    }

    useEffect(() => {
        if (user) {
            fetchUsers()
        }
    }, [ user ])

    return {
        users,
        isLoading,
        error,
        refetch: fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        getUserById,
        getUserSummary,
        assignRole,
        changePassword
    }
} 