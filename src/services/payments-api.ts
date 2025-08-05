import axios from '@/lib/axios'
import { Payment, PaymentStatus, PaymentType } from '@/types/payments/payment'

export interface PaymentSummary {
    totalRecaudado: number;
    pagosPagados: number;
    pagosPendientes: number;
    pagosAtrasados: number;
    pagosAnulados: number;
    periodoUtilizado: number; // Cambiado de string a number
}

export interface CreatePaymentData {
    client: number; // Cambiado de clientId a client para que coincida con el backend
    amount: number;
    paymentDate?: string;
    paymentType?: PaymentType;
    reference?: string;
    transfername?: string;
    reconnection?: boolean;
    discount?: number;
    dueDate?: string;
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> { }

export interface AdvancePaymentData {
    clientId: number;
    amount: number;
}

export interface NextPaymentDateResponse {
    date: string;
    isFromInitial: boolean;
}

export interface RegenerateCodesResponse {
    total: number;
    updated: number;
    message: string;
}

export class PaymentsAPI {
    // Obtener todos los pagos
    static async getAll(params?: {
        page?: number;
        pageSize?: number;
        status?: PaymentStatus;
        search?: string;
        client?: number;
    }): Promise<{ data: Payment[]; total: number }> {
        const response = await axios.get('/payments', { params });

        // Manejar diferentes formatos de respuesta
        if (Array.isArray(response.data)) {
            return { data: response.data, total: response.data.length };
        } else if (response.data && typeof response.data === 'object') {
            if ('data' in response.data && 'total' in response.data) {
                return response.data;
            } else {
                return { data: [ response.data ], total: 1 };
            }
        }

        return { data: [], total: 0 };
    }

    // Obtener pago por ID
    static async getById(id: number): Promise<Payment> {
        const response = await axios.get(`/payments/${id}`);
        return response.data;
    }

    // Crear nuevo pago
    static async create(data: CreatePaymentData): Promise<Payment> {
        const response = await axios.post('/payments', data);
        return response.data;
    }

    // Actualizar pago
    static async update(id: number, data: UpdatePaymentData): Promise<Payment> {
        const response = await axios.patch(`/payments/${id}`, data);
        return response.data;
    }

    // Eliminar pago
    static async delete(id: number): Promise<void> {
        await axios.delete(`/payments/${id}`);
    }

    // Obtener pagos por cliente
    static async getByClient(clientId: number): Promise<Payment[]> {
        const response = await axios.get(`/payments?client=${clientId}`);
        return Array.isArray(response.data) ? response.data : [];
    }

    /**
     * Obtiene el resumen de pagos desde el backend
     * Mapea la respuesta al formato esperado por el frontend
     * @param period - Período de tiempo para filtrar (default: 'thisMonth')
     * @returns Resumen de pagos con totales y conteos
     */
    static async getSummary(period: string = 'thisMonth'): Promise<PaymentSummary> {
        const response = await axios.get('/payments/summary', {
            params: { period }
        });

        // Mapear la respuesta del backend al formato esperado por el frontend
        const backendData = response.data;

        return {
            totalRecaudado: backendData.totalAmount || 0,
            pagosPagados: backendData.dailyPayments || 0,
            pagosPendientes: backendData.pendingPayments || 0,
            pagosAtrasados: backendData.latePayments || 0,
            pagosAnulados: backendData.voidedPayments || 0,
            periodoUtilizado: 0 // Cambiado de period (string) a number
        };
    }

    // Registrar pago adelantado
    static async createAdvancePayment(data: AdvancePaymentData): Promise<Payment> {
        const response = await axios.post('/payments/advance-payment', data);
        return response.data;
    }

    // Obtener próxima fecha de pago
    static async getNextPaymentDate(clientId: number): Promise<NextPaymentDateResponse> {
        const response = await axios.get(`/payments/next-payment-date/${clientId}`);
        const nextDate = new Date(response.data);

        return {
            date: nextDate.toLocaleDateString('es-ES'),
            isFromInitial: false
        };
    }

    // Regenerar códigos de pago
    static async regenerateCodes(): Promise<RegenerateCodesResponse> {
        const response = await axios.post('/payments/regenerate-codes');
        return response.data;
    }

    // Recalcular estados de pagos
    static async recalculateStates(): Promise<{ message: string }> {
        const response = await axios.post('/payments/recalculate-states');
        return response.data;
    }

    // Obtener desglose de pago
    static async getPaymentBreakdown(id: number): Promise<any> {
        const response = await axios.get(`/payments/${id}/breakdown`);
        return response.data;
    }

    // Obtener predicciones de pagos
    static async getPaymentPredictions(period: string = '6months'): Promise<any> {
        const response = await axios.get('/payments/predictions', {
            params: { period }
        });
        return response;
    }
} 