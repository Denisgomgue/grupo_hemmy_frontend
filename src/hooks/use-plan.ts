import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { Plan } from "@/types/plans/plan"

let planList: Plan[] = []
let listeners: Array<() => void> = []

const notifyListeners = () => {
    listeners.forEach((listener) => listener())
}

export function usePlans() {
    const [plans, setPlans] = useState<Plan[]>(planList)

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
        const listener = () => setPlans([...planList])
        listeners.push(listener)

        return () => {
            listeners = listeners.filter((l) => l !== listener)
        }
    }, [])

    return { plans, refreshPlans }
}