import { useMemo } from "react";
import { useDeviceType } from "./use-mobile";

export interface SummaryCardConfig {
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    borderColor: string;
    bgColor?: string;
    textColor?: string;
    isLoading?: boolean;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function useSummaryCards() {
    const deviceType = useDeviceType();

    // Configuración responsiva para tarjetas de resumen
    const getCardConfig = useMemo(() => {
        switch (deviceType) {
            case 'mobile':
                return {
                    gridCols: 'grid-cols-1',
                    gap: 'gap-3',
                    padding: 'p-3',
                    iconSize: 'h-5 w-5',
                    textSize: 'text-lg',
                    descriptionSize: 'text-xs',
                    maxCardsPerRow: 1
                };
            case 'tablet':
                return {
                    gridCols: 'grid-cols-2',
                    gap: 'gap-4',
                    padding: 'p-4',
                    iconSize: 'h-6 w-6',
                    textSize: 'text-xl',
                    descriptionSize: 'text-sm',
                    maxCardsPerRow: 2
                };
            case 'laptop':
                return {
                    gridCols: 'grid-cols-2',
                    gap: 'gap-4',
                    padding: 'p-5',
                    iconSize: 'h-7 w-7',
                    textSize: 'text-2xl',
                    descriptionSize: 'text-sm',
                    maxCardsPerRow: 2
                };
            case 'desktop':
                return {
                    gridCols: 'grid-cols-4',
                    gap: 'gap-6',
                    padding: 'p-6',
                    iconSize: 'h-8 w-8',
                    textSize: 'text-2xl',
                    descriptionSize: 'text-sm',
                    maxCardsPerRow: 4
                };
            default:
                return {
                    gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
                    gap: 'gap-4',
                    padding: 'p-4 sm:p-6',
                    iconSize: 'h-6 w-6 sm:h-8 sm:w-8',
                    textSize: 'text-xl sm:text-2xl',
                    descriptionSize: 'text-xs sm:text-sm',
                    maxCardsPerRow: 4
                };
        }
    }, [ deviceType ]);

    // Función para crear tarjetas de resumen de clientes
    const createClientSummaryCards = (data: {
        totalClientes: number;
        clientesActivos: number;
        clientesSuspendidos: number;
        clientesInactivos: number;
    }, icons: {
        total: React.ReactNode;
        active: React.ReactNode;
        suspended: React.ReactNode;
        inactive: React.ReactNode;
    }, isLoading = false): SummaryCardConfig[] => {
        // Solo mostrar estado general de clientes
        return [
            {
                title: "Total Clientes",
                value: data.totalClientes,
                description: "Clientes registrados en el sistema",
                icon: icons.total,
                borderColor: "border-l-purple-500",
                isLoading
            },
            {
                title: "Clientes Activos",
                value: data.clientesActivos,
                description: "Con servicio funcionando normalmente",
                icon: icons.active,
                borderColor: "border-l-green-500",
                isLoading
            },
            {
                title: "Clientes Suspendidos",
                value: data.clientesSuspendidos,
                description: "Servicio temporalmente suspendido",
                icon: icons.suspended,
                borderColor: "border-l-red-500",
                isLoading
            },
            {
                title: "Clientes Inactivos",
                value: data.clientesInactivos,
                description: "Sin servicio activo",
                icon: icons.inactive,
                borderColor: "border-l-yellow-500",
                isLoading
            }
        ];
    };

    return {
        deviceType,
        cardConfig: getCardConfig,
        createClientSummaryCards
    };
} 