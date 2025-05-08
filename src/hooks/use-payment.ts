import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { Plan } from "@/types/plans/plan"
import { Payment } from "@/types/payments/payment"

let paymentList: Payment[] = []
let listeners: Array<() => void> = []

const notifyListeners = () => {
    listeners.forEach((listener) => listener())
}

export function usePayments() {
    const [payments, setPayments] = useState<Payment[]>(paymentList)

    const refreshPayments = useCallback(async (page: number = 1, pageSize: number = 10, status?: string, search?: string) => {
        try {
            const params: Record<string, any> = {
                page,
                pageSize,
            }
            if (status && status !== "ALL") {
                params.status = status
            }
            if (search) {
                params.search = search
            }
            const response = await api.get<Payment[]>("/payments", {
                params
            })
            paymentList = response.data 
            notifyListeners()
            return { data: paymentList, total: paymentList.length }
        } catch (error) {
            console.error("Error fetching payments:", error)
            return { data: [], total: 0 }
        }
    }, [])

    useEffect(() => {
        const listener = () => setPayments([...paymentList])
        listeners.push(listener)

        return () => {
            listeners = listeners.filter((l) => l !== listener)
        }
    }, [])

    return { payments, refreshPayments }
}