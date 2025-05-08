import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"

import { Service } from "@/types/services/service"

let serviceList: Service[] = []
let listeners: Array<() => void> = []

const notifyListeners = () => {
    listeners.forEach((listener) => listener())
}

export function useServices() {
    const [services, setServices] = useState<Service[]>(serviceList)

    const refreshService = useCallback(async (page: number = 1, pageSize: number = 10) => {
        try {
            const response = await api.get<Service[]>("/services", {
                params: {
                    page,
                    pageSize
                }
            })
            serviceList = response.data 
            notifyListeners()
            return { data: serviceList, total: serviceList.length }
        } catch (error) {
            console.error("Error fetching services:", error)
            return { data: [], total: 0 }
        }
    }, [])

    useEffect(() => {
        const listener = () => setServices([...serviceList])
        listeners.push(listener)

        return () => {
            listeners = listeners.filter((l) => l !== listener)
        }
    }, [])

    return { services, refreshService }
}