"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp,
    TrendingDown,
    Target,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign
} from "lucide-react";

interface PredictionMetricsProps {
    accuracy: number;
    confidence: number;
    nextMonthPrediction: number;
    lastMonthActual: number;
    growthRate: number;
    riskLevel: "low" | "medium" | "high";
    daysUntilNextPayment: number;
    expectedRevenue: number;
}

export function PredictionMetrics({
    accuracy,
    confidence,
    nextMonthPrediction,
    lastMonthActual,
    growthRate,
    riskLevel,
    daysUntilNextPayment,
    expectedRevenue
}: PredictionMetricsProps) {
    const getRiskColor = (level: string) => {
        switch (level) {
            case "low":
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case "medium":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case "high":
                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case "low":
                return <CheckCircle className="h-4 w-4" />;
            case "medium":
                return <Clock className="h-4 w-4" />;
            case "high":
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Precisión del Modelo */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        Precisión del Modelo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{accuracy}%</span>
                            <Badge variant={accuracy >= 90 ? "default" : accuracy >= 80 ? "secondary" : "destructive"}>
                                {accuracy >= 90 ? "Excelente" : accuracy >= 80 ? "Buena" : "Mejorable"}
                            </Badge>
                        </div>
                        <Progress value={accuracy} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                            Basado en datos históricos
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Nivel de Confianza */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Nivel de Confianza
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{confidence}%</span>
                            <Badge variant={confidence >= 85 ? "default" : confidence >= 70 ? "secondary" : "destructive"}>
                                {confidence >= 85 ? "Alto" : confidence >= 70 ? "Medio" : "Bajo"}
                            </Badge>
                        </div>
                        <Progress value={confidence} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                            Confianza en predicciones
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Predicción Próximo Mes */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        Próximo Mes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                                S/. {(nextMonthPrediction / 1000).toFixed(0)}k
                            </span>
                            <Badge variant={growthRate > 0 ? "default" : "destructive"}>
                                {growthRate > 0 ? "+" : ""}{growthRate}%
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>vs mes anterior:</span>
                            <span className="font-medium">
                                S/. {(lastMonthActual / 1000).toFixed(0)}k
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Predicción basada en IA
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Nivel de Riesgo */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        Nivel de Riesgo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Badge className={getRiskColor(riskLevel)}>
                                {getRiskIcon(riskLevel)}
                                {riskLevel === "low" ? "Bajo" : riskLevel === "medium" ? "Medio" : "Alto"}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Próximo pago en:</span>
                                <span className="font-medium">{daysUntilNextPayment} días</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Ingresos esperados:</span>
                                <span className="font-medium">
                                    S/. {(expectedRevenue / 1000).toFixed(0)}k
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Basado en patrones históricos
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Componente para mostrar alertas de predicción
export function PredictionAlerts() {
    const alerts = [
        {
            id: 1,
            type: "warning" as const,
            title: "Pagos atrasados detectados",
            description: "15 clientes tienen pagos vencidos por más de 30 días",
            icon: AlertCircle,
        },
        {
            id: 2,
            type: "info" as const,
            title: "Tendencia positiva",
            description: "Los pagos han aumentado 12% este mes",
            icon: TrendingUp,
        },
        {
            id: 3,
            type: "success" as const,
            title: "Meta superada",
            description: "Se ha alcanzado el 105% de la meta mensual",
            icon: CheckCircle,
        },
    ];

    const getAlertStyles = (type: string) => {
        switch (type) {
            case "warning":
                return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
            case "info":
                return "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20";
            case "success":
                return "border-l-green-500 bg-green-50 dark:bg-green-950/20";
            default:
                return "border-l-gray-500 bg-gray-50 dark:bg-gray-950/20";
        }
    };

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Alertas de Predicción
                </CardTitle>
                <CardDescription>
                    Alertas importantes basadas en análisis predictivo
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`p-3 rounded-lg border-l-4 ${getAlertStyles(alert.type)}`}
                        >
                            <div className="flex items-start gap-3">
                                <alert.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm">{alert.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {alert.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 