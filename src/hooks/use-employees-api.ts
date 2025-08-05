import { useState, useEffect, useCallback } from "react"
import { EmployeesAPI } from "@/services"
import { Employee } from "@/types/employees/employee"

export function useEmployeesAPI() {
    const [ employees, setEmployees ] = useState<Employee[]>([])
    const [ isLoading, setIsLoading ] = useState(false)
    const [ summary, setSummary ] = useState<any>(null)

    const loadEmployees = useCallback(async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        department?: string;
        position?: string;
    }) => {
        setIsLoading(true)
        try {
            const response = await EmployeesAPI.getPaginated(params)
            setEmployees(response.data)
            return response
        } catch (error) {
            console.error("Error loading employees:", error)
            return { data: [], total: 0 }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getEmployeeById = useCallback(async (id: number): Promise<Employee> => {
        try {
            const response = await EmployeesAPI.getById(id)
            return response
        } catch (error) {
            console.error("Error fetching employee:", error)
            throw error
        }
    }, [])

    const createEmployee = useCallback(async (data: any): Promise<Employee> => {
        try {
            const response = await EmployeesAPI.create(data)
            await loadEmployees()
            return response
        } catch (error) {
            console.error("Error creating employee:", error)
            throw error
        }
    }, [ loadEmployees ])

    const updateEmployee = useCallback(async (id: number, data: any): Promise<Employee> => {
        try {
            const response = await EmployeesAPI.update(id, data)
            await loadEmployees()
            return response
        } catch (error) {
            console.error("Error updating employee:", error)
            throw error
        }
    }, [ loadEmployees ])

    const deleteEmployee = useCallback(async (id: number): Promise<void> => {
        try {
            await EmployeesAPI.delete(id)
            await loadEmployees()
        } catch (error) {
            console.error("Error deleting employee:", error)
            throw error
        }
    }, [ loadEmployees ])

    const getActiveEmployees = useCallback(async (): Promise<Employee[]> => {
        try {
            const response = await EmployeesAPI.getActive()
            return response
        } catch (error) {
            console.error("Error fetching active employees:", error)
            throw error
        }
    }, [])

    const getSummary = useCallback(async () => {
        try {
            const response = await EmployeesAPI.getSummary()
            setSummary(response)
            return response
        } catch (error) {
            console.error("Error fetching employee summary:", error)
            throw error
        }
    }, [])

    const filterEmployees = useCallback(async (filters: any): Promise<Employee[]> => {
        try {
            const response = await EmployeesAPI.filter(filters)
            return response
        } catch (error) {
            console.error("Error filtering employees:", error)
            throw error
        }
    }, [])

    const getByDepartment = useCallback(async (department: string): Promise<Employee[]> => {
        try {
            const response = await EmployeesAPI.getByDepartment(department)
            return response
        } catch (error) {
            console.error("Error fetching employees by department:", error)
            throw error
        }
    }, [])

    const getByPosition = useCallback(async (position: string): Promise<Employee[]> => {
        try {
            const response = await EmployeesAPI.getByPosition(position)
            return response
        } catch (error) {
            console.error("Error fetching employees by position:", error)
            throw error
        }
    }, [])

    const searchByDni = useCallback(async (dni: string): Promise<Employee[]> => {
        try {
            const response = await EmployeesAPI.searchByDni(dni)
            return response
        } catch (error) {
            console.error("Error searching employee by DNI:", error)
            throw error
        }
    }, [])

    const searchByName = useCallback(async (name: string): Promise<Employee[]> => {
        try {
            const response = await EmployeesAPI.searchByName(name)
            return response
        } catch (error) {
            console.error("Error searching employee by name:", error)
            throw error
        }
    }, [])

    const toggleActive = useCallback(async (id: number): Promise<Employee> => {
        try {
            const response = await EmployeesAPI.toggleActive(id)
            await loadEmployees()
            return response
        } catch (error) {
            console.error("Error toggling employee active status:", error)
            throw error
        }
    }, [ loadEmployees ])

    const getWithDevices = useCallback(async (): Promise<Employee[]> => {
        try {
            const response = await EmployeesAPI.getWithDevices()
            return response
        } catch (error) {
            console.error("Error fetching employees with devices:", error)
            throw error
        }
    }, [])

    const getWithInstallations = useCallback(async (): Promise<Employee[]> => {
        try {
            const response = await EmployeesAPI.getWithInstallations()
            return response
        } catch (error) {
            console.error("Error fetching employees with installations:", error)
            throw error
        }
    }, [])

    const validateDni = useCallback(async (dni: string) => {
        try {
            const response = await EmployeesAPI.validateDni(dni)
            return response
        } catch (error) {
            console.error("Error validating employee DNI:", error)
            throw error
        }
    }, [])

    useEffect(() => {
        loadEmployees()
        getSummary()
    }, [ loadEmployees, getSummary ])

    return {
        employees,
        isLoading,
        summary,
        loadEmployees,
        getEmployeeById,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        getActiveEmployees,
        getSummary,
        filterEmployees,
        getByDepartment,
        getByPosition,
        searchByDni,
        searchByName,
        toggleActive,
        getWithDevices,
        getWithInstallations,
        validateDni
    }
} 