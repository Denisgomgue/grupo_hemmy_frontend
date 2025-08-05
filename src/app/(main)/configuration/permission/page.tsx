"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/use-permissions"
import { usePermissionFilters } from "@/hooks/use-permission-filters"
import { Permission, CreatePermissionData, UpdatePermissionData } from "@/types/permissions/permission"
import { MainContainer } from "@/components/layout/main-container"
import { HeaderActions } from "@/components/layout/header-actions"
import { AddButton } from "@/components/layout/add-button"
import { ReloadButton } from "@/components/layout/reload-button"
import { InfoSummaryCards } from "@/components/info-summary-cards"
import { GeneralTable } from "@/components/dataTable/table"
import { PermissionCard } from "./_components/permission-card"
import { PermissionForm } from "./_components/permission-form"
import { getPermissionColumns } from "./_components/columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import {
    Shield,
    Eye,
    Edit,
    Trash2,
    Search,
    Filter,
    Grid3X3,
    List,
    Settings,
    Users,
    Route,
    CheckCircle,
    XCircle
} from "lucide-react"

interface PermissionSummary {
    total: number;
    active: number;
    inactive: number;
    subRoutes: number;
    mainRoutes: number;
    permissionsWithActions: number;
    permissionsWithoutActions: number;
}

export default function PermissionPage() {
    const router = useRouter()
    const { toast } = useToast()

    // Estados del hook de permisos
    const {
        permissions,
        isLoading,
        error,
        refetch,
        createPermission,
        updatePermission,
        deletePermission,
        getPermissionSummary
    } = usePermissions()

    // Estados de filtros
    const {
        searchTerm,
        setSearchTerm,
        updateFilters,
        clearFilters,
        currentPage,
        pageSize,
        totalPages,
        paginatedPermissions,
        goToPage,
        changePageSize,
    } = usePermissionFilters(permissions)

    // Estados locales
    const [ viewMode, setViewMode ] = useState<"grid" | "table">("table")
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ selectedPermission, setSelectedPermission ] = useState<Permission | null>(null)
    const [ isSubmitting, setIsSubmitting ] = useState(false)
    const [ summary, setSummary ] = useState<PermissionSummary>({
        total: 0,
        active: 0,
        inactive: 0,
        subRoutes: 0,
        mainRoutes: 0,
        permissionsWithActions: 0,
        permissionsWithoutActions: 0
    })
    const [ isLoadingSummary, setIsLoadingSummary ] = useState(true)
    const [ isSyncing, setIsSyncing ] = useState(false)
    const [ advancedFilters, setAdvancedFilters ] = useState<any>({})
    const [ formInstance, setFormInstance ] = useState<any>(null)

    // Cargar resumen al montar el componente
    useEffect(() => {
        async function fetchSummary() {
            setIsLoadingSummary(true);
            try {
                const data = await getPermissionSummary();
                setSummary(data);
            } catch (error) {
                console.error('Error loading permission summary:', error);
            } finally {
                setIsLoadingSummary(false);
            }
        }
        fetchSummary();
    }, []); // Solo ejecutar una vez al montar el componente

    const handleAdd = () => {
        setSelectedPermission(null);
        setIsModalOpen(true);
    };

    const handleEdit = (permission: Permission) => {
        setSelectedPermission(permission);
        setIsModalOpen(true);
    };

    const handleDelete = async (permissionId: string) => {
        const idAsNumber = parseInt(permissionId, 10);
        if (isNaN(idAsNumber)) {
            console.error("Invalid permission ID for deletion");
            toast({ title: "ID de permiso inválido", variant: "destructive" });
            return;
        }

        try {
            await deletePermission(idAsNumber);
            toast({ title: "Permiso eliminado correctamente" });
            refetch();
        } catch (error: any) {
            toast({
                title: "Error al eliminar permiso",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleView = (permission: Permission) => {
        router.push(`/configuration/permission/${permission.id}`);
    };

    const handlePermissionFormSubmitSuccess = async (values: any) => {
        try {
            setIsSubmitting(true);
            if (selectedPermission) {
                await updatePermission(selectedPermission.id, values);
                toast({ title: "Permiso actualizado correctamente" });
            } else {
                await createPermission(values);
                toast({ title: "Permiso creado correctamente" });
            }
            setIsModalOpen(false);
            setSelectedPermission(null);
            refetch();
        } catch (error: any) {
            toast({
                title: `Error al ${selectedPermission ? "actualizar" : "crear"} permiso`,
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
            await handlePermissionFormSubmitSuccess(values);
        }
    };

    const handlePaginationChange = (page: number, newPageSize: number) => {
        goToPage(page);
        changePageSize(newPageSize);
    };

    const handleReload = () => {
        refetch();
        // Recargar resumen
        getPermissionSummary().then(setSummary).catch(console.error);
    };

    const permissionColumns = React.useMemo((): any[] => {
        return getPermissionColumns({ onEdit: handleEdit, onDelete: handleDelete, onView: handleView });
    }, [ handleEdit, handleDelete, handleView ]);

    const isFetchingOrMutating = isLoading;

    const handleAdvancedFiltersChange = (newFilters: any) => {
        setAdvancedFilters(newFilters);
        // Actualizar filtros si es necesario
        if (newFilters.type) {
            if (newFilters.type === 'subroute') {
                updateFilters({ isSubRoute: true });
            } else if (newFilters.type === 'main') {
                updateFilters({ isSubRoute: false });
            } else {
                updateFilters({ isSubRoute: undefined });
            }
        }
        if (newFilters.hasActions) {
            updateFilters({ hasActions: newFilters.hasActions === 'yes' });
        }
        if (newFilters.hasRestrictions) {
            updateFilters({ hasRestrictions: newFilters.hasRestrictions === 'yes' });
        }
        goToPage(1);
    };

    // Agregar función para sincronizar datos
    const syncPermissionData = async () => {
        try {
            setIsSyncing(true);
            // Aquí iría la llamada a la API para sincronizar datos
            // await api.post('/permissions/sync');

            // Refrescar los datos
            await Promise.all([
                refetch(),
                getPermissionSummary().then(setSummary)
            ]);

            toast({
                title: "Datos sincronizados",
                description: "Los datos de los permisos han sido actualizados correctamente.",
            });
        } catch (error) {
            toast({
                title: "Error al sincronizar datos",
                description: "No se pudieron actualizar los datos de los permisos.",
                variant: "destructive",
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <MainContainer>
            <HeaderActions title="Gestión de Permisos">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={syncPermissionData}
                    disabled={isSyncing}
                    className="gap-2"
                >
                    <Settings className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Datos'}
                </Button>
                <ReloadButton
                    onClick={handleReload}
                    isLoading={isFetchingOrMutating || isLoadingSummary}
                />
                <AddButton onClick={handleAdd} text="Agregar Permiso" />
            </HeaderActions>

            {/* Cards informativos */}
            <InfoSummaryCards
                cards={[
                    {
                        title: "Total Permisos",
                        value: summary.total || 0,
                        description: "En el sistema",
                        icon: <Shield className="h-8 w-8 text-blue-500" />,
                        borderColor: "border-l-blue-500",
                        isLoading: isLoadingSummary
                    },
                    {
                        title: "Permisos Activos",
                        value: summary.active || 0,
                        description: "Con acciones definidas",
                        icon: <CheckCircle className="h-8 w-8 text-green-500" />,
                        borderColor: "border-l-green-500",
                        isLoading: isLoadingSummary
                    },
                    {
                        title: "Rutas Principales",
                        value: summary.mainRoutes || 0,
                        description: "Permisos principales",
                        icon: <Route className="h-8 w-8 text-purple-500" />,
                        borderColor: "border-l-purple-500",
                        isLoading: isLoadingSummary
                    },
                    {
                        title: "Con Acciones",
                        value: summary.permissionsWithActions || 0,
                        description: "Permisos configurados",
                        icon: <Users className="h-8 w-8 text-yellow-500" />,
                        borderColor: "border-l-yellow-500",
                        isLoading: isLoadingSummary
                    }
                ]}
            />

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar permisos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-full sm:w-64"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Limpiar
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                    >
                        <Grid3X3 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Contenido principal */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "table")}>
                        <TabsContent value="table" className="space-y-4">
          <GeneralTable
            columns={permissionColumns}
            data={paginatedPermissions}
            isLoading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalRecords={paginatedPermissions.length}
            onPaginationChange={handlePaginationChange}
          />
        </TabsContent>

                <TabsContent value="grid" className="space-y-4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedPermissions.map((permission) => (
                                <PermissionCard
                                    key={permission.id}
                                    permission={permission}
                                    onView={handleView}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Modal de formulario */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedPermission ? "Editar Permiso" : "Crear Nuevo Permiso"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <PermissionForm
                            initialData={selectedPermission || undefined}
                            onSubmit={handlePermissionFormSubmitSuccess}
                            isLoading={isSubmitting}
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t">
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
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Manejo de errores */}
            {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span className="text-destructive">{error}</span>
                    </div>
                </div>
            )}
        </MainContainer>
    )
} 