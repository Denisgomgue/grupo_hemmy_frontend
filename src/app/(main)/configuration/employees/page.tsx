"use client"

import * as React from 'react';
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/employees/employee";
import { useEmployees } from "@/hooks/use-employees";
import { useEmployeeFilters } from '@/hooks/use-employee-filters';
import { EmployeeForm } from "./_components/employee-form";
import { ResponsiveTable } from "@/components/dataTable/responsive-table";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ModalContent, ModalBody, ModalHeader, ModalFooter } from "@/components/ui/modal-content";
import { MainContainer } from "@/components/layout/main-container";
import { HeaderActions } from "@/components/layout/header-actions";
import { AddButton } from "@/components/layout/add-button";
import { ReloadButton } from "@/components/layout/reload-button";
import { EmployeeFormData } from "@/schemas/employee-schema";
import { getEmployeeColumns } from "./_components/columns";
import { EmployeeCard } from "./_components/employee-card";
import { ColumnDef } from '@tanstack/react-table';
import { PaginatedCards } from "@/components/dataTable/paginated-cards"
import { ViewModeSwitcher } from "@/components/dataTable/view-mode-switcher"
import { InfoSummaryCards } from "@/components/info-summary-cards"
import { Users, UserCheck, UserX, UserCog } from "lucide-react"
import { useEffect, useState } from "react"
import { TableToolbar } from "@/components/dataTable/table-toolbar"
import { Button } from "@/components/ui/button"
import { AdvancedFilters } from "@/components/dataTable/advanced-filters"
import { useRoles } from "@/hooks/use-role"
import { Role } from "@/types/roles/role"

interface EmployeeSummary {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
}

