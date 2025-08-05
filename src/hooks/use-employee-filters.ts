import { useMemo, useState } from "react";
import { Employee } from "@/types/employees/employee";

export function useEmployeeFilters(employees: Employee[]) {
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ filters, setFilters ] = useState({
        roleId: undefined as number | undefined,
    });
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ pageSize, setPageSize ] = useState(10);
    const [ viewMode, setViewMode ] = useState<"list" | "grid">("list");

    const filteredEmployees = useMemo(() => {
        return employees.filter((employee) => {
            const matchesSearch = searchTerm === "" ||
                (employee.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (employee.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (employee.dni || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (employee.phone || "").toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = !filters.roleId || employee.roleId === filters.roleId;

            return matchesSearch && matchesRole;
        });
    }, [ employees, searchTerm, filters ]);

    const paginatedEmployees = useMemo(() => {
        return filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }, [ filteredEmployees, currentPage, pageSize ]);

    return {
        searchTerm, setSearchTerm,
        filters, setFilters,
        currentPage, setCurrentPage,
        pageSize, setPageSize,
        viewMode, setViewMode,
        filteredEmployees,
        paginatedEmployees,
        totalRecords: filteredEmployees.length
    };
} 