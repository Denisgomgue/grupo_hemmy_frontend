"use client"

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/clients/client";
import { useClient } from '@/hooks/use-client';
import api from '@/lib/axios';
import { ClientForm } from "./_components/client-form";
import { ResponsiveTable } from "@/components/responsive-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MainContainer } from "@/components/layout/main-container";
import { HeaderActions } from "@/components/layout/header-actions";
import { AddButton } from "@/components/layout/add-button";
import { ReloadButton } from "@/components/layout/reload-button";
import { ClientFormData } from "@/schemas/client-schema";
import { baseColumns } from "./_components/columns";
import { ClientActionsDropdown } from "./_components/client-actions-dropdown";
import { ClientCard } from "./_components/client-card";
import { ColumnDef } from '@tanstack/react-table';

export default function ClientPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [ isModalOpen, setIsModalOpen ] = React.useState(false);
    const [ selectedClient, setSelectedClient ] = React.useState<Client | null>(null);
    const [ currentPage, setCurrentPage ] = React.useState(1);
    const [ pageSize, setPageSize ] = React.useState(10);
    const [ totalRecords, setTotalRecords ] = React.useState(0);

    const { refreshClient } = useClient();

    const clientsQuery = useQuery<
        { data: Client[]; total: number },
        Error
    >({
        queryKey: [ "clients", currentPage, pageSize ],
        queryFn: () => refreshClient(currentPage, pageSize),
        placeholderData: (previousData) => previousData,
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
            queryClient.invalidateQueries({ queryKey: [ "clients", currentPage, pageSize ] });
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
            queryClient.invalidateQueries({ queryKey: [ "clients", currentPage, pageSize ] });
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
        console.log("handleEdit llamado con:", client);
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

    const handleSave = (values: ClientFormData) => {
        if (selectedClient) {
            updateMutation.mutate({ id: selectedClient.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const handlePaginationChange = (page: number, newPageSize: number) => {
        setCurrentPage(page);
        setPageSize(newPageSize);
    };

    const handleReload = () => {
        clientsQuery.refetch();
    }

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

    return (
        <MainContainer>
            <HeaderActions title="Gestión de Clientes">
                <ReloadButton onClick={handleReload} isLoading={isFetchingOrMutating} />
                <AddButton onClick={handleAdd} text="Agregar Cliente" />
            </HeaderActions>

            <ResponsiveTable<Client>
                data={clientsQuery.data?.data ?? []}
                columns={clientColumns}
                renderCard={(client) => (
                    <ClientCard client={client} onEdit={handleEdit} />
                )}
                isLoading={isFetchingOrMutating}
                onPaginationChange={handlePaginationChange}
                totalRecords={totalRecords}
                pageSize={pageSize}
                currentPage={currentPage}
            />

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} modal={false}>
                <DialogContent
                    className="sm:max-w-2xl"
                    onInteractOutside={(e) => {
                        // Previene que el diálogo se cierre al hacer clic dentro de un Select o Popover
                        e.preventDefault();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>{selectedClient ? 'Editar Cliente' : 'Agregar Cliente'}</DialogTitle>
                    </DialogHeader>
                    <ClientForm
                        client={selectedClient}
                        onSubmit={handleSave}
                        isLoading={isLoadingMutation}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </MainContainer>
    );
}