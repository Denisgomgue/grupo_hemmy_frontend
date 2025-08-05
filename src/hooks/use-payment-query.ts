import { useState, useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PaymentsAPI } from "@/services"
import { Payment, PaymentStatus } from "@/types/payments/payment"
import { toast } from "sonner"
import { transformPaymentDataForBackend, validatePaymentData } from "@/lib/utils"

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
        status: apiPayment.status,
        paymentType: apiPayment.paymentType,
        transfername: apiPayment.transfername,
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
        stateInSpanish: apiPayment.stateInSpanish,
    }
}

export function usePaymentQuery() {
    const queryClient = useQueryClient()

    // Query para obtener pagos
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
                const mappedPayments = response.data.map(mapPaymentFromApi)
                return { data: mappedPayments, total: response.total }
            } else {
                const mappedPayment = mapPaymentFromApi(response.data)
                return { data: [ mappedPayment ], total: 1 }
            }
        } catch (error) {
            console.error("Error fetching payments:", error)
            return { data: [], total: 0 }
        }
    }, [])

    // Query para obtener resumen de pagos
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
                periodoUtilizado: 0
            }
        }
    }, [])

    // Mutation para crear pago - SIN invalidación de cache (se maneja en el componente)
    const createPayment = useCallback(async (paymentData: any) => {
        try {
            // Validar si el cliente tiene aplazamientos pendientes antes de crear el pago
            const clientPayments = await PaymentsAPI.getByClient(paymentData.clientId);
            const pendingPostponements = clientPayments.filter(payment =>
                payment.status === 'PENDING' && !payment.isVoided
            );

            // Si es un pago normal y hay aplazamientos pendientes
            if (!paymentData.engagementDate && pendingPostponements.length > 0) {
                throw new Error('El cliente tiene aplazamientos pendientes. Debe regularizar su situación antes de registrar un nuevo pago.');
            }

            // Si es un aplazamiento y ya hay aplazamientos pendientes
            if (paymentData.engagementDate && pendingPostponements.length > 0) {
                throw new Error('El cliente ya tiene aplazamientos pendientes. No puede registrar otro aplazamiento.');
            }

            // Transformar y validar datos del pago
            const sanitizedData = transformPaymentDataForBackend(paymentData);

            // Validar que el cliente sea correcto
            if (!validatePaymentData(sanitizedData)) {
                throw new Error('Datos de cliente inválidos. Por favor, verifique la información.');
            }

            // Asegurar que discount sea siempre un número
            sanitizedData.discount = typeof paymentData.discount === 'number' ?
                paymentData.discount :
                paymentData.discount === "" || paymentData.discount === null || paymentData.discount === undefined ?
                    0 :
                    parseFloat(paymentData.discount) || 0;

            // Para aplazamientos, forzar el status como PENDING
            if (paymentData.engagementDate && paymentData.engagementDate.trim() !== '') {
                sanitizedData.status = 'PENDING';
                // Agregar flag para indicar que es un aplazamiento
                sanitizedData.isPostponement = true;
                // Log removido para limpieza
            } else {
                // Para pagos normales, NO enviar engagementDate y NO enviar status
                // El backend calculará automáticamente basado en fechas
                delete sanitizedData.engagementDate;
                delete sanitizedData.status; // Dejar que el backend calcule
                // Log removido para limpieza
            }

            // Limpiar campos vacíos para pagos normales
            if (!paymentData.engagementDate || paymentData.engagementDate.trim() === '') {
                if (sanitizedData.paymentDate === '') delete sanitizedData.paymentDate;
                if (sanitizedData.reference === '') delete sanitizedData.reference;
                if (sanitizedData.transfername === '') delete sanitizedData.transfername;
                // Log removido para limpieza
            }

            // Log removido para limpieza
            // Log removido para limpieza
            // Log removido para limpieza
            // Log removido para limpieza
            // Log removido para limpieza

            const response = await PaymentsAPI.create(sanitizedData)

            // ✅ NO invalidar cache aquí - se maneja en el componente
            return response
        } catch (error) {
            console.error("Error creating payment:", error)
            // Manejar errores específicos de validación
            if (error instanceof Error && error.message.includes('aplazamientos pendientes')) {
                throw new Error(error.message);
            }
            throw error
        }
    }, [])

    // Mutation para actualizar pago - SIN invalidación de cache
    const updatePayment = useCallback(async (id: number, paymentData: any) => {
        try {
            // Transformar y validar datos del pago
            const sanitizedData = transformPaymentDataForBackend(paymentData);

            // Validar que el cliente sea correcto
            if (!validatePaymentData(sanitizedData)) {
                throw new Error('Datos de cliente inválidos. Por favor, verifique la información.');
            }

            // Asegurar que discount sea siempre un número
            sanitizedData.discount = typeof paymentData.discount === 'number' ?
                paymentData.discount :
                paymentData.discount === "" || paymentData.discount === null || paymentData.discount === undefined ?
                    0 :
                    parseFloat(paymentData.discount) || 0;

            const response = await PaymentsAPI.update(id, sanitizedData)

            // ✅ NO invalidar cache aquí - se maneja en el componente
            return response
        } catch (error) {
            console.error("Error updating payment:", error)
            throw error
        }
    }, [])

    // Mutation para eliminar pago - SIN invalidación de cache
    const deletePayment = useCallback(async (id: number) => {
        try {
            const response = await PaymentsAPI.delete(id)

            // ✅ NO invalidar cache aquí - se maneja en el componente
            return response
        } catch (error) {
            console.error("Error deleting payment:", error)
            throw error
        }
    }, [])

    // Mutation para regenerar códigos - SIN invalidación de cache
    const regeneratePaymentCodes = useCallback(async () => {
        try {
            const response = await PaymentsAPI.regenerateCodes()

            // ✅ NO invalidar cache aquí - se maneja en el componente
            return response
        } catch (error) {
            console.error("Error regenerating payment codes:", error)
            throw error
        }
    }, [])

    // Función para obtener aplazamientos pendientes de un cliente
    const getPendingPostponements = useCallback(async (clientId: number) => {
        try {
            const clientPayments = await PaymentsAPI.getByClient(clientId);
            return clientPayments.filter(payment =>
                payment.status === 'PENDING' && !payment.isVoided
            );
        } catch (error) {
            console.error("Error fetching pending postponements:", error);
            return [];
        }
    }, [])

    return {
        refreshPayments,
        getPaymentSummary,
        createPayment,
        updatePayment,
        deletePayment,
        regeneratePaymentCodes,
        getPendingPostponements
    }
} 