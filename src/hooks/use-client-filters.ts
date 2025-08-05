import { useMemo, useState } from "react";
import { Client, AccountStatus } from "@/types/clients/client";

export function useClientFilters(clients: Client[]) {
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ filters, setFilters ] = useState<{
        status?: Record<AccountStatus, boolean>;
        name?: string;
        dni?: string;
    }>({});
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ pageSize, setPageSize ] = useState(10);
    const [ viewMode, setViewMode ] = useState<"list" | "grid">("list");

    const filteredClients = useMemo(() => {
        return clients.filter((client) => {
            // Búsqueda por término
            const matchesSearch = searchTerm === "" ||
                (client.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (client.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (client.dni || "").toLowerCase().includes(searchTerm.toLowerCase());

            // Filtros adicionales
            const matchesStatus = !filters.status ||
                Object.entries(filters.status).every(([ status, enabled ]) =>
                    !enabled || client.status === status
                );

            const matchesName = !filters.name ||
                (client.name || "").toLowerCase().includes(filters.name.toLowerCase());

            const matchesDni = !filters.dni ||
                (client.dni || "").toLowerCase().includes(filters.dni.toLowerCase());

            return matchesSearch && matchesStatus && matchesName && matchesDni;
        });
    }, [ clients, searchTerm, filters ]);

    const paginatedClients = useMemo(() => {
        return filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }, [ filteredClients, currentPage, pageSize ]);

    return {
        searchTerm, setSearchTerm,
        filters, setFilters,
        currentPage, setCurrentPage,
        pageSize, setPageSize,
        viewMode, setViewMode,
        filteredClients,
        paginatedClients,
        totalRecords: filteredClients.length
    };
} 