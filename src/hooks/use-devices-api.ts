import { useState, useEffect, useCallback } from "react"
import { DevicesAPI } from "@/services"
import { Device, DeviceStatus, DeviceType, DeviceUseType } from "@/types/devices/device"

export function useDevicesAPI() {
    const [ devices, setDevices ] = useState<Device[]>([])
    const [ isLoading, setIsLoading ] = useState(false)
    const [ summary, setSummary ] = useState<any>(null)

    const loadDevices = useCallback(async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: DeviceStatus;
        type?: DeviceType;
        useType?: DeviceUseType;
    }) => {
        setIsLoading(true)
        try {
            const response = await DevicesAPI.getPaginated(params)
            setDevices(response.data)
            return response
        } catch (error) {
            console.error("Error loading devices:", error)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getDeviceById = useCallback(async (id: number): Promise<Device> => {
        try {
            const response = await DevicesAPI.getById(id)
            return response
        } catch (error) {
            console.error("Error fetching device:", error)
            throw error
        }
    }, [])

    const createDevice = useCallback(async (data: any): Promise<Device> => {
        try {
            const response = await DevicesAPI.create(data)
            await loadDevices()
            return response
        } catch (error) {
            console.error("Error creating device:", error)
            throw error
        }
    }, [ loadDevices ])

    const updateDevice = useCallback(async (id: number, data: any): Promise<Device> => {
        try {
            const response = await DevicesAPI.update(id, data)
            await loadDevices()
            return response
        } catch (error) {
            console.error("Error updating device:", error)
            throw error
        }
    }, [ loadDevices ])

    const deleteDevice = useCallback(async (id: number): Promise<void> => {
        try {
            await DevicesAPI.delete(id)
            await loadDevices()
        } catch (error) {
            console.error("Error deleting device:", error)
            throw error
        }
    }, [ loadDevices ])

    const getDevicesByClient = useCallback(async (clientId: number): Promise<Device[]> => {
        try {
            const response = await DevicesAPI.getByClient(clientId)
            return response
        } catch (error) {
            console.error("Error fetching client devices:", error)
            throw error
        }
    }, [])

    const getDevicesByEmployee = useCallback(async (employeeId: number): Promise<Device[]> => {
        try {
            const response = await DevicesAPI.getByEmployee(employeeId)
            return response
        } catch (error) {
            console.error("Error fetching employee devices:", error)
            throw error
        }
    }, [])

    const getSummary = useCallback(async () => {
        try {
            const response = await DevicesAPI.getSummary()
            setSummary(response)
            return response
        } catch (error) {
            console.error("Error fetching device summary:", error)
            throw error
        }
    }, [])

    const updateStatus = useCallback(async (id: number, status: DeviceStatus): Promise<Device> => {
        try {
            const response = await DevicesAPI.updateStatus(id, status)
            await loadDevices()
            return response
        } catch (error) {
            console.error("Error updating device status:", error)
            throw error
        }
    }, [ loadDevices ])

    const assignToClient = useCallback(async (id: number, clientId: number): Promise<Device> => {
        try {
            const response = await DevicesAPI.assignToClient(id, clientId)
            await loadDevices()
            return response
        } catch (error) {
            console.error("Error assigning device to client:", error)
            throw error
        }
    }, [ loadDevices ])

    const assignToEmployee = useCallback(async (id: number, employeeId: number): Promise<Device> => {
        try {
            const response = await DevicesAPI.assignToEmployee(id, employeeId)
            await loadDevices()
            return response
        } catch (error) {
            console.error("Error assigning device to employee:", error)
            throw error
        }
    }, [ loadDevices ])

    const unassign = useCallback(async (id: number): Promise<Device> => {
        try {
            const response = await DevicesAPI.unassign(id)
            await loadDevices()
            return response
        } catch (error) {
            console.error("Error unassigning device:", error)
            throw error
        }
    }, [ loadDevices ])

    const getAvailable = useCallback(async (): Promise<Device[]> => {
        try {
            const response = await DevicesAPI.getAvailable()
            return response
        } catch (error) {
            console.error("Error fetching available devices:", error)
            throw error
        }
    }, [])

    const filterDevices = useCallback(async (filters: any): Promise<Device[]> => {
        try {
            const response = await DevicesAPI.filter(filters)
            return response
        } catch (error) {
            console.error("Error filtering devices:", error)
            throw error
        }
    }, [])

    useEffect(() => {
        loadDevices()
        getSummary()
    }, [ loadDevices, getSummary ])

    return {
        devices,
        isLoading,
        summary,
        loadDevices,
        getDeviceById,
        createDevice,
        updateDevice,
        deleteDevice,
        getDevicesByClient,
        getDevicesByEmployee,
        getSummary,
        updateStatus,
        assignToClient,
        assignToEmployee,
        unassign,
        getAvailable,
        filterDevices
    }
} 