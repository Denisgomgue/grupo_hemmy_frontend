import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { Employee } from "@/types/employees/employee"

function mapEmployeeFromApi(apiEmployee: any): Employee {
    return {
        id: apiEmployee.id,
        name: apiEmployee.name,
        lastName: apiEmployee.lastName,
        dni: apiEmployee.dni,
        role: apiEmployee.role,
        phone: apiEmployee.phone,
        created_at: new Date(apiEmployee.created_at),
        updated_at: new Date(apiEmployee.updated_at),
    }
}

export function useEmployees() {
    const [ employees, setEmployees ] = useState<Employee[]>([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const fetchEmployees = useCallback(async (
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        roleId?: number
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const params: Record<string, any> = {
                page: page.toString(),
                limit: pageSize.toString()
            };

            if (search) {
                params.search = search;
            }

            if (roleId) {
                params.roleId = roleId.toString();
            }

            const response = await api.get<{ data: Employee[], total: number }>("/employees", {
                params
            });

            const mappedEmployees = response.data.data.map(mapEmployeeFromApi);
            setEmployees(mappedEmployees);
            return { data: mappedEmployees, total: response.data.total };
        } catch (error) {
            console.error("Error fetching employees:", error);
            setError("Error al cargar empleados");
            return { data: [], total: 0 };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getEmployeeById = useCallback(async (id: number): Promise<Employee> => {
        try {
            const response = await api.get<Employee>(`/employees/${id}`);
            return mapEmployeeFromApi(response.data);
        } catch (error) {
            console.error(`Error fetching employee with ID ${id}:`, error);
            throw error;
        }
    }, []);

    const createEmployee = useCallback(async (employeeData: any): Promise<Employee> => {
        try {
            const response = await api.post<Employee>("/employees", employeeData);
            await fetchEmployees();
            return mapEmployeeFromApi(response.data);
        } catch (error) {
            console.error("Error creating employee:", error);
            throw error;
        }
    }, [ fetchEmployees ]);

    const updateEmployee = useCallback(async (id: number, employeeData: any): Promise<Employee> => {
        try {
            const response = await api.patch<Employee>(`/employees/${id}`, employeeData);
            await fetchEmployees();
            return mapEmployeeFromApi(response.data);
        } catch (error) {
            console.error("Error updating employee:", error);
            throw error;
        }
    }, [ fetchEmployees ]);

    const deleteEmployee = useCallback(async (id: number): Promise<void> => {
        try {
            await api.delete(`/employees/${id}`);
            await fetchEmployees();
        } catch (error) {
            console.error("Error deleting employee:", error);
            throw error;
        }
    }, [ fetchEmployees ]);

    const getEmployeesByRole = useCallback(async (roleId: number): Promise<Employee[]> => {
        try {
            const response = await api.get<Employee[]>(`/employees/role/${roleId}`);
            return response.data.map(mapEmployeeFromApi);
        } catch (error) {
            console.error("Error fetching employees by role:", error);
            throw error;
        }
    }, []);

    return {
        employees,
        isLoading,
        error,
        fetchEmployees,
        getEmployeeById,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeesByRole
    };
} 