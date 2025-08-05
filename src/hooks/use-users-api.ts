import { useState, useEffect, useCallback } from "react"
import { UsersAPI } from "@/services"
import { User } from "@/types/user/user"

export function useUsersAPI() {
    const [ users, setUsers ] = useState<User[]>([])
    const [ isLoading, setIsLoading ] = useState(false)
    const [ summary, setSummary ] = useState<any>(null)

    const loadUsers = useCallback(async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        roleId?: number;
    }) => {
        setIsLoading(true)
        try {
            const response = await UsersAPI.getAll(params)
            setUsers(response.data)
            return response
        } catch (error) {
            console.error("Error loading users:", error)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getUserById = useCallback(async (id: number): Promise<User> => {
        try {
            const response = await UsersAPI.getById(id)
            return response
        } catch (error) {
            console.error("Error fetching user:", error)
            throw error
        }
    }, [])

    const createUser = useCallback(async (data: any): Promise<User> => {
        try {
            const response = await UsersAPI.create(data)
            await loadUsers()
            return response
        } catch (error) {
            console.error("Error creating user:", error)
            throw error
        }
    }, [ loadUsers ])

    const updateUser = useCallback(async (id: number, data: any): Promise<User> => {
        try {
            const response = await UsersAPI.update(id, data)
            await loadUsers()
            return response
        } catch (error) {
            console.error("Error updating user:", error)
            throw error
        }
    }, [ loadUsers ])

    const deleteUser = useCallback(async (id: number): Promise<void> => {
        try {
            await UsersAPI.delete(id)
            await loadUsers()
        } catch (error) {
            console.error("Error deleting user:", error)
            throw error
        }
    }, [ loadUsers ])

    const getActiveUsers = useCallback(async (): Promise<User[]> => {
        try {
            const response = await UsersAPI.getActive()
            return response
        } catch (error) {
            console.error("Error fetching active users:", error)
            throw error
        }
    }, [])

    const getSummary = useCallback(async () => {
        try {
            const response = await UsersAPI.getSummary()
            setSummary(response)
            return response
        } catch (error) {
            console.error("Error fetching user summary:", error)
            throw error
        }
    }, [])

    const filterUsers = useCallback(async (filters: any): Promise<User[]> => {
        try {
            const response = await UsersAPI.filter(filters)
            return response
        } catch (error) {
            console.error("Error filtering users:", error)
            throw error
        }
    }, [])

    const toggleActive = useCallback(async (id: number): Promise<User> => {
        try {
            const response = await UsersAPI.toggleActive(id)
            await loadUsers()
            return response
        } catch (error) {
            console.error("Error toggling user active status:", error)
            throw error
        }
    }, [ loadUsers ])

    const searchByName = useCallback(async (name: string): Promise<User[]> => {
        try {
            const response = await UsersAPI.searchByName(name)
            return response
        } catch (error) {
            console.error("Error searching user by name:", error)
            throw error
        }
    }, [])

    const searchByEmail = useCallback(async (email: string): Promise<User[]> => {
        try {
            const response = await UsersAPI.searchByEmail(email)
            return response
        } catch (error) {
            console.error("Error searching user by email:", error)
            throw error
        }
    }, [])

    const getWithRole = useCallback(async (id: number) => {
        try {
            const response = await UsersAPI.getWithRole(id)
            return response
        } catch (error) {
            console.error("Error fetching user with role:", error)
            throw error
        }
    }, [])

    const getWithRoles = useCallback(async () => {
        try {
            const response = await UsersAPI.getWithRoles()
            return response
        } catch (error) {
            console.error("Error fetching users with roles:", error)
            throw error
        }
    }, [])

    const getByRole = useCallback(async (roleId: number): Promise<User[]> => {
        try {
            const response = await UsersAPI.getByRole(roleId)
            return response
        } catch (error) {
            console.error("Error fetching users by role:", error)
            throw error
        }
    }, [])

    const getStatistics = useCallback(async () => {
        try {
            const response = await UsersAPI.getStatistics()
            return response
        } catch (error) {
            console.error("Error fetching user statistics:", error)
            throw error
        }
    }, [])

    const changePassword = useCallback(async (id: number, newPassword: string): Promise<User> => {
        try {
            const response = await UsersAPI.changePassword(id, newPassword)
            await loadUsers()
            return response
        } catch (error) {
            console.error("Error changing user password:", error)
            throw error
        }
    }, [ loadUsers ])

    const assignRole = useCallback(async (id: number, roleId: number): Promise<User> => {
        try {
            const response = await UsersAPI.assignRole(id, roleId)
            await loadUsers()
            return response
        } catch (error) {
            console.error("Error assigning role to user:", error)
            throw error
        }
    }, [ loadUsers ])

    const validateEmail = useCallback(async (email: string) => {
        try {
            const response = await UsersAPI.validateEmail(email)
            return response
        } catch (error) {
            console.error("Error validating user email:", error)
            throw error
        }
    }, [])

    const getProfile = useCallback(async (): Promise<User> => {
        try {
            const response = await UsersAPI.getProfile()
            return response
        } catch (error) {
            console.error("Error fetching user profile:", error)
            throw error
        }
    }, [])

    const updateProfile = useCallback(async (data: any): Promise<User> => {
        try {
            const response = await UsersAPI.updateProfile(data)
            await loadUsers()
            return response
        } catch (error) {
            console.error("Error updating user profile:", error)
            throw error
        }
    }, [ loadUsers ])

    useEffect(() => {
        loadUsers()
        getSummary()
    }, [ loadUsers, getSummary ])

    return {
        users,
        isLoading,
        summary,
        loadUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        getActiveUsers,
        getSummary,
        filterUsers,
        toggleActive,
        searchByName,
        searchByEmail,
        getWithRole,
        getWithRoles,
        getByRole,
        getStatistics,
        changePassword,
        assignRole,
        validateEmail,
        getProfile,
        updateProfile
    }
} 