export default function EmployeesPage() {
    const { toast } = useToast();
    const { employees, isLoading, error, refetch, createEmployee, updateEmployee, deleteEmployee, getEmployeeSummary } = useEmployees();
    const {
        searchTerm, setSearchTerm,
        filters, setFilters,
        currentPage, setCurrentPage,
        pageSize, setPageSize,
        viewMode, setViewMode,
        paginatedEmployees,
        totalRecords
    } = useEmployeeFilters(employees);

    const [ isModalOpen, setIsModalOpen ] = React.useState(false);
    const [ selectedEmployee, setSelectedEmployee ] = React.useState<Employee | null>(null);
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ advancedFilters, setAdvancedFilters ] = useState({});
    const [ isSyncing, setIsSyncing ] = useState(false);
    const formRef = React.useRef<HTMLFormElement>(null);
    const [ formInstance, setFormInstance ] = useState<any>(null);
    const [ summary, setSummary ] = useState<EmployeeSummary>({
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {}
    });
    const [ isLoadingSummary, setIsLoadingSummary ] = useState(true);

    const { roles } = useRoles();

    // Definir los grupos de filtros
    const filterGroups = React.useMemo(() => [
        {
            id: 'roles',
            label: 'Roles',
            type: 'checkbox-group' as const,
            options: roles?.map((role: Role) => ({
                id: role.id.toString(),
                label: role.name
            })) || []
        }
    ], [ roles ]);

    // Cargar resumen de empleados
    useEffect(() => {
        async function fetchSummary() {
            setIsLoadingSummary(true);
            try {
                const data = await getEmployeeSummary();
                setSummary(data);
            } catch (error) {
                console.error('Error loading employee summary:', error);
                // Mantener datos por defecto si falla
                setSummary({
                    total: 0,
                    active: 0,
                    inactive: 0,
                    byRole: {}
                });
            } finally {
                setIsLoadingSummary(false);
            }
        }
        fetchSummary();
    }, []); // Solo ejecutar una vez al montar el componente

    const handleAdd = () => {
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleDelete = async (employeeId: string) => {
        const idAsNumber = parseInt(employeeId, 10);
        if (isNaN(idAsNumber)) {
            console.error("Invalid employee ID for deletion");
            toast({ title: "ID de empleado inválido", variant: "destructive" });
            return;
        }

        try {
            await deleteEmployee(idAsNumber);
            toast({ title: "Empleado eliminado correctamente" });
            refetch();
        } catch (error: any) {
            toast({
                title: "Error al eliminar empleado",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleEmployeeFormSubmitSuccess = async (values: EmployeeFormData) => {
        try {
            setIsSubmitting(true);
            if (selectedEmployee) {
                await updateEmployee(selectedEmployee.id, values);
                toast({ title: "Empleado actualizado correctamente" });
            } else {
                await createEmployee(values);
                toast({ title: "Empleado creado correctamente" });
            }
            setIsModalOpen(false);
            setSelectedEmployee(null);
            refetch();
        } catch (error: any) {
            toast({
                title: `Error al ${selectedEmployee ? "actualizar" : "crear"} empleado`,
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitFromButton = async () => {
        if (formInstance) {
            const values = formInstance.getValues();
            await handleEmployeeFormSubmitSuccess(values);
        }
    };

    const handlePaginationChange = (page: number, newPageSize: number) => {
        setCurrentPage(page);
        setPageSize(newPageSize);
    };

    const handleReload = () => {
        refetch();
        // Recargar resumen
        getEmployeeSummary().then(setSummary).catch(console.error);
    };

    const employeeColumns = React.useMemo((): ColumnDef<Employee>[] => {
        return getEmployeeColumns(handleEdit, handleDelete);
    }, [ handleEdit, handleDelete ]);

    const isFetchingOrMutating = isLoading;

    const handleAdvancedFiltersChange = (newFilters: any) => {
        setAdvancedFilters(newFilters);
        // Actualizar filtros si es necesario
        if (newFilters.roles) {
            const selectedRoleIds = Object.entries(newFilters.roles)
                .filter(([ _, value ]) => value)
                .map(([ key ]) => parseInt(key));
            setFilters({ roleId: selectedRoleIds[ 0 ] });
        }
        setCurrentPage(1);
    };

    // Agregar función para sincronizar datos
    const syncEmployeeData = async () => {
        try {
            setIsSyncing(true);
            // Aquí iría la llamada a la API para sincronizar datos
            // await api.post('/employees/sync');

            // Refrescar los datos
            await Promise.all([
                refetch(),
                getEmployeeSummary().then(setSummary)
            ]);

            toast({
                title: "Datos sincronizados",
                description: "Los datos de los empleados han sido actualizados correctamente.",
            });
        } catch (error) {
            toast({
                title: "Error al sincronizar datos",
                description: "No se pudieron actualizar los datos de los empleados.",
                variant: "destructive",
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <MainContainer>
            <HeaderActions title="Gestión de Empleados">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={syncEmployeeData}
                    disabled={isSyncing}
                    className="gap-2"
                >
                    <UserCog className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Datos'}
                </Button>
                <ReloadButton
                    onClick={handleReload}
                    isLoading={isFetchingOrMutating || isLoadingSummary}
                />
                <AddButton onClick={handleAdd} text="Agregar Empleado" />
            </HeaderActions>

            {/* Cards informativos */}
            <InfoSummaryCards
                cards={[
                    {
                        title: "Total Empleados",
                        value: summary.total || 0,
                        description: "En el sistema",
                        icon: <Users className="h-8 w-8 text-purple-500" />,
                        borderColor: "border-l-purple-500",
                        isLoading: isLoadingSummary
                    },
                    {
                        title: "Empleados Activos",
                        value: summary.active || 0,
                        description: "Con rol asignado",
                        icon: <UserCheck className="h-8 w-8 text-green-500" />,
                        borderColor: "border-l-green-500",
                        isLoading: isLoadingSummary
                    },
                    {
                        title: "Sin Rol Asignado",
                        value: summary.inactive || 0,
                        description: "Pendientes de asignación",
                        icon: <UserX className="h-8 w-8 text-yellow-500" />,
                        borderColor: "border-l-yellow-500",
                        isLoading: isLoadingSummary
                    },
                    {
                        title: "Roles Diferentes",
                        value: Object.keys(summary.byRole || {}).length,
                        description: "Tipos de roles",
                        icon: <UserCog className="h-8 w-8 text-blue-500" />,
                        borderColor: "border-l-blue-500",
                        isLoading: isLoadingSummary
                    }
                ]}
            />

            {/* Selector de vista y barra de herramientas */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <TableToolbar
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        onSearch={() => refetch()}
                        searchPlaceholder="Buscar por nombre, DNI, teléfono..."
                        actions={
                            <>
                                <AdvancedFilters
                                    groups={filterGroups}
                                    onFiltersChange={handleAdvancedFiltersChange}
                                    initialFilters={advancedFilters}
                                />
                                <Button variant="outline">Importar</Button>
                                <Button variant="outline">Exportar</Button>
                            </>
                        }
                    />
                    <ViewModeSwitcher viewMode={viewMode} setViewMode={(mode) => setViewMode(mode as "list" | "grid")} />
                </div>
            </div>

            {viewMode === "list" ? (
                <ResponsiveTable<Employee>
                    data={paginatedEmployees}
                    columns={employeeColumns}
                    headers={[]}
                    isLoading={isFetchingOrMutating}
                    pagination={{
                        onPaginationChange: handlePaginationChange,
                        totalRecords: totalRecords,
                        pageSize: pageSize,
                        currentPage: currentPage
                    }}
                />
            ) : (
                <PaginatedCards
                    data={paginatedEmployees}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    onPaginationChange={handlePaginationChange}
                    renderCard={(employee: Employee) => (
                        <EmployeeCard
                            key={employee.id}
                            employee={employee}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                    isLoading={isFetchingOrMutating}
                />
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} modal={false}>
                <ModalContent
                    size="2xl"
                    maxHeight="90vh"
                    onInteractOutside={(e: any) => {
                        // Previene que el diálogo se cierre al hacer clic dentro de un Select o Popover
                        e.preventDefault();
                    }}
                >
                    <ModalHeader border>
                        <DialogHeader>
                            <DialogTitle>{selectedEmployee ? "Editar Empleado" : "Agregar Empleado"}</DialogTitle>
                            <DialogDescription>
                                {selectedEmployee ? "Modifique los datos del empleado seleccionado" : "Complete el formulario para agregar un nuevo empleado"}
                            </DialogDescription>
                        </DialogHeader>
                    </ModalHeader>
                    <ModalBody>
                        <EmployeeForm
                            employee={selectedEmployee}
                            onSubmit={handleEmployeeFormSubmitSuccess}
                            isLoading={isSubmitting}
                            onCancel={() => {
                                setIsModalOpen(false);
                                setSelectedEmployee(null);
                            }}
                            formRef={formRef}
                            onFormReady={setFormInstance}
                        />
                    </ModalBody>
                    <ModalFooter border>
                        <div className="flex justify-end space-x-3 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedEmployee(null);
                                }}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleSubmitFromButton}
                            >
                                {isSubmitting ? "Guardando..." : selectedEmployee ? "Actualizar" : "Crear"}
                            </Button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Dialog>
        </MainContainer>
    );
} 