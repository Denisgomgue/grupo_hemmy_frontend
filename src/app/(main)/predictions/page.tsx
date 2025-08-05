"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PaymentPredictionsDashboard, PaymentTrendChart, PaymentStatusChart, MonthlyComparisonChart, RevenueProjectionChart } from "@/components/chart/payment-predictions";
import { PredictionMetrics, PredictionAlerts } from "@/components/chart/prediction-metrics";
import { TrendingUp, BarChart3, PieChart, AreaChart } from "lucide-react";

export default function PredictionsPage() {
    const [ predictionPeriod, setPredictionPeriod ] = useState('6months');

    const periodOptions = [
        { value: '1month', label: '1 Mes' },
        { value: '6months', label: '6 Meses' },
        { value: '1year', label: '1 Año' },
        { value: '2years', label: '2 Años' },
    ];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Predicciones de Pagos</h1>
                <p className="text-muted-foreground">
                    Análisis predictivo y proyecciones de ingresos para la toma de decisiones estratégicas
                </p>
            </div>

            {/* Filtros de Período */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Filtros de Período
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <FilterTabs
                        value={predictionPeriod}
                        onValueChange={setPredictionPeriod}
                        options={periodOptions}
                    />
                </CardContent>
            </Card>

            {/* Métricas de Predicción */}
            <PredictionMetrics
                accuracy={87}
                confidence={92}
                nextMonthPrediction={72000}
                lastMonthActual={68000}
                growthRate={5.9}
                riskLevel="low"
                daysUntilNextPayment={12}
                expectedRevenue={85000}
            />

            {/* Gráficos de Predicción */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <PaymentTrendChart period={predictionPeriod} />
                <PaymentStatusChart period={predictionPeriod} />
                <MonthlyComparisonChart period={predictionPeriod} />
                <RevenueProjectionChart period={predictionPeriod} />
            </div>

            {/* Dashboard de Predicciones */}
            <PaymentPredictionsDashboard period={predictionPeriod} />

            {/* Alertas de Predicción */}
            <PredictionAlerts />
        </div>
    );
} 