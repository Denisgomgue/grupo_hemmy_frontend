import { useMemo, useState } from "react";
import { Payment, PaymentStatus, PaymentType } from "@/types/payments/payment";

export function usePaymentFilters(payments: Payment[]) {
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ filters, setFilters ] = useState<{
        status?: PaymentStatus;
        paymentType?: PaymentType;
        clientId?: number;
        minAmount?: number;
        maxAmount?: number;
        dateFrom?: string;
        dateTo?: string;
    }>({});
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ pageSize, setPageSize ] = useState(10);
    const [ viewMode, setViewMode ] = useState<"list" | "grid">("list");

    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            // Búsqueda por término
            const matchesSearch = searchTerm === "" ||
                (payment.reference || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (payment.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (payment.transfername || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (payment.client?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (payment.client?.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (payment.client?.dni || "").toLowerCase().includes(searchTerm.toLowerCase());

            // Filtros adicionales
            const matchesStatus = !filters.status || payment.status === filters.status;
            const matchesPaymentType = !filters.paymentType || payment.paymentType === filters.paymentType;
            const matchesClientId = !filters.clientId || payment.clientId === filters.clientId;

            const matchesAmount = !filters.minAmount && !filters.maxAmount ||
                (payment.amount >= (filters.minAmount || 0) &&
                    payment.amount <= (filters.maxAmount || Number.MAX_SAFE_INTEGER));

            const matchesDateRange = !filters.dateFrom && !filters.dateTo ||
                (payment.paymentDate >= (filters.dateFrom || "") &&
                    payment.paymentDate <= (filters.dateTo || "9999-12-31"));

            return matchesSearch && matchesStatus && matchesPaymentType && matchesClientId && matchesAmount && matchesDateRange;
        });
    }, [ payments, searchTerm, filters ]);

    const paginatedPayments = useMemo(() => {
        return filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }, [ filteredPayments, currentPage, pageSize ]);

    return {
        searchTerm, setSearchTerm,
        filters, setFilters,
        currentPage, setCurrentPage,
        pageSize, setPageSize,
        viewMode, setViewMode,
        filteredPayments,
        paginatedPayments,
        totalRecords: filteredPayments.length
    };
} 