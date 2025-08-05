import { useState, useEffect } from "react"
import { Permission } from "@/types/permissions/permission"
import { api } from "@/lib/axios"
import { useAuth } from "@/contexts/AuthContext"

function mapPermissionFromApi(apiPermission: any): Permission {
    return {
        id: apiPermission.id,
        name: apiPermission.name,
        routeCode: apiPermission.routeCode,
        actions: apiPermission.actions || [],
        restrictions: apiPermission.restrictions || [],
        isSubRoute: apiPermission.isSubRoute,
        created_at: new Date(apiPermission.created_at),
        updated_at: new Date(apiPermission.updated_at),
    }
}

export function usePermissions() {
    const [ permissions, setPermissions ] = useState<Permission[]>([])
    const [ isLoading, setIsLoading ] = useState(true)
    const [ error, setError ] = useState<string | null>(null)
    const { user } = useAuth()

    const fetchPermissions = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await api.get("/permissions")
            setPermissions(response.data.map(mapPermissionFromApi))
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al cargar permisos")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchPermissions()
        }
    }, [ user ])

    return {
        permissions,
        isLoading,
        error,
        refetch: fetchPermissions
    }
} 