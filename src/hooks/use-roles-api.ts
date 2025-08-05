import { useState, useEffect, useCallback } from "react"
import { RolesAPI } from "@/services"
import { Role } from "@/types/roles/role"

export function useRolesAPI() {
    const [ roles, setRoles ] = useState<Role[]>([])
    const [ isLoading, setIsLoading ] = useState(false)
    const [ summary, setSummary ] = useState<any>(null)

    const loadRoles = useCallback(async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
    }) => {
        setIsLoading(true)
        try {
            const response = await RolesAPI.getAll(params)
            setRoles(response.data)
            return response
        } catch (error) {
            console.error("Error loading roles:", error)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getRoleById = useCallback(async (id: number): Promise<Role> => {
        try {
            const response = await RolesAPI.getById(id)
            return response
        } catch (error) {
            console.error("Error fetching role:", error)
            throw error
        }
    }, [])

    const createRole = useCallback(async (data: any): Promise<Role> => {
        try {
            const response = await RolesAPI.create(data)
            await loadRoles()
            return response
        } catch (error) {
            console.error("Error creating role:", error)
            throw error
        }
    }, [ loadRoles ])

    const updateRole = useCallback(async (id: number, data: any): Promise<Role> => {
        try {
            const response = await RolesAPI.update(id, data)
            await loadRoles()
            return response
        } catch (error) {
            console.error("Error updating role:", error)
            throw error
        }
    }, [ loadRoles ])

    const deleteRole = useCallback(async (id: number): Promise<void> => {
        try {
            await RolesAPI.delete(id)
            await loadRoles()
        } catch (error) {
            console.error("Error deleting role:", error)
            throw error
        }
    }, [ loadRoles ])

    const getActiveRoles = useCallback(async (): Promise<Role[]> => {
        try {
            const response = await RolesAPI.getActive()
            return response
        } catch (error) {
            console.error("Error fetching active roles:", error)
            throw error
        }
    }, [])

    const getSummary = useCallback(async () => {
        try {
            const response = await RolesAPI.getSummary()
            setSummary(response)
            return response
        } catch (error) {
            console.error("Error fetching role summary:", error)
            throw error
        }
    }, [])

    const filterRoles = useCallback(async (filters: any): Promise<Role[]> => {
        try {
            const response = await RolesAPI.filter(filters)
            return response
        } catch (error) {
            console.error("Error filtering roles:", error)
            throw error
        }
    }, [])

    const toggleActive = useCallback(async (id: number): Promise<Role> => {
        try {
            const response = await RolesAPI.toggleActive(id)
            await loadRoles()
            return response
        } catch (error) {
            console.error("Error toggling role active status:", error)
            throw error
        }
    }, [ loadRoles ])

    const searchByName = useCallback(async (name: string): Promise<Role[]> => {
        try {
            const response = await RolesAPI.searchByName(name)
            return response
        } catch (error) {
            console.error("Error searching role by name:", error)
            throw error
        }
    }, [])

    const getWithPermissions = useCallback(async (id: number) => {
        try {
            const response = await RolesAPI.getWithPermissions(id)
            return response
        } catch (error) {
            console.error("Error fetching role with permissions:", error)
            throw error
        }
    }, [])

    const getWithUserStats = useCallback(async () => {
        try {
            const response = await RolesAPI.getWithUserStats()
            return response
        } catch (error) {
            console.error("Error fetching roles with user stats:", error)
            throw error
        }
    }, [])

    const getStatistics = useCallback(async () => {
        try {
            const response = await RolesAPI.getStatistics()
            return response
        } catch (error) {
            console.error("Error fetching role statistics:", error)
            throw error
        }
    }, [])

    const assignPermissions = useCallback(async (id: number, permissionIds: number[]): Promise<Role> => {
        try {
            const response = await RolesAPI.assignPermissions(id, permissionIds)
            await loadRoles()
            return response
        } catch (error) {
            console.error("Error assigning permissions to role:", error)
            throw error
        }
    }, [ loadRoles ])

    const removePermissions = useCallback(async (id: number, permissionIds: number[]): Promise<Role> => {
        try {
            const response = await RolesAPI.removePermissions(id, permissionIds)
            await loadRoles()
            return response
        } catch (error) {
            console.error("Error removing permissions from role:", error)
            throw error
        }
    }, [ loadRoles ])

    const getWithUsers = useCallback(async (): Promise<Role[]> => {
        try {
            const response = await RolesAPI.getWithUsers()
            return response
        } catch (error) {
            console.error("Error fetching roles with users:", error)
            throw error
        }
    }, [])

    const duplicateRole = useCallback(async (id: number, newName: string): Promise<Role> => {
        try {
            const response = await RolesAPI.duplicate(id, newName)
            await loadRoles()
            return response
        } catch (error) {
            console.error("Error duplicating role:", error)
            throw error
        }
    }, [ loadRoles ])

    useEffect(() => {
        loadRoles()
        getSummary()
    }, [ loadRoles, getSummary ])

    return {
        roles,
        isLoading,
        summary,
        loadRoles,
        getRoleById,
        createRole,
        updateRole,
        deleteRole,
        getActiveRoles,
        getSummary,
        filterRoles,
        toggleActive,
        searchByName,
        getWithPermissions,
        getWithUserStats,
        getStatistics,
        assignPermissions,
        removePermissions,
        getWithUsers,
        duplicateRole
    }
} 