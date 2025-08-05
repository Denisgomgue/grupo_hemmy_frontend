import { useState, useEffect } from "react"
import { Device, DeviceType, DeviceStatus, DeviceUseType } from "@/types/devices/device"
import { api } from "@/lib/axios"
import { useAuth } from "@/contexts/AuthContext"

function mapDeviceFromApi(apiDevice: any): Device {
    return {
        id: apiDevice.id,
        serialNumber: apiDevice.serialNumber,
        macAddress: apiDevice.macAddress,
        type: apiDevice.type,
        brand: apiDevice.brand,
        model: apiDevice.model,
        status: apiDevice.status,
        assignedDate: apiDevice.assignedDate ? new Date(apiDevice.assignedDate) : undefined,
        useType: apiDevice.useType,
        assignedInstallationId: apiDevice.assignedInstallationId,
        assignedEmployeeId: apiDevice.assignedEmployeeId,
        assignedClientId: apiDevice.assignedClientId,
        notes: apiDevice.notes,
        created_at: new Date(apiDevice.created_at),
        updated_at: new Date(apiDevice.updated_at),
        // Relaciones
        installation: apiDevice.installation,
        employee: apiDevice.employee,
        client: apiDevice.client,
    }
}

export function useDevices() {
    const [ devices, setDevices ] = useState<Device[]>([])
    const [ isLoading, setIsLoading ] = useState(true)
    const [ error, setError ] = useState<string | null>(null)
    const { user } = useAuth()

    const fetchDevices = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await api.get("/devices")
            setDevices(response.data.map(mapDeviceFromApi))
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al cargar dispositivos")
        } finally {
            setIsLoading(false)
        }
    }

    const createDevice = async (deviceData: any): Promise<Device> => {
        try {
            const response = await api.post("/devices", deviceData)
            await fetchDevices()
            return mapDeviceFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al crear dispositivo")
        }
    }

    const updateDevice = async (id: number, deviceData: any): Promise<Device> => {
        try {
            const response = await api.patch(`/devices/${id}`, deviceData)
            await fetchDevices()
            return mapDeviceFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al actualizar dispositivo")
        }
    }

    const deleteDevice = async (id: number): Promise<void> => {
        try {
            await api.delete(`/devices/${id}`)
            await fetchDevices()
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al eliminar dispositivo")
        }
    }

    const getDeviceById = async (id: number): Promise<Device> => {
        try {
            const response = await api.get(`/devices/${id}`)
            return mapDeviceFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al obtener dispositivo")
        }
    }

    const getDevicesByClient = async (clientId: number): Promise<Device[]> => {
        try {
            const response = await api.get(`/devices/client/${clientId}`)
            return response.data.map(mapDeviceFromApi)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al obtener dispositivos del cliente")
        }
    }

    const filterDevices = async (filters: {
        status?: DeviceStatus;
        type?: DeviceType;
        useType?: DeviceUseType;
        assignedClientId?: number;
        assignedEmployeeId?: number;
    }): Promise<Device[]> => {
        try {
            const response = await api.get("/devices/filter", { params: filters })
            return response.data.map(mapDeviceFromApi)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al filtrar dispositivos")
        }
    }

    const getDeviceSummary = async () => {
        try {
            const response = await api.get("/devices/summary")
            return response.data
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al obtener resumen de dispositivos")
        }
    }

    const updateDeviceStatus = async (id: number, status: DeviceStatus): Promise<Device> => {
        try {
            const response = await api.patch(`/devices/${id}/status`, { status })
            await fetchDevices()
            return mapDeviceFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al actualizar estado del dispositivo")
        }
    }

    useEffect(() => {
        if (user) {
            fetchDevices()
        }
    }, [ user ])

    return {
        devices,
        isLoading,
        error,
        refetch: fetchDevices,
        createDevice,
        updateDevice,
        deleteDevice,
        getDeviceById,
        getDevicesByClient,
        filterDevices,
        getDeviceSummary,
        updateDeviceStatus
    }
} 