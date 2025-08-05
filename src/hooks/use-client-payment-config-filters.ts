import { useMemo, useState } from "react";
import { ClientPaymentConfig, PaymentStatus } from "@/types/client-payment-configs/client-payment-config";

export function useClientPaymentConfigFilters(configs: ClientPaymentConfig[]) {
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ filters, setFilters ] = useState<{
        paymentStatus?: PaymentStatus;
        installationId?: number;
        advancePayment?: boolean;
        dateFrom?: string;
        dateTo?: string;
    }>({});
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ pageSize, setPageSize ] = useState(10);
    const [ viewMode, setViewMode ] = useState<"list" | "grid">("list");

    const filteredConfigs = useMemo(() => {
        return configs.filter((config) => {
            // Búsqueda por término - Nota: necesitamos acceder a los datos del cliente a través de la instalación
            // Por ahora, solo filtramos por installationId si está disponible
            const matchesSearch = searchTerm === "" ||
                config.installationId?.toString().includes(searchTerm.toLowerCase());

            // Filtros adicionales
            const matchesPaymentStatus = !filters.paymentStatus || config.paymentStatus === filters.paymentStatus;
            const matchesInstallationId = !filters.installationId || config.installationId === filters.installationId;
            const matchesAdvancePayment = filters.advancePayment === undefined || config.advancePayment === filters.advancePayment;

            const matchesDateRange = !filters.dateFrom && !filters.dateTo ||
                (config.initialPaymentDate &&
                    config.initialPaymentDate >= new Date(filters.dateFrom || "1900-01-01") &&
                    config.initialPaymentDate <= new Date(filters.dateTo || "9999-12-31"));

            return matchesSearch && matchesPaymentStatus && matchesInstallationId && matchesAdvancePayment && matchesDateRange;
        });
    }, [ configs, searchTerm, filters ]);

    const paginatedConfigs = useMemo(() => {
        return filteredConfigs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }, [ filteredConfigs, currentPage, pageSize ]);

    return {
        searchTerm, setSearchTerm,
        filters, setFilters,
        currentPage, setCurrentPage,
        pageSize, setPageSize,
        viewMode, setViewMode,
        filteredConfigs,
        paginatedConfigs,
        totalRecords: filteredConfigs.length
    };
} 