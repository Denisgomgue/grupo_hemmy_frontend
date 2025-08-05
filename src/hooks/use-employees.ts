import { useState, useEffect } from "react"
import { Employee, CreateEmployeeData, UpdateEmployeeData, EmployeeSummary } from "@/types/employees/employee"
import { api } from "@/lib/axios"
import { useAuth } from "@/contexts/AuthContext"

function mapEmployeeFromApi(apiEmployee: any): Employee {
    return {
        id: apiEmployee.id,
        name: apiEmployee.name,
        lastName: apiEmployee.lastName,
        dni: apiEmployee.dni,
        phone: apiEmployee.phone,
        roleId: apiEmployee.roleId,
        role: apiEmployee.role,
        created_at: new Date(apiEmployee.created_at),
        updated_at: new Date(apiEmployee.updated_at),
    }
}

export function useEmployees() {
    const [ employees, setEmployees ] = useState<Employee[]>([])
    const [ isLoading, setIsLoading ] = useState(true)
    const [ error, setError ] = useState<string | null>(null)
    const { user } = useAuth()

    const fetchEmployees = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await api.get("/employees")
            setEmployees(response.data.map(mapEmployeeFromApi))
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al cargar empleados")
        } finally {
            setIsLoading(false)
        }
    }

    const createEmployee = async (employeeData: CreateEmployeeData): Promise<Employee> => {
        try {
            const response = await api.post("/employees", employeeData)
            await fetchEmployees()
            return mapEmployeeFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al crear empleado")
        }
    }

    const updateEmployee = async (id: number, employeeData: UpdateEmployeeData): Promise<Employee> => {
        try {
            const response = await api.patch(`/employees/${id}`, employeeData)
            await fetchEmployees()
            return mapEmployeeFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al actualizar empleado")
        }
    }

    const deleteEmployee = async (id: number): Promise<void> => {
        try {
            await api.delete(`/employees/${id}`)
            await fetchEmployees()
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al eliminar empleado")
        }
    }

    const getEmployeeById = async (id: number): Promise<Employee> => {
        try {
            const response = await api.get(`/employees/${id}`)
            return mapEmployeeFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al obtener empleado")
        }
    }

    const getEmployeesByRole = async (roleId: number): Promise<Employee[]> => {
        try {
            const response = await api.get(`/employees/role/${roleId}`)
            return response.data.map(mapEmployeeFromApi)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al obtener empleados por rol")
        }
    }

    const getEmployeeByDni = async (dni: string): Promise<Employee> => {
        try {
            const response = await api.get(`/employees/dni/${dni}`)
            return mapEmployeeFromApi(response.data)
        } catch (err: any) {
            throw new Error(err.response?.data?.message || "Error al obtener empleado por DNI")
        }
    }

    const getEmployeeSummary = async (): Promise<EmployeeSummary> => {
        try {
            const response = await api.get("/employees/summary")
            return response.data
        } catch (err: any) {
            console.error("Error fetching employee summary:", err)
            // Retornar datos por defecto si falla
            return {
                total: 0,
                active: 0,
                inactive: 0,
                byRole: {}
            }
        }
    }

    useEffect(() => {
        if (user) {
            fetchEmployees()
        }
    }, [ user ])

    return {
        employees,
        isLoading,
        error,
        refetch: fetchEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeeById,
        getEmployeesByRole,
        getEmployeeByDni,
        getEmployeeSummary
    }
} 