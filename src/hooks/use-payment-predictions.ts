import { useQuery } from "@tanstack/react-query";
import { PaymentsAPI } from "@/services/payments-api";

export interface PaymentPrediction {
    month: string;
    actualPayments: number | null; // Changed to allow null for future predictions
    predictedPayments: number;
    target: number;
}

export interface PaymentStatus {
    name: string;
    value: number;
    color: string;
}

export interface MonthlyComparison {
    mes: string;
    pagosRecibidos: number;
    pagosEsperados: number;
}

export interface RevenueProjection {
    mes: string;
    proyeccion: number;
    meta: number;
}

export interface UpcomingPayments {
    thisWeek: number;
    nextWeek: number;
    thisMonth: number;
}

export interface PaymentPredictionsData {
    trendData: PaymentPrediction[];
    statusData: PaymentStatus[];
    comparisonData: MonthlyComparison[];
    projectionData: RevenueProjection[];
    upcomingPayments: UpcomingPayments;
}

export function usePaymentPredictions(period: string = '6months') {
    return useQuery({
        queryKey: [ "paymentPredictions", period ],
        queryFn: async (): Promise<PaymentPredictionsData> => {
            const response = await PaymentsAPI.getPaymentPredictions(period);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
} 