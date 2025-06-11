"use client"

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/clients/client";
import { Service } from "@/types/services/service";
import { useClient } from '@/hooks/use-client';
import api from '@/lib/axios';
import { ClientForm } from "./_components/client-form";
import { ResponsiveTable } from "@/components/responsive-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MainContainer } from "@/components/layout/main-container";
import { HeaderActions } from "@/components/layout/header-actions";
import { AddButton } from "@/components/layout/add-button";
import { ReloadButton } from "@/components/layout/reload-button";
import { ClientFormData } from "@/schemas/client-schema";
import { baseColumns } from "./_components/columns";
import { ClientActionsDropdown } from "./_components/client-actions-dropdown";
import { ClientCard } from "./_components/client-card";
import { ColumnDef } from '@tanstack/react-table';
import { PaginatedCards } from "@/components/dataTable/paginated-cards"
import { ViewModeSwitcher } from "@/components/dataTable/view-mode-switcher"
import { InfoSummaryCards } from "@/components/info-summary-cards"
import { Users, UserCheck, UserPlus, UserX, Clock, RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { TableToolbar } from "@/components/dataTable/table-toolbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { FilterButton } from "@/components/dataTable/filter-button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { AdvancedFilters } from "@/components/dataTable/advanced-filters"
import { SectorSelector } from "@/components/dataTable/sector-selector"
import { usePlans } from "@/hooks/use-plan"
import { useSectors } from "@/hooks/use-sector"
import { Sector } from "@/types/sectors/sector"

interface ClientSummary {
    totalClientes: number;
    clientesActivos: number;
    clientesVencidos: number;
    clientesPorVencer: number;
    period: string;
}

export default function ClientPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [ isModalOpen, setIsModalOpen ] = React.useState(false);
    const [ selectedClient, setSelectedClient ] = React.useState<Client | null>(null);
    const [ currentPage, setCurrentPage ] = React.useState(1);
    const [ pageSize, setPageSize ] = React.useState(10);
    const [ totalRecords, setTotalRecords ] = React.useState(0);
    const [ viewMode, setViewMode ] = React.useState<"list" | "grid">("list");
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ isLoading, setIsLoading ] = useState(false);
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [ statusFilter, setStatusFilter ] = useState<string>("all");
    const [ selectedSectors, setSelectedSectors ] = useState<string[]>([]);
    const [ advancedFilters, setAdvancedFilters ] = useState({});
    const [ isSyncing, setIsSyncing ] = useState(false);

    const { refreshClient, getClientSummary } = useClient();
    const { maxPrice } = usePlans();
    const { sectors } = useSectors();

    // Query para obtener los servicios
    const servicesQuery = useQuery<Service[]>({
        queryKey: [ 'services' ],
        queryFn: async () => {
            const response = await api.get('/services');
            return response.data;
        }
    });

    // Definir los grupos de filtros
    const filterGroups = React.useMemo(() => [
        {
            id: 'status',
            label: 'Estado del Cliente',
            type: 'checkbox' as const,
            options: [
                { id: 'active', label: 'Activos' },
                { id: 'expired', label: 'Vencidos' },
                { id: 'expiring', label: 'Por vencer' },
                { id: 'suspended', label: 'Suspendidos' }
            ]
        },
        {
            id: 'services',
            label: 'Servicios',
            type: 'checkbox' as const,
            options: servicesQuery.data?.map((service: Service) => ({
                id: service.id.toString(),
                label: service.name
            })) || []
        },
        {
            id: 'sectors',
            label: 'Sectores',
            type: 'checkbox-group' as const,
            options: sectors?.map((sector: Sector) => ({
                id: sector.id.toString(),
                label: sector.name
            })) || []
        },
        {
            id: 'planCost',
            label: 'Costo del Plan',
            type: 'slider' as const,
            range: {
                min: 0,
                max: maxPrice || 500,
                step: 10
            }
        }
    ], [ servicesQuery.data, maxPrice, sectors ]);

    // Query para obtener los clientes
    const clientsQuery = useQuery<{ data: Client[]; total: number }, Error>({
        queryKey: [ "clients", currentPage, pageSize, debouncedSearchTerm, advancedFilters, selectedSectors ],
        queryFn: () => refreshClient(currentPage, pageSize, debouncedSearchTerm, advancedFilters, selectedSectors),
    });

    // Query para obtener el resumen de clientes
    const summaryQuery = useQuery<ClientSummary>({
        queryKey: [ "clientSummary" ],
        queryFn: () => getClientSummary(),
    });

    // Query para obtener clientes nuevos del mes
    const newClientsQuery = useQuery<ClientSummary>({
        queryKey: [ "clientSummary", "thisMonth" ],
        queryFn: () => getClientSummary("thisMonth"),
        initialData: {
            totalClientes: 0,
            clientesActivos: 0,
            clientesVencidos: 0,
            clientesPorVencer: 0,
            period: "thisMonth"
        }
    });

    React.useEffect(() => {
        if (clientsQuery.data) {
            setTotalRecords(clientsQuery.data.total);
        }
    }, [ clientsQuery.data ]);

    const createClientFn = async (data: ClientFormData) => {
        const response = await api.post('/client', data);
        return response.data;
    };

    const updateClientFn = async ({ id, data }: { id: number, data: ClientFormData }) => {
        const response = await api.patch(`/client/${id}`, data);
        return response.data;
    };

    const deleteClientFn = async (id: number) => {
        const response = await api.delete(`/client/${id}`);
        return response.data;
    };

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ "clients" ] });
            queryClient.invalidateQueries({ queryKey: [ "clientSummary" ] });
            setIsModalOpen(false);
            setSelectedClient(null);
            toast({
                title: `Cliente ${selectedClient ? "actualizado" : "creado"} correctamente`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: `Error al ${selectedClient ? "actualizar" : "crear"} cliente`,
                description: error.message,
                variant: "destructive",
            });
        },
    };

    const createMutation = useMutation<unknown, Error, ClientFormData>({
        mutationFn: createClientFn,
        ...mutationOptions,
    });

    const updateMutation = useMutation<unknown, Error, { id: number; data: ClientFormData }>({
        mutationFn: updateClientFn,
        ...mutationOptions,
    });

    const deleteMutation = useMutation<unknown, Error, number>({
        mutationFn: deleteClientFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ "clients" ] });
            queryClient.invalidateQueries({ queryKey: [ "clientSummary" ] });
            toast({
                title: "Cliente eliminado correctamente",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error al eliminar cliente",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleAdd = () => {
        setSelectedClient(null);
        setIsModalOpen(true);
    };

    const handleEdit = (client: Client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleDelete = (clientId: string) => {
        const idAsNumber = parseInt(clientId, 10);
        if (isNaN(idAsNumber)) {
            console.error("Invalid client ID for deletion");
            toast({ title: "ID de cliente inválido", variant: "destructive" });
            return;
        }
        deleteMutation.mutate(idAsNumber);
    };

    // Nueva función para pasar a ClientForm como onSubmit
    const handleClientFormSubmitSuccess = (values: ClientFormData) => {
        queryClient.invalidateQueries({ queryKey: [ "clients" ] });
        queryClient.invalidateQueries({ queryKey: [ "clientSummary" ] });
        setIsModalOpen(false); // Cerrar el modal
        setSelectedClient(null); // Limpiar el cliente seleccionado
        console.log("ClientPage: handleClientFormSubmitSuccess, modal closed, queries invalidated.", values);
    };

    const handlePaginationChange = (page: number, newPageSize: number) => {
        setCurrentPage(page);
        setPageSize(newPageSize);
    };

    const handleReload = () => {
        clientsQuery.refetch();
        summaryQuery.refetch();
        newClientsQuery.refetch();
    };

    const clientColumns = React.useMemo((): ColumnDef<Client>[] => {
        const columnsBase = baseColumns;

        return [
            ...columnsBase,
            {
                id: "actions",
                header: "Opciones",
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <ClientActionsDropdown client={row.original} onEdit={handleEdit} />
                    </div>
                ),
            },
        ];
    }, [ handleEdit ]);

    const isLoadingMutation = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
    const isFetchingOrMutating = clientsQuery.isFetching || isLoadingMutation;

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleAdvancedFiltersChange = (newFilters: any) => {
        setAdvancedFilters(newFilters);
        // Extraer los sectores seleccionados de los filtros avanzados
        const selectedSectorIds = newFilters.sectors ?
            Object.entries(newFilters.sectors)
                .filter(([ _, value ]) => value)
                .map(([ key ]) => key)
            : [];
        setSelectedSectors(selectedSectorIds);
        setCurrentPage(1);
    };

    // Agregar función para sincronizar estados
    const syncClientStates = async () => {
        try {
            setIsSyncing(true);
            await api.post('/client/sync-states');

            // Refrescar los datos
            await Promise.all([
                clientsQuery.refetch(),
                summaryQuery.refetch(),
                newClientsQuery.refetch()
            ]);

            toast({
                title: "Estados sincronizados",
                description: "Los estados de los clientes han sido actualizados correctamente.",
            });
        } catch (error) {
            toast({
                title: "Error al sincronizar estados",
                description: "No se pudieron actualizar los estados de los clientes.",
                variant: "destructive",
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <MainContainer>
            <HeaderActions title="Gestión de Clientes">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={syncClientStates}
                    disabled={isSyncing}
                    className="gap-2"
                >
                    <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Estados'}
                </Button>
                <ReloadButton
                    onClick={handleReload}
                    isLoading={isFetchingOrMutating || summaryQuery.isFetching}
                />
                <AddButton onClick={handleAdd} text="Agregar Cliente" />
            </HeaderActions>

            {/* Cards informativos actualizados */}
            <InfoSummaryCards
                cards={[
                    {
                        title: "Total Clientes",
                        value: summaryQuery.data?.totalClientes || 0,
                        description: "En el sistema",
                        icon: <Users className="h-8 w-8 text-purple-500" />,
                        borderColor: "border-l-purple-500",
                        isLoading: summaryQuery.isLoading || summaryQuery.isFetching
                    },
                    {
                        title: "Clientes Activos",
                        value: summaryQuery.data?.clientesActivos || 0,
                        description: "Al día con sus pagos",
                        icon: <UserCheck className="h-8 w-8 text-green-500" />,
                        borderColor: "border-l-green-500",
                        isLoading: summaryQuery.isLoading || summaryQuery.isFetching
                    },
                    {
                        title: "Clientes Vencidos",
                        value: summaryQuery.data?.clientesVencidos || 0,
                        description: "Con pagos vencidos",
                        icon: <UserX className="h-8 w-8 text-red-500" />,
                        borderColor: "border-l-red-500",
                        isLoading: summaryQuery.isLoading || summaryQuery.isFetching
                    },
                    {
                        title: "Por Vencer",
                        value: summaryQuery.data?.clientesPorVencer || 0,
                        description: "Próximos a vencer",
                        icon: <Clock className="h-8 w-8 text-yellow-500" />,
                        borderColor: "border-l-yellow-500",
                        isLoading: summaryQuery.isLoading || summaryQuery.isFetching
                    }
                ]}
            />

            {/* Selector de vista y barra de herramientas */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <TableToolbar
                        value={searchTerm}
                        onValueChange={handleSearch}
                        onSearch={() => clientsQuery.refetch()}
                        searchPlaceholder="Buscar por DNI, nombre o apellidos..."
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
                <ResponsiveTable<Client>
                    data={clientsQuery.data?.data ?? []}
                    columns={clientColumns}
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
                    data={clientsQuery.data?.data ?? []}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    onPaginationChange={handlePaginationChange}
                    renderCard={(client) => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onEdit={handleEdit}
                        />
                    )}
                    isLoading={isFetchingOrMutating}
                />
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} modal={false}>
                <DialogContent
                    className="sm:max-w-2xl"
                    onInteractOutside={(e) => {
                        // Previene que el diálogo se cierre al hacer clic dentro de un Select o Popover
                        e.preventDefault();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>{selectedClient ? "Editar Cliente" : "Agregar Cliente"}</DialogTitle>
                        <DialogDescription>
                            {selectedClient ? "Modifique los datos del cliente seleccionado" : "Complete el formulario para agregar un nuevo cliente"}
                        </DialogDescription>
                    </DialogHeader>
                    <ClientForm
                        client={selectedClient}
                        onSubmit={handleClientFormSubmitSuccess}
                        isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
                        onCancel={() => {
                            setIsModalOpen(false);
                            setSelectedClient(null);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </MainContainer>
    );
}