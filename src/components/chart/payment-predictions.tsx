"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, PieChart, BarChart3, AreaChart, Calendar, DollarSign } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, AreaChart as RechartsAreaChart, Area } from "recharts";
import { usePaymentPredictions } from "@/hooks/use-payment-predictions";

interface PaymentPredictionsProps {
    period?: string;
}

export function PaymentTrendChart({ period = '6months' }: PaymentPredictionsProps) {
    const { data, isLoading, error } = usePaymentPredictions(period);

    if (isLoading) {
        return (
            <Card className="col-span-full lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Tendencias de Pagos
                    </CardTitle>
                    <CardDescription>
                        Proyección de pagos vs. meta mensual
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className="col-span-full lg:col-span-2">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-red-700 dark:text-red-300">
                            Error al cargar datos de predicciones
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const chartData = data.trendData.map(item => ({
        month: item.month,
        pagos: item.actualPayments,
        prediccion: item.predictedPayments,
        meta: item.target,
    }));

    return (
        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Tendencias de Pagos
                </CardTitle>
                <CardDescription>
                    Proyección de pagos vs. meta mensual
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                            tickFormatter={(value) => `S/. ${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            formatter={(value: number) => [ `S/. ${value.toLocaleString()}`, '' ]}
                            labelFormatter={(label) => `Mes: ${label}`}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="pagos"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            name="Pagos Reales"
                            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="prediccion"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Predicción"
                            dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="meta"
                            stroke="#f59e0b"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            name="Meta Mensual"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function PaymentStatusChart({ period = '6months' }: PaymentPredictionsProps) {
    const { data, isLoading, error } = usePaymentPredictions(period);

    if (isLoading) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-blue-600" />
                        Estado de Pagos
                    </CardTitle>
                    <CardDescription>
                        Distribución por estado de pago
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className="col-span-1">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-red-700 dark:text-red-300">
                            Error al cargar datos
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    Estado de Pagos
                </CardTitle>
                <CardDescription>
                    Distribución por estado de pago
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                        <Pie
                            data={data.statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [ `${value}%`, 'Porcentaje' ]} />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function MonthlyComparisonChart({ period = '6months' }: PaymentPredictionsProps) {
    const { data, isLoading, error } = usePaymentPredictions(period);

    if (isLoading) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        Comparación Mensual
                    </CardTitle>
                    <CardDescription>
                        Pagos recibidos vs. esperados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className="col-span-1">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-red-700 dark:text-red-300">
                            Error al cargar datos
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Comparación Mensual
                </CardTitle>
                <CardDescription>
                    Pagos recibidos vs. esperados
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis
                            tickFormatter={(value) => `S/. ${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            formatter={(value: number) => [ `S/. ${value.toLocaleString()}`, '' ]}
                            labelFormatter={(label) => `Mes: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="pagosRecibidos" fill="#3b82f6" name="Recibidos" />
                        <Bar dataKey="pagosEsperados" fill="#10b981" name="Esperados" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function RevenueProjectionChart({ period = '6months' }: PaymentPredictionsProps) {
    const { data, isLoading, error } = usePaymentPredictions(period);

    if (isLoading) {
        return (
            <Card className="col-span-full lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AreaChart className="h-5 w-5 text-orange-600" />
                        Proyección de Ingresos
                    </CardTitle>
                    <CardDescription>
                        Proyección de ingresos futuros
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className="col-span-full lg:col-span-2">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-red-700 dark:text-red-300">
                            Error al cargar datos
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AreaChart className="h-5 w-5 text-orange-600" />
                    Proyección de Ingresos
                </CardTitle>
                <CardDescription>
                    Proyección de ingresos futuros
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsAreaChart data={data.projectionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis
                            tickFormatter={(value) => `S/. ${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            formatter={(value: number) => [ `S/. ${value.toLocaleString()}`, '' ]}
                            labelFormatter={(label) => `Mes: ${label}`}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="proyeccion"
                            stackId="1"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.6}
                            name="Proyección"
                        />
                        <Area
                            type="monotone"
                            dataKey="meta"
                            stackId="2"
                            stroke="#f59e0b"
                            fill="#f59e0b"
                            fillOpacity={0.3}
                            name="Meta"
                        />
                    </RechartsAreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function PaymentPredictionsDashboard({ period = '6months' }: PaymentPredictionsProps) {
    const { data, isLoading, error } = usePaymentPredictions(period);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pagos Próximos</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <p className="text-sm text-red-700 dark:text-red-300">
                                Error al cargar datos
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        S/. {data.upcomingPayments.thisWeek.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Pagos esperados
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Próxima Semana</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        S/. {data.upcomingPayments.nextWeek.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Pagos esperados
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        S/. {data.upcomingPayments.thisMonth.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Total esperado
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        +5.9%
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Crecimiento mensual
                    </p>
                </CardContent>
            </Card>
        </div>
    );
} 