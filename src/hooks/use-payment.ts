import { useState, useEffect, useCallback } from "react"
import { PaymentsAPI } from "@/services"
import { Payment, PaymentStatus, PaymentType } from "@/types/payments/payment"

let paymentList: Payment[] = []
let totalRecords = 0
let listeners: Array<() => void> = []

const notifyListeners = () => {
    listeners.forEach((listener) => listener())
}

function mapPaymentFromApi(apiPayment: any): Payment {
    return {
        id: apiPayment.id,
        code: apiPayment.code,
        paymentDate: apiPayment.paymentDate,
        reference: apiPayment.reference,
        reconnection: apiPayment.reconnection,
        amount: apiPayment.amount,
        baseAmount: apiPayment.baseAmount,
        reconnectionFee: apiPayment.reconnectionFee,
        status: apiPayment.status, // Cambiado de 'state' a 'status'
        paymentType: apiPayment.paymentType,
        transfername: apiPayment.transfername, // Cambiado de 'transferName' a 'transfername'
        discount: apiPayment.discount || 0,
        dueDate: apiPayment.dueDate,
        isVoided: apiPayment.isVoided || false,
        voidedAt: apiPayment.voidedAt,
        voidedReason: apiPayment.voidedReason,
        engagementDate: apiPayment.engagementDate,
        client: apiPayment.client,
        clientId: apiPayment.clientId || apiPayment.client?.id,
        advancePayment: apiPayment.advancePayment,
        created_at: new Date(apiPayment.created_at),
        updated_at: new Date(apiPayment.updated_at),
        stateInSpanish: apiPayment.stateInSpanish, // Campo adicional del backend
    }
}

export function usePayments() {
    const [ payments, setPayments ] = useState<Payment[]>(paymentList)

    const refreshPayments = useCallback(async (
        page: number = 1,
        pageSize: number = 10,
        status?: PaymentStatus,
        search?: string
    ) => {
        try {
            const params: Record<string, any> = {
                page,
                pageSize,
            }
            if (status && status !== PaymentStatus.PENDING) {
                params.status = status
            }
            if (search) {
                params.search = search
            }

            const response = await PaymentsAPI.getAll(params)

            // Mapear los datos de la respuesta
            if (Array.isArray(response.data)) {
                paymentList = response.data.map(mapPaymentFromApi)
                totalRecords = response.total
            } else {
                paymentList = [ mapPaymentFromApi(response.data) ]
                totalRecords = 1
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
            const response = await PaymentsAPI.regenerateCodes()
            return response
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
                client: paymentData.clientId, // Mapear clientId a client para el backend
                discount: typeof paymentData.discount === 'number' ?
                    paymentData.discount :
                    paymentData.discount === "" || paymentData.discount === null || paymentData.discount === undefined ?
                        0 :
                        Number(paymentData.discount)
            };

            // Log removido para limpieza
            const response = await PaymentsAPI.create(sanitizedData)
            await refreshPayments()
            return mapPaymentFromApi(response)
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
                client: paymentData.clientId, // Mapear clientId a client para el backend
                discount: typeof paymentData.discount === 'number' ?
                    paymentData.discount :
                    paymentData.discount === "" || paymentData.discount === null || paymentData.discount === undefined ?
                        0 :
                        Number(paymentData.discount)
            };

            const response = await PaymentsAPI.update(id, sanitizedData)
            await refreshPayments()
            return mapPaymentFromApi(response)
        } catch (error) {
            console.error("Error updating payment:", error)
            throw error
        }
    }, [ refreshPayments ])

    const deletePayment = useCallback(async (id: number) => {
        try {
            await PaymentsAPI.delete(id)
            await refreshPayments()
        } catch (error) {
            console.error("Error deleting payment:", error)
            throw error
        }
    }, [ refreshPayments ])

    const getPaymentById = useCallback(async (id: number): Promise<Payment> => {
        try {
            const response = await PaymentsAPI.getById(id)
            return mapPaymentFromApi(response)
        } catch (error) {
            console.error("Error fetching payment:", error)
            throw error
        }
    }, [])

    const getPaymentsByClient = useCallback(async (clientId: number): Promise<Payment[]> => {
        try {
            const response = await PaymentsAPI.getByClient(clientId)
            return response.map(mapPaymentFromApi)
        } catch (error) {
            console.error("Error fetching client payments:", error)
            throw error
        }
    }, [])

    const getPaymentSummary = useCallback(async (period: string = 'thisMonth') => {
        try {
            const response = await PaymentsAPI.getSummary(period)
            return response
        } catch (error) {
            console.error("Error fetching payment summary:", error)
            return {
                totalRecaudado: 0,
                pagosPagados: 0,
                pagosPendientes: 0,
                pagosAtrasados: 0,
                pagosAnulados: 0,
                periodoUtilizado: 0 // Cambiado de period (string) a number
            }
        }
    }, [])

    const createAdvancePayment = useCallback(async (data: { clientId: number; amount: number }) => {
        try {
            const response = await PaymentsAPI.createAdvancePayment(data)
            await refreshPayments()
            return mapPaymentFromApi(response)
        } catch (error) {
            console.error("Error creating advance payment:", error)
            throw error
        }
    }, [ refreshPayments ])

    const getNextPaymentDate = useCallback(async (clientId: number) => {
        try {
            const response = await PaymentsAPI.getNextPaymentDate(clientId)
            return response
        } catch (error) {
            console.error("Error fetching next payment date:", error)
            throw error
        }
    }, [])

    const recalculateStates = useCallback(async () => {
        try {
            const response = await PaymentsAPI.recalculateStates()
            return response
        } catch (error) {
            console.error("Error recalculating states:", error)
            throw error
        }
    }, [])

    const getPaymentBreakdown = useCallback(async (id: number) => {
        try {
            const response = await PaymentsAPI.getPaymentBreakdown(id)
            return response
        } catch (error) {
            console.error("Error fetching payment breakdown:", error)
            throw error
        }
    }, [])

    useEffect(() => {
        const listener = () => setPayments([ ...paymentList ])
        listeners.push(listener)

        // Cargar datos iniciales si no hay datos
        if (paymentList.length === 0) {
            refreshPayments()
        }

        return () => {
            listeners = listeners.filter((l) => l !== listener)
        }
    }, [ refreshPayments ])

    return {
        payments,
        refreshPayments,
        regeneratePaymentCodes,
        createPayment,
        updatePayment,
        deletePayment,
        getPaymentById,
        getPaymentsByClient,
        getPaymentSummary,
        createAdvancePayment,
        getNextPaymentDate,
        recalculateStates,
        getPaymentBreakdown
    }
}