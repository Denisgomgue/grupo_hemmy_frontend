import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { Sector } from "@/types/sectors/sector"

let sectorList: Sector[] = []
let listeners: Array<() => void> = []

const notifyListeners = () => {
    listeners.forEach((listener) => listener())
}

export function useSectors() {
    const [sectors, setSectors] = useState<Sector[]>(sectorList)

    const refreshSector = useCallback(async (page: number = 1, pageSize: number = 10) => {
        try {
            const response = await api.get<Sector[]>("/sectors", {
                params: {
                    page,
                    pageSize
                }
            })
            sectorList = response.data 
            notifyListeners()
            return { data: sectorList, total: sectorList.length }
        } catch (error) {
            console.error("Error fetching sectors:", error)
            return { data: [], total: 0 }
        }
    }, [])

    useEffect(() => {
        const listener = () => setSectors([...sectorList])
        listeners.push(listener)

        return () => {
            listeners = listeners.filter((l) => l !== listener)
        }
    }, [])

    return { sectors, refreshSector }
}