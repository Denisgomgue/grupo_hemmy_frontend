import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

interface AdvancePaymentData {
    clientId: number;
    amount: number;
}

interface NextPaymentDateResponse {
    date: string;
    isFromInitial: boolean;
}

export const useAdvancePayment = () => {
    const [ isLoading, setIsLoading ] = useState(false);
    const { toast } = useToast();

    const handleAdvancePayment = async (data: AdvancePaymentData) => {
        setIsLoading(true);
        try {
            const response = await api.post('/payments/advance-payment', data);

            toast({
                title: "Pago adelantado registrado",
                description: "El pago adelantado se ha registrado correctamente.",
                variant: "default",
            });

            return response.data;
        } catch (error) {
            console.error('Error al registrar pago adelantado:', error);
            toast({
                title: "Error",
                description: "No se pudo registrar el pago adelantado. Por favor, intente nuevamente.",
                variant: "destructive",
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getNextPaymentDate = async (clientId: number): Promise<NextPaymentDateResponse> => {
        try {
            const response = await api.get(`/payments/next-payment-date/${clientId}`);
            const nextDate = new Date(response.data);

            return {
                date: nextDate.toLocaleDateString('es-ES'),
                isFromInitial: false // Por ahora siempre false, se puede mejorar la lógica
            };
        } catch (error) {
            console.error('Error al obtener próxima fecha de pago:', error);
            return {
                date: "No definida",
                isFromInitial: false
            };
        }
    };

    return {
        handleAdvancePayment,
        getNextPaymentDate,
        isLoading
    };
}; 