import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { Payment } from "@/types/payments/payment"

let paymentList: Payment[] = []
let totalRecords = 0
let listeners: Array<() => void> = []

const notifyListeners = () => {
    listeners.forEach((listener) => listener())
}

export function usePayments() {
    const [ payments, setPayments ] = useState<Payment[]>(paymentList)

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

            // Asumiendo que la respuesta del backend tiene un formato { data: Payment[], total: number }
            // Si el backend devuelve directamente un array, ajusta esto
            if (Array.isArray(response.data)) {
                paymentList = response.data
                totalRecords = response.data.length
            } else if (response.data && typeof response.data === 'object') {
                const data = response.data as any
                if ('data' in data && 'total' in data) {
                    paymentList = data.data
                    totalRecords = data.total
                } else {
                    paymentList = response.data as unknown as Payment[]
                    totalRecords = paymentList.length
                }
            } else {
                paymentList = response.data as unknown as Payment[]
                totalRecords = paymentList.length
            }

            notifyListeners()
            return { data: paymentList, total: totalRecords }
        } catch (error) {
            console.error("Error fetching payments:", error)
            return { data: [], total: 0 }
        }
    }, [])

    const regeneratePaymentCodes = useCallback(async () => {
        try {
            const response = await api.post('/payments/regenerate-codes')
            return response.data
        } catch (error) {
            console.error("Error regenerating payment codes:", error)
            throw error
        }
    }, [])

    const createPayment = useCallback(async (paymentData: any) => {
        try {
            // Asegurar que discount sea siempre un número
            const sanitizedData = {
                ...paymentData,
                discount: typeof paymentData.discount === 'number' ?
                    paymentData.discount :
                    paymentData.discount === "" || paymentData.discount === null || paymentData.discount === undefined ?
                        0 :
                        Number(paymentData.discount)
            };

            const response = await api.post("/payments", sanitizedData)
            await refreshPayments()
            return response.data
        } catch (error) {
            console.error("Error creating payment:", error)
            throw error
        }
    }, [ refreshPayments ])

    const updatePayment = useCallback(async (id: number, paymentData: any) => {
        try {
            // Asegurar que discount sea siempre un número
            const sanitizedData = {
                ...paymentData,
                discount: typeof paymentData.discount === 'number' ?
                    paymentData.discount :
                    paymentData.discount === "" || paymentData.discount === null || paymentData.discount === undefined ?
                        0 :
                        Number(paymentData.discount)
            };

            const response = await api.patch(`/payments/${id}`, sanitizedData)
            await refreshPayments()
            return response.data
        } catch (error) {
            console.error("Error updating payment:", error)
            throw error
        }
    }, [ refreshPayments ])

    const deletePayment = useCallback(async (id: number) => {
        try {
            const response = await api.delete(`/payments/${id}`)
            await refreshPayments()
            return response.data
        } catch (error) {
            console.error("Error deleting payment:", error)
            throw error
        }
    }, [ refreshPayments ])

    const getPaymentSummary = useCallback(async (period: string = 'thisMonth') => {
        try {
            const response = await api.get("/payments/summary", {
                params: { period }
            })
            return response.data
        } catch (error) {
            console.error("Error fetching payment summary:", error)
            return {
                totalRecaudado: 0,
                pagosPagados: 0,
                pagosPendientes: 0,
                pagosAtrasados: 0
            }
        }
    }, [])

    useEffect(() => {
        const listener = () => setPayments([ ...paymentList ])
        listeners.push(listener)

        return () => {
            listeners = listeners.filter((l) => l !== listener)
        }
    }, [])

    return {
        payments,
        refreshPayments,
        regeneratePaymentCodes,
        createPayment,
        updatePayment,
        deletePayment,
        getPaymentSummary
    }
}