"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Activity
} from "lucide-react";
import { ClientsAPI } from "@/services/clients-api";
import { PaymentsAPI } from "@/services/payments-api";
import { Carousel } from "@/components/ui/carousel";

// Componente de tarjeta de estadística
interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  variant?: "default" | "success" | "warning" | "destructive";
}

function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  isLoading = false,
  variant = "default"
}: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-l-green-500 bg-green-50 dark:bg-green-950/20";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
      case "destructive":
        return "border-l-red-500 bg-red-50 dark:bg-red-950/20";
      default:
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20";
    }
  };

  if (isLoading) {
    return (
      <Card className="border-l-4 animate-pulse">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-l-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${getVariantStyles()}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-2xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </h3>

              {trend && (
                <Badge variant={trend.isPositive ? "default" : "destructive"}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          </div>

          <div className="flex-shrink-0 ml-4">
            <div className="p-2 rounded-lg bg-muted/50">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}

export default function DashboardPage() {

  // Query para datos de clientes
  const {
    data: clientSummary,
    isLoading: isLoadingClients,
    error: clientError
  } = useQuery({
    queryKey: [ "clientSummary" ],
    queryFn: () => ClientsAPI.getSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para datos de pagos
  const {
    data: paymentSummary,
    isLoading: isLoadingPayments,
    error: paymentError
  } = useQuery({
    queryKey: [ "paymentSummary" ],
    queryFn: () => PaymentsAPI.getSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });



  // Secciones para el carrusel
  const carouselSections = [
    // Sección de Clientes
    <Section
      key="clients"
      title="Gestión de Clientes"
    >
      <StatCard
        title="Total Clientes"
        value={clientSummary?.totalClientes || 0}
        description="Clientes registrados en el sistema"
        icon={<Users />}
        isLoading={isLoadingClients}
        variant="default"
      />

      <StatCard
        title="Clientes Activos"
        value={clientSummary?.clientesActivos || 0}
        description="Con servicio funcionando normalmente"
        icon={<UserCheck />}
        isLoading={isLoadingClients}
        variant="success"
      />

      <StatCard
        title="Clientes Suspendidos"
        value={clientSummary?.clientesSuspendidos || 0}
        description="Servicio temporalmente suspendido"
        icon={<UserX />}
        isLoading={isLoadingClients}
        variant="destructive"
      />

      <StatCard
        title="Clientes Inactivos"
        value={clientSummary?.clientesInactivos || 0}
        description="Sin servicio activo"
        icon={<Clock />}
        isLoading={isLoadingClients}
        variant="warning"
      />
    </Section>,

    // Sección de Pagos
    <Section
      key="payments"
      title="Gestión de Pagos"
      subtitle="Resumen de pagos y recaudación del sistema"
    >
      <StatCard
        title="Total Recaudado"
        value={`S/. ${(paymentSummary?.totalRecaudado || 0).toLocaleString('es-PE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`}
        description="Pagos válidos (al día + atrasados)"
        icon={<DollarSign />}
        isLoading={isLoadingPayments}
        variant="default"
      />

      <StatCard
        title="Pagos Pagados"
        value={paymentSummary?.pagosPagados || 0}
        description="Este periodo"
        icon={<CheckCircle />}
        isLoading={isLoadingPayments}
        variant="success"
      />

      <StatCard
        title="Pagos Pendientes"
        value={paymentSummary?.pagosPendientes || 0}
        description="Esperando confirmación"
        icon={<Clock />}
        isLoading={isLoadingPayments}
        variant="warning"
      />

      <StatCard
        title="Pagos Atrasados"
        value={paymentSummary?.pagosAtrasados || 0}
        description="Requieren seguimiento"
        icon={<AlertTriangle />}
        isLoading={isLoadingPayments}
        variant="destructive"
      />
    </Section>,

    // Sección de Métricas Adicionales
    <Section
      key="additional"
      title="Métricas Adicionales"
      subtitle="Indicadores de rendimiento del sistema"
    >
      <StatCard
        title="Pagos Anulados"
        value={paymentSummary?.pagosAnulados || 0}
        description="Cancelados"
        icon={<XCircle />}
        isLoading={isLoadingPayments}
        variant="default"
      />

      <StatCard
        title="Clientes Pagados"
        value={clientSummary?.clientesPagados || 0}
        description="Al día con sus pagos"
        icon={<UserCheck />}
        isLoading={isLoadingClients}
        variant="success"
      />

      <StatCard
        title="Por Vencer"
        value={clientSummary?.clientesPorVencer || 0}
        description="Pagos próximos a vencer"
        icon={<Clock />}
        isLoading={isLoadingClients}
        variant="warning"
      />

      <StatCard
        title="Suspendidos Pago"
        value={clientSummary?.clientesSuspendidosPago || 0}
        description="Suspendidos por falta de pago"
        icon={<UserX />}
        isLoading={isLoadingClients}
        variant="destructive"
      />
    </Section>
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema Grupo Hemmy
        </p>
      </div>

      {/* Carrusel de Secciones de Resumen */}
      <div className="space-y-4">

        <Carousel
          autoPlay={true}
          interval={8000}
          showDots={true}
          showArrows={true}
          className="min-h-[400px]"
        >
          {carouselSections}
        </Carousel>
      </div>



      {/* Mensajes de error */}
      {(clientError || paymentError) && (
        <Card className="border-l-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {clientError && "Error al cargar datos de clientes. "}
                {paymentError && "Error al cargar datos de pagos. "}
                Los datos mostrados pueden no estar actualizados.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

