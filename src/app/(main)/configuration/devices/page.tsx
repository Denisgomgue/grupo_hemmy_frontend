"use client"

import * as React from 'react';
import { useToast } from "@/hooks/use-toast";
import { Device, DeviceType, DeviceStatus, DeviceUseType } from "@/types/devices/device";
import { useDevices } from "@/hooks/use-devices";
import { useDeviceFilters } from '@/hooks/use-device-filters';
import { DeviceForm } from "./_components/device-form";
import { ResponsiveTable } from "@/components/dataTable/responsive-table";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ModalContent, ModalBody, ModalHeader, ModalFooter } from "@/components/ui/modal-content";
import { MainContainer } from "@/components/layout/main-container";
import { HeaderActions } from "@/components/layout/header-actions";
import { AddButton } from "@/components/layout/add-button";
import { ReloadButton } from "@/components/layout/reload-button";
import { DeviceFormData } from "@/schemas/device-schema";
import { getDeviceColumns } from "./_components/columns";
import { OrderSelector } from "./_components/order-selector";
import { EquipmentModal } from "./_components/equipment-modal";

import { DeviceCard } from "./_components/device-card";
import { ColumnDef } from '@tanstack/react-table';
import { PaginatedCards } from "@/components/dataTable/paginated-cards"
import { ViewModeSwitcher } from "@/components/dataTable/view-mode-switcher"
import { InfoSummaryCards } from "@/components/info-summary-cards"
import { Wifi, WifiOff, Settings, AlertTriangle, Clock, RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { TableToolbar } from "@/components/dataTable/table-toolbar"
import { Button } from "@/components/ui/button"
import { AdvancedFilters } from "@/components/dataTable/advanced-filters"
import { useSectors } from "@/hooks/use-sector"
import { Sector } from "@/types/sectors/sector"
import { useResponsiveDualView } from "@/hooks/use-responsive-view"

interface DeviceSummary {
    total: number;
    active: number;
    stock: number;
    maintenance: number;
    error: number;
    inactive: number;
}

export default function DevicesPage() {
    const { toast } = useToast();
    const {
        devices,
        isLoading,
        error,
        refetch,
        createDevice,
        updateDevice,
        deleteDevice,
        getDeviceSummary,
        orderBy,
        orderDirection,
        changeOrder
    } = useDevices();
    const {
        searchTerm, setSearchTerm,
        filters, setFilters,

        currentPage, setCurrentPage,
        pageSize, setPageSize,
        viewMode, setViewMode,
        paginatedDevices,
        totalRecords
    } = useDeviceFilters(devices);

    const [ isModalOpen, setIsModalOpen ] = React.useState(false);
    const [ selectedDevice, setSelectedDevice ] = React.useState<Device | null>(null);
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ isViewModalOpen, setIsViewModalOpen ] = useState(false);
    const [ deviceToView, setDeviceToView ] = useState<Device | null>(null);
    const [ advancedFilters, setAdvancedFilters ] = useState({});
    const [ isSyncing, setIsSyncing ] = useState(false);
    const formRef = React.useRef<HTMLFormElement>(null);
    const [ formInstance, setFormInstance ] = useState<any>(null);
    const [ summary, setSummary ] = useState<DeviceSummary>({
        total: 0,
        active: 0,
        stock: 0,
        maintenance: 0,
        error: 0,
        inactive: 0
    });
    const [ isLoadingSummary, setIsLoadingSummary ] = useState(true);

    const { sectors } = useSectors();
    const { deviceType, isDesktop, showViewSelector, recommendedView } = useResponsiveDualView();

    // Vista automática basada en el tamaño de pantalla
    React.useEffect(() => {
        if (!isDesktop) {
            setViewMode('grid'); // En dispositivos no-desktop, siempre cards
        } else {
            setViewMode('list'); // En desktop, tabla por defecto
        }
    }, [ isDesktop ]);

    // Definir los grupos de filtros
    const filterGroups = React.useMemo(() => [
        {
            id: 'status',
            label: 'Estado del Dispositivo',
            type: 'checkbox' as const,
            options: [
                { id: 'assigned', label: 'Asignados' },
                { id: 'stock', label: 'En Stock' },
                { id: 'maintenance', label: 'En Mantenimiento' },
                { id: 'damaged', label: 'Dañados' },
                { id: 'lost', label: 'Perdidos' }
            ]
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
            id: 'deviceType',
            label: 'Tipo de Dispositivo',
            type: 'checkbox' as const,
            options: [
                { id: 'router', label: 'Routers' },
                { id: 'deco', label: 'Decos' },
                { id: 'ont', label: 'ONTs' },
                { id: 'switch', label: 'Switches' },
                { id: 'repat', label: 'Repetidores' },
                { id: 'herramienta', label: 'Herramientas' }
            ]
        }
    ], [ sectors ]);

    // Cargar resumen de dispositivos
    useEffect(() => {
        async function fetchSummary() {
            setIsLoadingSummary(true);
            try {
                const data = await getDeviceSummary();
                setSummary(data);
            } catch (error) {
                console.error('Error loading device summary:', error);
            } finally {
                setIsLoadingSummary(false);
            }
        }
        fetchSummary();
    }, []); // Solo ejecutar una vez al montar el componente

    const handleAdd = () => {
        setSelectedDevice(null);
        setIsModalOpen(true);
    };

    const handleEdit = (device: Device) => {
        setSelectedDevice(device);
        setIsModalOpen(true);
    };

    const handleDelete = async (deviceId: string) => {
        const idAsNumber = parseInt(deviceId, 10);
        if (isNaN(idAsNumber)) {
            console.error("Invalid device ID for deletion");
            toast({ title: "ID de dispositivo inválido", variant: "destructive" });
            return;
        }

        try {
            await deleteDevice(idAsNumber);
            toast({ title: "Dispositivo eliminado correctamente" });
            refetch();
        } catch (error: any) {
            toast({
                title: "Error al eliminar dispositivo",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleView = (device: Device) => {
        setDeviceToView(device);
        setIsViewModalOpen(true);
    };

    const handleDeviceFormSubmitSuccess = async (values: DeviceFormData | Omit<DeviceFormData, 'serialNumber'>) => {
        try {
            setIsSubmitting(true);
            if (selectedDevice) {
                await updateDevice(selectedDevice.id, values);
                toast({ title: "Dispositivo actualizado correctamente" });
            } else {
                await createDevice(values as DeviceFormData);
                toast({ title: "Dispositivo creado correctamente" });
            }
            setIsModalOpen(false);
            setSelectedDevice(null);
            refetch();
        } catch (error: any) {
            toast({
                title: `Error al ${selectedDevice ? "actualizar" : "crear"} dispositivo`,
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
            await handleDeviceFormSubmitSuccess(values);
        }
    };

    const handlePaginationChange = (page: number, newPageSize: number) => {
        setCurrentPage(page);
        setPageSize(newPageSize);
    };

    const handleReload = () => {
        refetch();
        // Recargar resumen
        getDeviceSummary().then(setSummary).catch(console.error);
    };

    const deviceColumns = React.useMemo((): ColumnDef<Device>[] => {
        return getDeviceColumns(handleEdit, handleDelete, handleView);
    }, [ handleEdit, handleDelete, handleView ]);

    const isFetchingOrMutating = isLoading;

    const handleAdvancedFiltersChange = (newFilters: any) => {
        setAdvancedFilters(newFilters);
        // Extraer el estado seleccionado de los filtros avanzados
        // Actualizar filtros si es necesario
        if (newFilters.status) {
            const selectedStatusIds = Object.entries(newFilters.status)
                .filter(([ _, value ]) => value)
                .map(([ key ]) => key);
            // Aquí podrías actualizar algún estado si es necesario
        }
        setCurrentPage(1);
    };

    // Agregar función para sincronizar estados
    const syncDeviceStates = async () => {
        try {
            setIsSyncing(true);
            // Aquí iría la llamada a la API para sincronizar estados
            // await api.post('/devices/sync-states');

            // Refrescar los datos
            await Promise.all([
                refetch(),
                getDeviceSummary().then(setSummary)
            ]);

            toast({
                title: "Estados sincronizados",
                description: "Los estados de los dispositivos han sido actualizados correctamente.",
            });
        } catch (error) {
            toast({
                title: "Error al sincronizar estados",
                description: "No se pudieron actualizar los estados de los dispositivos.",
                variant: "destructive",
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <MainContainer>
            <HeaderActions title="Gestión de Dispositivos IoT">
                <div className="flex items-center gap-4">

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={syncDeviceStates}
                        disabled={isSyncing}
                        className="gap-2"
                    >
                        <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar Estados'}
                    </Button>
                    <ReloadButton
                        onClick={handleReload}
                        isLoading={isFetchingOrMutating || isLoadingSummary}
                    />
                    <AddButton onClick={handleAdd} text="Agregar Dispositivo" />
                </div>
            </HeaderActions>

            {/* Cards informativos */}
            <InfoSummaryCards
                cards={[
                    {
                        title: "Total Dispositivos",
                        value: summary.total || 0,
                        description: "En el sistema",
                        icon: <Wifi className="h-8 w-8 text-purple-500" />,
                        borderColor: "border-l-purple-500",
                        isLoading: isLoadingSummary
                    },
                    {
                        title: "Dispositivos Activos",
                        value: summary.active || 0,
                        description: "En línea",
                        icon: <Wifi className="h-8 w-8 text-green-500" />,
                        borderColor: "border-l-green-500",
                        isLoading: isLoadingSummary
                    },
                    {
                        title: "Dispositivos en Stock",
                        value: summary.stock || 0,
                        description: "Disponibles",
                        icon: <Wifi className="h-8 w-8 text-blue-500" />,
                        borderColor: "border-l-blue-500",
                        isLoading: isLoadingSummary
                    },
                    {
                        title: "En Mantenimiento",
                        value: summary.maintenance || 0,
                        description: "En servicio técnico",
                        icon: <Settings className="h-8 w-8 text-yellow-500" />,
                        borderColor: "border-l-yellow-500",
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
                        searchPlaceholder="Buscar por nombre, serial, ubicación..."
                        actions={
                            <>
                                <OrderSelector
                                    orderBy={orderBy}
                                    orderDirection={orderDirection}
                                    onOrderChange={changeOrder}
                                />
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
                    {/* Solo mostrar selector de vista en laptop y desktop */}
                    {showViewSelector && (
                        <ViewModeSwitcher
                            viewMode={viewMode}
                            setViewMode={(mode) => setViewMode(mode as "list" | "grid")}
                        />
                    )}
                </div>
            </div>

            {/* Vista automática basada en dispositivo */}
            {!isDesktop ? (
                // En dispositivos móviles, tablets y laptops: siempre cards
                <div>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Cargando dispositivos...</p>
                        </div>
                    ) : paginatedDevices && paginatedDevices.length > 0 ? (
                        <PaginatedCards
                            data={paginatedDevices}
                            totalRecords={totalRecords}
                            pageSize={pageSize}
                            onPaginationChange={handlePaginationChange}
                            renderCard={(device: Device) => (
                                <DeviceCard
                                    key={device.id}
                                    device={device}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            )}
                            isLoading={isFetchingOrMutating}
                        />
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No hay dispositivos disponibles</p>
                        </div>
                    )}
                </div>
            ) : (
                // En desktop: permitir cambio entre tabla y cards
                viewMode === "list" ? (
                    <ResponsiveTable<Device>
                        data={paginatedDevices}
                        columns={deviceColumns}
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
                        data={paginatedDevices}
                        totalRecords={totalRecords}
                        pageSize={pageSize}
                        onPaginationChange={handlePaginationChange}
                        renderCard={(device: Device) => (
                            <DeviceCard
                                key={device.id}
                                device={device}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                        isLoading={isFetchingOrMutating}
                    />
                )
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
                            <DialogTitle>{selectedDevice ? "Editar Dispositivo" : "Agregar Dispositivo"}</DialogTitle>
                            <DialogDescription>
                                {selectedDevice ? "Modifique los datos del dispositivo seleccionado" : "Complete el formulario para agregar un nuevo dispositivo IoT"}
                            </DialogDescription>
                        </DialogHeader>
                    </ModalHeader>
                    <ModalBody>
                        <DeviceForm
                            device={selectedDevice}
                            onSubmit={handleDeviceFormSubmitSuccess}
                            isLoading={isSubmitting}
                            onCancel={() => {
                                setIsModalOpen(false);
                                setSelectedDevice(null);
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
                                    setSelectedDevice(null);
                                }}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                    handleSubmitFromButton();
                                }}
                            >
                                {isSubmitting ? "Guardando..." : selectedDevice ? "Actualizar" : "Crear"}
                            </Button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Dialog>

            {/* Modal de Vista de Equipos */}
            {deviceToView && (
                <EquipmentModal
                    equipment={deviceToView}
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setDeviceToView(null);
                    }}
                />
            )}
        </MainContainer>
    );
} 