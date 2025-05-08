import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { Client } from "@/types/clients/client"

let clientList: Client[] = []
let listeners: Array<() => void> = []

const notifyListeners = () => {
    listeners.forEach((listener) => listener())
}

export function useClient() {
    const [client, setClient] = useState<Client[]>(clientList)

    const refreshClient = useCallback(async (page: number = 1, pageSize: number = 10) => {
        try {
            const response = await api.get<Client[]>("/client", {
                params: {
                    page,
                    pageSize
                }
            })
            clientList = response.data
            notifyListeners()
            return { data: clientList, total: clientList.length }
        } catch (error) {
            console.error("Error fetching clients:", error)
            return { data: [], total: 0 }
        }
    }, [])

    useEffect(() => {
        const listener = () => setClient([...clientList])
        listeners.push(listener)

        return () => {
            listeners = listeners.filter((l) => l !== listener)
        }
    }, [])

    return { client, refreshClient }
}