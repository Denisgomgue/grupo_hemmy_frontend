import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { Plan } from "@/types/plans/plan"

let planList: Plan[] = []
let listeners: Array<() => void> = []

const notifyListeners = () => {
    listeners.forEach((listener) => listener())
}

export function usePlans() {
    const [ plans, setPlans ] = useState<Plan[]>(planList)
    const [ maxPrice, setMaxPrice ] = useState<number>(0)

    const getMaxPrice = useCallback(async () => {
        try {
            const response = await api.get<number>("/plans/max-price")
            setMaxPrice(response.data)
            return response.data
        } catch (error) {
            console.error("Error fetching max price:", error)
            return 0
        }
    }, [])

    const refreshPlans = useCallback(async (page: number = 1, pageSize: number = 10) => {
        try {
            const response = await api.get<Plan[]>("/plans", {
                params: {
                    page,
                    pageSize
                }
            })
            planList = response.data
            notifyListeners()
            return { data: planList, total: planList.length }
        } catch (error) {
            console.error("Error fetching plans:", error)
            return { data: [], total: 0 }
        }
    }, [])

    useEffect(() => {
        const listener = () => setPlans([ ...planList ])
        listeners.push(listener)
        getMaxPrice() // Obtener el precio máximo al montar el componente

        return () => {
            listeners = listeners.filter((l) => l !== listener)
        }
    }, [ getMaxPrice ])

    return { plans, refreshPlans, maxPrice, getMaxPrice }
}