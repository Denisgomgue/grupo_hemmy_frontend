"use client"

import * as React from 'react';
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/users/user";
import { useUsers } from "@/hooks/use-users";
import { useUserFilters } from '@/hooks/use-user-filters';
import { UserForm } from "./_components/user-form";
import { ResponsiveTable } from "@/components/dataTable/responsive-table";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ModalContent, ModalBody, ModalHeader, ModalFooter } from "@/components/ui/modal-content";
import { MainContainer } from "@/components/layout/main-container";
import { HeaderActions } from "@/components/layout/header-actions";
import { AddButton } from "@/components/layout/add-button";
import { ReloadButton } from "@/components/layout/reload-button";
import { UserFormData } from "@/schemas/user-schema";
import { getUserColumns } from "./_components/columns";
import { UserCard } from "./_components/user-card";
import { ColumnDef } from '@tanstack/react-table';
import { PaginatedCards } from "@/components/dataTable/paginated-cards"
import { ViewModeSwitcher } from "@/components/dataTable/view-mode-switcher"
import { InfoSummaryCards } from "@/components/info-summary-cards"
import { Users, UserCheck, UserX, Shield, Clock, RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { TableToolbar } from "@/components/dataTable/table-toolbar"
import { Button } from "@/components/ui/button"
import { AdvancedFilters } from "@/components/dataTable/advanced-filters"
import { useRoles } from "@/hooks/use-roles"
import { Role } from "@/types/roles/role"

interface UserSummary {
    total: number;
    active: number;
    inactive: number;
    withRole: number;
    withoutRole: number;
    verified: number;
    unverified: number;
}

export default function UsersPage() {
    const { toast } = useToast();
    const { users, isLoading, error, refetch, createUser, updateUser, deleteUser, getUserSummary } = useUsers();
    const {
        searchTerm, setSearchTerm,
        filters, setFilters,
        currentPage, setCurrentPage,
        pageSize, setPageSize,
        viewMode, setViewMode,
        paginatedUsers,
        totalRecords
    } = useUserFilters(users);

    const [ isModalOpen, setIsModalOpen ] = React.useState(false);
    const [ selectedUser, setSelectedUser ] = React.useState<User | null>(null);
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ advancedFilters, setAdvancedFilters ] = useState({});
    const [ isSyncing, setIsSyncing ] = useState(false);
    const formRef = React.useRef<HTMLFormElement>(null);
    const [ formInstance, setFormInstance ] = useState<any>(null);
    const [ summary, setSummary ] = useState<UserSummary>({
        total: 0,
        active: 0,
        inactive: 0,
        withRole: 0,
        withoutRole: 0,
        verified: 0,
        unverified: 0
    });
    const [ isLoadingSummary, setIsLoadingSummary ] = useState(true);

    const { roles } = useRoles();

    // Definir los grupos de filtros
    const filterGroups = React.useMemo(() => [
        {
            id: 'status',
            label: 'Estado del Usuario',
            type: 'checkbox' as const,
            options: [
                { id: 'active', label: 'Activos' },
                { id: 'inactive', label: 'Inactivos' }
            ]
        },
        {
            id: 'roles',
            label: 'Roles',
            type: 'checkbox-group' as const,
            options: roles?.map((role: Role) => ({
                id: role.id.toString(),
                label: role.name
            })) || []
        },
        {
            id: 'documentType',
            label: 'Tipo de Documento',
            type: 'checkbox' as const,
            options: [
                { id: 'DNI', label: 'DNI' },
                { id: 'CE', label: 'Carné de Extranjería' },
                { id: 'PASSPORT', label: 'Pasaporte' },
                { id: 'RUC', label: 'RUC' },
                { id: 'OTHER', label: 'Otro' }
            ]
        }
    ], [ roles ]);

    // Cargar resumen de usuarios
    useEffect(() => {
        async function fetchSummary() {
            setIsLoadingSummary(true);
            try {
                const data = await getUserSummary();
                setSummary(data);
            } catch (error) {
                console.error('Error loading user summary:', error);
            } finally {
                setIsLoadingSummary(false);
            }
        }
        fetchSummary();
    }, []); // Solo ejecutar una vez al montar el componente

    const handleAdd = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (userId: string) => {
        const idAsNumber = parseInt(userId, 10);
        if (isNaN(idAsNumber)) {
            console.error("Invalid user ID for deletion");
            toast({ title: "ID de usuario inválido", variant: "destructive" });
            return;
        }

        try {
            await deleteUser(idAsNumber);
            toast({ title: "Usuario eliminado correctamente" });
            refetch();
        } catch (error: any) {
            toast({
                title: "Error al eliminar usuario",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleUserFormSubmitSuccess = async (values: UserFormData) => {
        try {
            setIsSubmitting(true);
            if (selectedUser) {
                await updateUser(selectedUser.id, values);
                toast({ title: "Usuario actualizado correctamente" });
            } else {
                await createUser(values);
                toast({ title: "Usuario creado correctamente" });
            }
            setIsModalOpen(false);
            setSelectedUser(null);
            refetch();
        } catch (error: any) {
            toast({
                title: `Error al ${selectedUser ? "actualizar" : "crear"} usuario`,
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
            await handleUserFormSubmitSuccess(values);
        }
    };

    const handlePaginationChange = (page: number, newPageSize: number) => {
        setCurrentPage(page);
        setPageSize(newPageSize);
    };

    const handleReload = () => {
        refetch();
        // Recargar resumen
        getUserSummary().then(setSummary).catch(console.error);
    };

    const handleAdvancedFiltersChange = (newFilters: any) => {
        setAdvancedFilters(newFilters);
        // Aquí puedes implementar la lógica para aplicar los filtros avanzados
        console.log('Advanced filters changed:', newFilters);
    };

    const syncUserStates = async () => {
        setIsSyncing(true);
        try {
            // Aquí puedes implementar la lógica para sincronizar estados de usuarios
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulación
            toast({ title: "Estados de usuarios sincronizados" });
        } catch (error) {
            toast({
                title: "Error al sincronizar estados",
                variant: "destructive"
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const columns = React.useMemo<ColumnDef<User>[]>(() => getUserColumns(
        handleEdit,
        handleDelete
    ), [ handleEdit, handleDelete ]);

    const summaryCards = [
        {
            title: "Total Usuarios",
            value: summary.total,
            icon: <Users className="h-8 w-8 text-blue-500" />,
            description: `${summary.active} activos, ${summary.inactive} inactivos`,
            trend: "up",
            trendValue: "+12%"
        },
        {
            title: "Usuarios Activos",
            value: summary.active,
            icon: <UserCheck className="h-8 w-8 text-green-500" />,
            description: `${summary.verified} verificados`,
            trend: "up",
            trendValue: "+8%"
        },
        {
            title: "Con Roles",
            value: summary.withRole,
            icon: <Shield className="h-8 w-8 text-purple-500" />,
            description: `${summary.withoutRole} sin rol asignado`,
            trend: "up",
            trendValue: "+15%"
        },
        {
            title: "Pendientes",
            value: summary.unverified,
            icon: <Clock className="h-8 w-8 text-orange-500" />,
            description: "Pendientes de verificación",
            trend: "down",
            trendValue: "-5%"
        }
    ];

    if (error) {
        return (
            <MainContainer>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">Error: {error}</p>
                        <Button onClick={handleReload}>Reintentar</Button>
                    </div>
                </div>
            </MainContainer>
        );
    }

    return (
        <MainContainer>
            <HeaderActions
                title="Gestión de Usuarios"
                description="Administra los usuarios del sistema y sus permisos"
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={syncUserStates}
                    disabled={isSyncing}
                >
                    <RefreshCcw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? "Sincronizando..." : "Sincronizar"}
                </Button>
                <ReloadButton onClick={handleReload} isLoading={isLoading} />
                <AddButton onClick={handleAdd} />
            </HeaderActions>

            <InfoSummaryCards
                cards={summaryCards}
                isLoading={isLoadingSummary}
            />

            <div className="space-y-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <TableToolbar
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            onSearch={() => refetch()}
                            searchPlaceholder="Buscar por nombre, email, username..."
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
                        <ViewModeSwitcher viewMode={viewMode} setViewMode={(mode) => setViewMode(mode as "table" | "grid")} />
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <ResponsiveTable
                        columns={columns}
                        headers={[]}
                        data={paginatedUsers}
                        isLoading={isLoading}
                        pagination={{
                            onPaginationChange: handlePaginationChange,
                            totalRecords: totalRecords,
                            pageSize: pageSize,
                            currentPage: currentPage
                        }}
                    />
                ) : (
                    <PaginatedCards
                        data={paginatedUsers}
                        totalRecords={totalRecords}
                        pageSize={pageSize}
                        onPaginationChange={handlePaginationChange}
                        renderCard={(user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onEdit={() => handleEdit(user)}
                                onDelete={() => handleDelete(user.id.toString())}
                            />
                        )}
                        isLoading={isLoading}
                    />
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogHeader>
                    <DialogTitle>
                        {selectedUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
                    </DialogTitle>
                    <DialogDescription>
                        {selectedUser
                            ? "Modifica la información del usuario seleccionado."
                            : "Completa la información para crear un nuevo usuario."
                        }
                    </DialogDescription>
                </DialogHeader>
                <ModalContent>
                    <ModalBody>
                        <UserForm
                            user={selectedUser}
                            onSubmit={handleUserFormSubmitSuccess}
                            isLoading={isSubmitting}
                            isEdit={!!selectedUser}
                            onFormReady={setFormInstance}
                            formRef={formRef}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmitFromButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Guardando..." : (selectedUser ? "Actualizar" : "Crear")}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Dialog>
        </MainContainer>
    );
} 