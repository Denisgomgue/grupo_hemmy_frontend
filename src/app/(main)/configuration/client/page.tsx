"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Client } from "@/types/clients/client";
import { Service } from "@/types/services/service";
import { useClient } from "@/hooks/use-client";
import { useInstallations } from "@/hooks/use-installation";
import { useClientPaymentConfigs } from "@/hooks/use-client-payment-config";
import api from "@/lib/axios";
import { ResponsiveTable } from "@/components/dataTable/responsive-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MainContainer } from "@/components/layout/main-container";
import { HeaderActions } from "@/components/layout/header-actions";
import { AddButton } from "@/components/layout/add-button";
import { ReloadButton } from "@/components/layout/reload-button";
import { MultiStepForm } from "@/components/ui/multi-step-form";
import ClienteStep from "./_components/ClienteStep";
import InstalacionStep from "./_components/InstalacionStep";
import UbicacionStep from "./_components/UbicacionStep";
import PagosStep from "./_components/PagosStep";
import { User, Zap, MapPin, CreditCard } from "lucide-react";
import { ClientFormData, ClientSchema } from "@/schemas/client-schema";
import { InstallationFormData, InstallationSchema } from "@/schemas/installation-schema";
import { ClientPaymentConfigFormData, ClientPaymentConfigSchema } from "@/schemas/client-payment-config-schema";
import { baseColumns } from "./_components/columns";
import { ClientActionsDropdown } from "./_components/client-actions-dropdown";
import { ClientActionsCell } from "./_components/client-actions-cell";
import { ClientCard } from "./_components/client-card";
import { EquipmentAssignmentModal } from "./_components/equipment-assignment-modal";
import { AdvancePaymentModal } from "./_components/advance-payment-modal";
import { ColumnDef } from "@tanstack/react-table";
import { PaginatedCards } from "@/components/dataTable/paginated-cards";
import { ViewModeSwitcher } from "@/components/dataTable/view-mode-switcher";
import { InfoSummaryCards } from "@/components/info-summary-cards";
import { Users, UserCheck, UserPlus, UserX, Clock, RefreshCcw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { TableToolbar } from "@/components/dataTable/table-toolbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { FilterButton } from "@/components/dataTable/filter-button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AdvancedFilters } from "@/components/dataTable/advanced-filters";
import { SectorSelector } from "@/components/dataTable/sector-selector";
import { usePlans } from "@/hooks/use-plan";
import { useSectors } from "@/hooks/use-sector";
import { Sector } from "@/types/sectors/sector";
import { useClientFilters } from "@/hooks/use-client-filters";
import { Header } from "@/components/dataTable/card-table";
import { useResponsiveDualView } from "@/hooks/use-responsive-view";
import { ResponsiveButton } from "@/components/ui/responsive-button";
import { ClientSummaryCards } from "@/components/client-summary-cards";
import { useSummaryCards } from "@/hooks/use-summary-cards";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toFloat, formatDateForBackend, createDateFromString } from "@/lib/utils";

interface ClientSummary {
    totalClientes: number;
    clientesActivos: number;
    clientesSuspendidos: number;
    clientesInactivos: number;
    period: number;
    // Campos adicionales del backend
    clientesPagados?: number;
    clientesPorVencer?: number;
    clientesVencidos?: number;
    clientesSuspendidosPago?: number;
}

const steps = [
    { label: "Cliente", icon: <User /> },
    { label: "Instalación", icon: <Zap /> },
    { label: "Ubicación", icon: <MapPin /> },
    { label: "Pagos", icon: <CreditCard /> },
];

export default function ClientPage() {
    const queryClient = useQueryClient();
    const { refreshClient, getClientSummary } = useClient();
    const { fetchInstallations } = useInstallations();
    const { fetchConfigs } = useClientPaymentConfigs();

    // Hook para vista responsiva
    const { deviceType, isDesktop, showViewSelector, recommendedView } = useResponsiveDualView();

    // Hook para tarjetas de resumen
    const { createClientSummaryCards } = useSummaryCards();

    // Estado de paginación y filtros
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ pageSize, setPageSize ] = useState(10);
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ viewMode, setViewMode ] = useState<"list" | "grid">(isDesktop ? "list" : "grid");
    const [ advancedFilters, setAdvancedFilters ] = useState({});

    // Estados del wizard
    const [ isModalOpen, setIsModalOpen ] = useState(false);
    const [ step, setStep ] = useState(0);
    const [ isStepValid, setIsStepValid ] = useState(false);
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ isUpdating, setIsUpdating ] = useState(false); // Nuevo estado para actualización
    const [ selectedClient, setSelectedClient ] = useState<Client | null>(null);
    const [ isSyncing, setIsSyncing ] = useState(false);
    const [ wizardMode, setWizardMode ] = useState<'create' | 'edit' | 'add-installation'>('create');

    // Estados para manejo de cliente existente (SOLO ESTO ES NUEVO)
    const [ existingClient, setExistingClient ] = useState<any>(null);

    // Estados para modal de equipos
    const [ isEquipmentModalOpen, setIsEquipmentModalOpen ] = useState(false);
    const [ selectedClientForEquipment, setSelectedClientForEquipment ] = useState<Client | null>(null);

    // Estados para modal de pago adelantado
    const [ isAdvancePaymentModalOpen, setIsAdvancePaymentModalOpen ] = useState(false);
    const [ advancePaymentData, setAdvancePaymentData ] = useState<{
        clientId: number;
        clientName: string;
        clientLastName: string;
        planPrice: number;
        planName: string;
        initialPaymentDate?: string;
    } | null>(null);

    // Datos del formulario
    const [ clienteData, setClienteData ] = useState<Partial<ClientFormData>>({});
    const [ instalacionData, setInstalacionData ] = useState<Partial<InstallationFormData>>({});
    const [ ubicacionData, setUbicacionData ] = useState<{ reference?: string; referenceImage?: File | null }>({});
    const [ pagoData, setPagoData ] = useState<Partial<ClientPaymentConfigFormData>>({
        advancePayment: false // Siempre inicializar como false
    });

    // Estados para servicios, planes y sectores
    const [ selectedServiceType, setSelectedServiceType ] = useState<string>("");
    const serviceTypes = [
        { label: "Inalámbrico", value: "wireless" },
        { label: "Fibra Óptica", value: "fiber" },
    ];

    // Actualizar viewMode automáticamente cuando cambie el dispositivo
    React.useEffect(() => {
        if (!isDesktop) {
            setViewMode("grid"); // En dispositivos no-desktop, siempre cards
        } else {
            setViewMode("list"); // En desktop, tabla por defecto
        }
    }, [ isDesktop ]);

    // Queries para datos
    const { data: clientsQuery, isFetching: isFetchingClients, refetch: refetchClients } = useQuery({
        queryKey: [ "clients", currentPage, pageSize, searchTerm, advancedFilters ],
        queryFn: () => refreshClient(currentPage, pageSize, searchTerm, advancedFilters),
    });

    const { data: summaryQuery, isFetching: isFetchingSummary } = useQuery({
        queryKey: [ "clientSummary" ],
        queryFn: () => getClientSummary(),
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    const { plans, refreshPlans } = usePlans();
    const { sectors, refreshSector } = useSectors();

    // Cargar planes y sectores cuando se abra el modal
    React.useEffect(() => {
        if (isModalOpen) {
            refreshPlans(1, 1000); // Cargar todos los planes
            refreshSector(1, 1000); // Cargar todos los sectores
        }
    }, [ isModalOpen ]); // Remover dependencias que causan re-renders

    // Cargar sectores inmediatamente al montar el componente
    React.useEffect(() => {
        refreshSector(1, 1000);
    }, []); // Solo ejecutar una vez al montar

    // Funciones auxiliares
    const deleteClientFn = async (id: number) => {
        const response = await api.delete(`/client/${id}`);
        return response.data;
    };

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: deleteClientFn,
        onSuccess: () => {
            toast.success("Cliente eliminado correctamente");
            queryClient.invalidateQueries({ queryKey: [ "clients" ] });
            queryClient.invalidateQueries({ queryKey: [ "clientSummary" ] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error al eliminar el cliente.");
        },
    });

    // Sincronizar estados de clientes
    const syncMutation = useMutation({
        mutationFn: async () => {
            try {
                setIsSyncing(true);

                const response = await api.post("/payments/sync-all-client-statuses");

                // Mostrar mensaje detallado
                const { syncedCount, totalChecked, recalculatedCount, details } = response.data;
                if (syncedCount > 0 || recalculatedCount > 0) {
                    let message = '';
                    if (recalculatedCount > 0 && syncedCount > 0) {
                        message = `✅ ${recalculatedCount} paymentStatus recalculados, ${syncedCount} clientes sincronizados de ${totalChecked} verificados`;
                    } else if (recalculatedCount > 0) {
                        message = `🔄 ${recalculatedCount} paymentStatus recalculados de ${totalChecked} verificados`;
                    } else {
                        message = `✅ ${syncedCount} clientes sincronizados de ${totalChecked} verificados`;
                    }
                    toast.success(message);
                } else {
                    toast.info("ℹ️ No se requirió recálculo ni sincronización para ningún cliente");
                }

                return response.data;
            } catch (error: any) {
                console.error('❌ Error en sincronización masiva:', error);
                const errorMessage = error.response?.data?.message || "No se pudieron actualizar los estados de los clientes.";
                toast.error(errorMessage);
                throw error;
            } finally {
                setIsSyncing(false);
            }
        },
        onSuccess: () => {
            // Solo invalidar queries una vez aquí
            queryClient.invalidateQueries({ queryKey: [ "clients" ] });
            queryClient.invalidateQueries({ queryKey: [ "clientSummary" ] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error al sincronizar los estados.");
        },
    });

    // Inicializar datos de resumen
    const [ summaryData, setSummaryData ] = useState<ClientSummary>({
        totalClientes: 0,
        clientesActivos: 0,
        clientesSuspendidos: 0,
        clientesInactivos: 0,
        period: 1
    });

    React.useEffect(() => {
        if (clientsQuery?.data) {
            // Los datos ya están manejados por useClientFilters
        }
    }, [ clientsQuery?.data ]);

    // Cargar planes y sectores cuando se abra el modal
    React.useEffect(() => {
        if (isModalOpen) {
            refreshPlans(1, 1000); // Cargar todos los planes
            refreshSector(1, 1000); // Cargar todos los sectores
        }
    }, [ isModalOpen, refreshPlans, refreshSector ]);

    // Handlers del wizard multi-paso
    const handleClienteChange = (field: keyof ClientFormData, value: any) => {
        setClienteData((prev) => ({ ...prev, [ field ]: value }));
    };
    const handleInstalacionChange = (field: keyof InstallationFormData, value: any) => {
        setInstalacionData((prev) => ({ ...prev, [ field ]: value }));
    };
    const handleUbicacionChange = (field: string, value: any) => {
        setUbicacionData((prev) => ({ ...prev, [ field ]: value }));
    };
    const handlePagoChange = (field: keyof ClientPaymentConfigFormData, value: any) => {

        setPagoData((prev) => ({ ...prev, [ field ]: value }));
    };

    // Manejar cambios de validación del step actual
    const handleValidationChange = (isValid: boolean) => {
        setIsStepValid(isValid);
    };

    // Handler para cuando se encuentra un cliente existente (SOLO ESTO ES NUEVO)
    const handleExistingClientFound = (client: any) => {
        setExistingClient(client);
        setWizardMode('add-installation');

        // Llenar automáticamente los datos del cliente
        setClienteData({
            name: client.name || "",
            lastName: client.lastName || "",
            dni: client.dni || "",
            phone: client.phone || "",
            address: client.address || "",
            birthdate: client.birthdate || undefined,
            description: client.description || "",
            status: client.status || "ACTIVE"
        });

        // Saltar al step de instalación
        setStep(1);
        setIsStepValid(true); // El step de cliente ya está "completado"

        toast.success(`Se encontró el cliente ${client.name} ${client.lastName}. Continuando con la instalación.`);
    };

    // Resetear validación cuando cambie el step
    React.useEffect(() => {
        // Por defecto, los steps que no tienen validación implementada son válidos temporalmente
        // Step 0: Cliente (validación implementada)
        // Step 1: Instalación (validación implementada)
        // Step 2: Ubicación (sin validación obligatoria)
        // Step 3: Pagos (validación implementada)
        if (step === 2) {
            setIsStepValid(true);
        }
    }, [ step ]); // Solo depender del step

    // Handler para generar pago
    const handleGenerarPago = () => {
        // Implementar lógica de generación de pago
    };

    // Handler para avanzar y retroceder en el wizard
    const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
    const handleBack = () => setStep((s) => Math.max(s - 1, 0));

    // Handler para enviar el formulario completo del wizard con arquitectura distribuida
    const handleWizardSubmit = async () => {
        try {
            setIsSubmitting(true);

            if (wizardMode === 'edit') {
                // 🚀 MODO EDICIÓN: Actualizar cada step individualmente
                console.log('🔄 Actualizando cliente en modo edición...');

                // Actualizar cliente
                await handleUpdateClientStep();

                // Actualizar instalación
                await handleUpdateInstallationStep();

                // Actualizar ubicación
                await handleUpdateLocationStep();

                // Actualizar pagos
                await handleUpdatePaymentStep();

                toast.success("Todos los datos han sido actualizados correctamente.");

                // Cerrar modal y limpiar estado
                resetWizardState();
            } else {
                // 🚀 MODO CREACIÓN: Crear nuevo cliente
                await handleCreateClient();
            }

        } catch (error: any) {
            console.error('❌ Error en wizard submit:', error);
            toast.error(wizardMode === 'edit' ? "Error al actualizar cliente" : "Error al crear cliente");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Función para crear nuevo cliente
    const handleCreateClient = async () => {
        try {
            // Preparar datos unificados

            // Preparar datos unificados
            const formData = new FormData();

            // Datos del cliente
            formData.append('name', clienteData.name || '');
            formData.append('lastName', clienteData.lastName || '');
            formData.append('dni', clienteData.dni || '');
            formData.append('phone', clienteData.phone || '');
            formData.append('address', clienteData.address || '');
            if (clienteData.birthdate) {
                formData.append('birthdate', clienteData.birthdate.toISOString().split('T')[ 0 ]);
            }
            if (clienteData.description) {
                formData.append('description', clienteData.description);
            }
            formData.append('status', clienteData.status || 'ACTIVE');

            // Datos de instalación
            if (instalacionData.installationDate) {
                console.log('📅 ClientPage - Fecha de instalación original:', instalacionData.installationDate);
                const formattedDate = formatDateForBackend(instalacionData.installationDate);
                console.log('📅 ClientPage - Fecha formateada para backend:', formattedDate);
                if (formattedDate) {
                    formData.append('installationDate', formattedDate);
                }
            }
            if (instalacionData.planId) {
                formData.append('planId', instalacionData.planId.toString());
            }
            if (instalacionData.sectorId) {
                formData.append('sectorId', instalacionData.sectorId.toString());
            }
            if (ubicacionData.reference) {
                formData.append('reference', ubicacionData.reference);
            }
            if (instalacionData.ipAddress) {
                formData.append('ipAddress', instalacionData.ipAddress);
            }

            // Imagen de referencia
            if (ubicacionData.referenceImage instanceof File) {
                formData.append('referenceImage', ubicacionData.referenceImage);
            }

            // Datos de pago
            if (pagoData.initialPaymentDate) {
                const paymentDate = typeof pagoData.initialPaymentDate === 'string'
                    ? pagoData.initialPaymentDate
                    : pagoData.initialPaymentDate.toISOString().split('T')[ 0 ];
                formData.append('paymentDate', paymentDate);
            }
            // Siempre enviar valores explícitos: 0 o 1
            const advancePaymentValue = pagoData.advancePayment === true ? '1' : '0';
            formData.append('advancePayment', advancePaymentValue);

            // Crear cliente con todos los datos en una sola petición
            const response = await api.post('/client', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Cliente creado exitosamente
            const createdClient = response.data;

            // Refrescar datos
            queryClient.invalidateQueries({ queryKey: [ "clients" ] });
            queryClient.invalidateQueries({ queryKey: [ "clientSummary" ] });

            toast.success("El cliente y su configuración han sido guardados correctamente.");

            // Verificar si hay pago adelantado
            if (pagoData.advancePayment === true) {
                // Estrategia: Usar datos del wizard directamente y también intentar obtener instalación
                console.log("🔍 ClientPage - Iniciando proceso de pago adelantado para cliente ID:", createdClient.id);
                console.log("🔍 ClientPage - Datos del wizard - instalacionData:", instalacionData);
                console.log("🔍 ClientPage - Datos del wizard - pagoData:", pagoData);

                try {
                    // Estrategia 1: Intentar obtener la instalación (puede que aún no exista)
                    console.log("🔍 ClientPage - Estrategia 1: Intentando obtener instalación...");
                    const installationResponse = await api.get(`/installations?clientId=${createdClient.id}`);
                    console.log("🔍 ClientPage - Instalaciones encontradas:", installationResponse.data.length);

                    let installation = null;
                    if (installationResponse.data.length > 0) {
                        installation = installationResponse.data.find((inst: any) => inst.clientId === createdClient.id);
                        console.log("🔍 ClientPage - Instalación encontrada:", installation);
                    }

                    // Estrategia 2: Si no hay instalación, usar datos del wizard
                    if (!installation && instalacionData.planId) {
                        console.log("🔍 ClientPage - Estrategia 2: Usando datos del wizard con planId:", instalacionData.planId);

                        try {
                            // Obtener información del plan directamente
                            const planResponse = await api.get(`/plans/${instalacionData.planId}`);
                            console.log("🔍 ClientPage - Plan obtenido del wizard:", planResponse.data);

                            if (planResponse.data?.price && planResponse.data?.name) {
                                // Preparar datos para el modal usando datos del wizard
                                const advancePaymentData = {
                                    clientId: createdClient.id, // Usar el ID del cliente recién creado
                                    clientName: clienteData.name || "",
                                    clientLastName: clienteData.lastName || "",
                                    planPrice: toFloat(planResponse.data.price),
                                    planName: planResponse.data.name,
                                    initialPaymentDate: pagoData.initialPaymentDate ?
                                        (typeof pagoData.initialPaymentDate === 'string' ?
                                            pagoData.initialPaymentDate :
                                            pagoData.initialPaymentDate.toISOString().split('T')[ 0 ]) :
                                        undefined
                                };

                                console.log("🚀 ClientPage - Datos para el modal (wizard):", advancePaymentData);
                                setAdvancePaymentData(advancePaymentData);
                                setIsAdvancePaymentModalOpen(true);
                                return; // Salir aquí para evitar continuar con el proceso
                            }
                        } catch (planError) {
                            console.error("Error al obtener plan del wizard:", planError);
                        }
                    }

                    // Estrategia 3: Si hay instalación, usar sus datos
                    if (installation?.plan?.price && installation?.plan?.name) {
                        console.log("🔍 ClientPage - Estrategia 3: Usando datos de la instalación encontrada");

                        // Preparar datos para el modal de pago adelantado
                        const advancePaymentData = {
                            clientId: installation.clientId, // Usar el clientId de la instalación
                            clientName: clienteData.name || "",
                            clientLastName: clienteData.lastName || "",
                            planPrice: toFloat(installation.plan.price),
                            planName: installation.plan.name,
                            initialPaymentDate: pagoData.initialPaymentDate ?
                                (typeof pagoData.initialPaymentDate === 'string' ?
                                    pagoData.initialPaymentDate :
                                    pagoData.initialPaymentDate.toISOString().split('T')[ 0 ]) :
                                undefined
                        };

                        console.log("🚀 ClientPage - Datos para el modal (instalación):", advancePaymentData);
                        setAdvancePaymentData(advancePaymentData);
                        setIsAdvancePaymentModalOpen(true);
                    } else {
                        // Si llegamos aquí, ninguna estrategia funcionó
                        console.error("❌ No se pudo obtener información del plan para el pago adelantado");
                        console.error("❌ Cliente ID:", createdClient.id);
                        console.error("❌ Instalación encontrada:", installation);
                        console.error("❌ PlanId del wizard:", instalacionData.planId);

                        toast.error("No se pudo abrir el formulario de pago adelantado. Verifique que el cliente tenga un plan asignado.");
                    }
                } catch (error) {
                    console.error("Error al obtener información del plan:", error);
                    toast.error("Error al obtener la información del plan del cliente.");
                }
            }

            // NO cerrar el wizard aquí - esperar a que se complete el pago adelantado
            // El wizard se cerrará en los callbacks del modal
        } catch (error: any) {
            console.error('❌ Error creando cliente:', error);
            toast.error(error.response?.data?.message || "Ocurrió un error inesperado");
            // Si hay error, cerrar el wizard
            resetWizardState();
        }
    };

    // Callback para cuando el pago adelantado se registra exitosamente
    const handlePaymentSuccess = () => {
        console.log("✅ Pago adelantado registrado exitosamente");
        toast.success("Cliente creado y pago adelantado registrado correctamente");
        resetWizardState();
    };

    // Callback para cuando se cancela el pago adelantado
    const handlePaymentCancel = () => {
        console.log("❌ Pago adelantado cancelado por el usuario");
        toast.info("Cliente creado exitosamente. El pago adelantado fue cancelado.");

        // Actualizar el estado del cliente para que advancePayment sea false
        // Esto se puede hacer actualizando la configuración de pago del cliente
        if (advancePaymentData?.clientId) {
            // Opcional: Actualizar la configuración de pago para marcar como no adelantado
            // api.patch(`/client-payment-config/${clientId}`, { advancePayment: false });
        }

        resetWizardState();
    };

    // Función para actualizar cliente existente
    const handleUpdateClient = async () => {
        if (!selectedClient) {
            throw new Error("No hay cliente seleccionado para actualizar");
        }

        try {
            console.log('🔄 Iniciando actualización del cliente:', selectedClient.id);
            console.log('🔄 Datos del cliente:', clienteData);
            console.log('🔄 Datos de instalación:', instalacionData);
            console.log('🔄 Datos de ubicación:', ubicacionData);
            console.log('🔄 Datos de pagos:', pagoData);

            // Mostrar toast de inicio
            toast.info("Guardando los cambios realizados");

            // 🚀 PASO 1: Actualizar datos del cliente
            console.log('🔄 PASO 1: Actualizando datos del cliente...');
            await api.patch(`/client/${selectedClient.id}`, {
                name: clienteData.name,
                lastName: clienteData.lastName,
                dni: clienteData.dni,
                phone: clienteData.phone,
                address: clienteData.address,
                birthdate: clienteData.birthdate ? clienteData.birthdate.toISOString().split('T')[ 0 ] : null,
                description: clienteData.description,
                status: clienteData.status
            });
            console.log('✅ PASO 1: Cliente actualizado correctamente');

            // 🚀 PASO 2: Buscar instalación existente
            console.log('🔄 PASO 2: Buscando instalación existente...');
            const installationResponse = await api.get(`/installations/client/${selectedClient.id}`);
            let installationId = null;

            // Preparar datos de instalación incluyendo ubicación
            const installationUpdateData: any = {
                installationDate: formatDateForBackend(instalacionData.installationDate),
                reference: ubicacionData.reference || instalacionData.reference || "",
                ipAddress: instalacionData.ipAddress || "",
                referenceImage: ubicacionData.referenceImage || ""
            };

            // Agregar relaciones solo si existen usando bracket notation
            if (instalacionData.planId) {
                (installationUpdateData as any).planId = instalacionData.planId;
            }
            if (instalacionData.sectorId) {
                (installationUpdateData as any).sectorId = instalacionData.sectorId;
            }

            console.log('🔄 Datos de instalación a actualizar:', installationUpdateData);

            // Si hay una nueva imagen, subirla
            if (ubicacionData.referenceImage instanceof File) {
                console.log('🔄 Nueva imagen seleccionada, se enviará con el FormData');
            } else if (typeof ubicacionData.referenceImage === 'string') {
                // Mantener la imagen existente
                installationUpdateData.referenceImage = ubicacionData.referenceImage;
                console.log('🔄 Manteniendo imagen existente:', ubicacionData.referenceImage);
            }

            if (installationResponse.data.length > 0) {
                // Actualizar instalación existente
                const installation = installationResponse.data[ 0 ];
                installationId = installation.id;

                console.log('🔄 Actualizando instalación existente:', installationId);
                await api.patch(`/installations/${installationId}`, installationUpdateData);
                console.log('✅ Instalación actualizada correctamente');
            } else {
                // Crear nueva instalación
                console.log('🔄 Creando nueva instalación...');
                const newInstallation = await api.post("/installations", {
                    ...installationUpdateData,
                    clientId: selectedClient.id
                });
                installationId = newInstallation.data.id;
                console.log('✅ Nueva instalación creada:', installationId);
            }

            // 🚀 PASO 3: Actualizar configuración de pagos
            console.log('🔄 PASO 3: Actualizando configuración de pagos...');
            const paymentConfigResponse = await api.get(`/client-payment-config?clientId=${selectedClient.id}&limit=1`);

            if (paymentConfigResponse.data.length > 0) {
                // Actualizar configuración existente
                const paymentConfig = paymentConfigResponse.data[ 0 ];
                // Actualizar configuración de pagos

                await api.patch(`/client-payment-config/${paymentConfig.id}`, {
                    initialPaymentDate: pagoData.initialPaymentDate ?
                        (typeof pagoData.initialPaymentDate === 'string' ?
                            pagoData.initialPaymentDate :
                            pagoData.initialPaymentDate.toISOString().split('T')[ 0 ]) : null,
                    advancePayment: pagoData.advancePayment === true,
                    installationId: installationId
                });
                console.log('✅ Configuración de pagos actualizada');
            } else {
                // Crear nueva configuración de pagos
                await api.post("/client-payment-config", {
                    clientId: selectedClient.id,
                    installationId: installationId,
                    initialPaymentDate: pagoData.initialPaymentDate ?
                        (typeof pagoData.initialPaymentDate === 'string' ?
                            pagoData.initialPaymentDate :
                            pagoData.initialPaymentDate.toISOString().split('T')[ 0 ]) : null,
                    advancePayment: pagoData.advancePayment === true
                });
                console.log('✅ Nueva configuración de pagos creada');
            }

            // Refrescar datos
            console.log('🔄 Refrescando datos...');
            queryClient.invalidateQueries({ queryKey: [ "clients" ] });
            queryClient.invalidateQueries({ queryKey: [ "clientSummary" ] });

            console.log('✅ Actualización completada exitosamente');

            toast.success("Los datos del cliente han sido actualizados correctamente.");

            // Cerrar modal y limpiar estado
            resetWizardState();

        } catch (error: any) {
            console.error('❌ Error actualizando cliente:', error);

            toast.error(error.response?.data?.message || "Ocurrió un error inesperado");

            throw new Error(error.response?.data?.message || "Error al actualizar el cliente");
        }
    };

    // Función para resetear el estado del wizard
    const resetWizardState = () => {
        setIsModalOpen(false);
        setStep(0);
        setClienteData({});
        setInstalacionData({});
        setUbicacionData({});
        setPagoData({
            initialPaymentDate: undefined,
            advancePayment: false
        });
        setSelectedServiceType("");
        setIsStepValid(false);
        setSelectedClient(null);
        setWizardMode('create');
        setExistingClient(null);
        setIsUpdating(false);
    };

    // Funciones de actualización por step
    const handleUpdateClientStep = async () => {
        if (!selectedClient) {
            toast.error("No hay cliente seleccionado para actualizar");
            return;
        }

        try {
            setIsUpdating(true);
            console.log('🔄 Actualizando datos del cliente...');
            await api.patch(`/client/${selectedClient.id}`, {
                name: clienteData.name,
                lastName: clienteData.lastName,
                dni: clienteData.dni,
                phone: clienteData.phone,
                address: clienteData.address,
                birthdate: clienteData.birthdate ? clienteData.birthdate.toISOString().split('T')[ 0 ] : null,
                description: clienteData.description,
                status: clienteData.status
            });

            queryClient.invalidateQueries({ queryKey: [ "clients" ] });
            queryClient.invalidateQueries({ queryKey: [ "clientSummary" ] });

            toast.success("Los datos del cliente han sido actualizados correctamente.");
        } catch (error: any) {
            console.error('❌ Error actualizando cliente:', error);
            toast.error(error.response?.data?.message || "Ocurrió un error inesperado");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateInstallationStep = async () => {
        if (!selectedClient) {
            toast.error("No hay cliente seleccionado para actualizar");
            return;
        }

        try {
            setIsUpdating(true);

            // Buscar instalación existente
            const installationResponse = await api.get(`/installations/client/${selectedClient.id}`);

            if (installationResponse.data.length > 0) {
                const installation = installationResponse.data[ 0 ];

                const updateData = {
                    planId: instalacionData.planId,
                    sectorId: instalacionData.sectorId,
                    installationDate: formatDateForBackend(instalacionData.installationDate),
                    ipAddress: instalacionData.ipAddress || ""
                };

                // Actualizar instalación

                await api.patch(`/installations/${installation.id}`, updateData);

                queryClient.invalidateQueries({ queryKey: [ "clients" ] });

                toast.success("Los datos de instalación han sido actualizados correctamente.");
            } else {
                toast.error("No se encontró una instalación para actualizar");
            }
        } catch (error: any) {
            console.error('❌ Error actualizando instalación:', error);
            toast.error(error.response?.data?.message || "Ocurrió un error inesperado");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateLocationStep = async () => {
        if (!selectedClient) {
            toast.error("No hay cliente seleccionado para actualizar");
            return;
        }

        try {
            setIsUpdating(true);

            // Buscar instalación existente
            const installationResponse = await api.get(`/installations/client/${selectedClient.id}`);

            if (installationResponse.data.length > 0) {
                const installation = installationResponse.data[ 0 ];

                const updateData = {
                    reference: ubicacionData.reference || ""
                };

                // Si hay una nueva imagen, subirla
                if (ubicacionData.referenceImage instanceof File) {
                    const formData = new FormData();
                    formData.append('referenceImage', ubicacionData.referenceImage);
                    formData.append('reference', ubicacionData.reference || "");

                    await api.patch(`/installations/${installation.id}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                } else {
                    await api.patch(`/installations/${installation.id}`, updateData);
                }

                queryClient.invalidateQueries({ queryKey: [ "clients" ] });

                toast.success("Los datos de ubicación han sido actualizados correctamente.");
            } else {
                toast.error("No se encontró una instalación para actualizar");
            }
        } catch (error: any) {
            console.error('❌ Error actualizando ubicación:', error);
            toast.error(error.response?.data?.message || "Ocurrió un error inesperado");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdatePaymentStep = async () => {
        if (!selectedClient) {
            toast.error("No hay cliente seleccionado para actualizar");
            return;
        }

        try {
            setIsUpdating(true);

            // Buscar instalación existente
            const installationResponse = await api.get(`/installations?clientId=${selectedClient.id}&limit=1`);

            if (installationResponse.data.length > 0) {
                const installation = installationResponse.data[ 0 ];

                // Buscar configuración de pagos existente
                const paymentConfigResponse = await api.get(`/client-payment-config?clientId=${selectedClient.id}&limit=1`);

                if (paymentConfigResponse.data.length > 0) {
                    // Actualizar configuración existente
                    const paymentConfig = paymentConfigResponse.data[ 0 ];
                    await api.patch(`/client-payment-config/${paymentConfig.id}`, {
                        initialPaymentDate: pagoData.initialPaymentDate ?
                            (typeof pagoData.initialPaymentDate === 'string' ?
                                pagoData.initialPaymentDate :
                                pagoData.initialPaymentDate.toISOString().split('T')[ 0 ]) : null,
                        advancePayment: pagoData.advancePayment === true ? '1' : '0',
                        installationId: installation.id
                    });

                    toast.success("La configuración de pagos ha sido actualizada correctamente.");
                } else {
                    // Crear nueva configuración de pagos
                    await api.post("/client-payment-config", {
                        clientId: selectedClient.id,
                        installationId: installation.id,
                        initialPaymentDate: pagoData.initialPaymentDate ?
                            (typeof pagoData.initialPaymentDate === 'string' ?
                                pagoData.initialPaymentDate :
                                pagoData.initialPaymentDate.toISOString().split('T')[ 0 ]) : null,
                        advancePayment: pagoData.advancePayment === true ? '1' : '0'
                    });

                    toast.success("La configuración de pagos ha sido creada correctamente.");
                }
            } else {
                toast.error("No se encontró una instalación para actualizar la configuración de pagos");
            }
        } catch (error: any) {
            console.error('❌ Error actualizando configuración de pagos:', error);
            toast.error(error.response?.data?.message || "Ocurrió un error inesperado");
        } finally {
            setIsUpdating(false);
        }
    };

    // Función para cargar datos completos del cliente para edición
    const loadClientForEdit = async (client: Client) => {
        try {
            setIsSyncing(true);

            // Cargar datos del cliente
            setClienteData({
                name: client.name || "",
                lastName: client.lastName || "",
                dni: client.dni || "",
                phone: client.phone || "",
                address: client.address || "",
                birthdate: client.birthdate ? new Date(client.birthdate) : undefined,
                description: client.description || "",
                status: client.status || "ACTIVE"
            });

            // Cargar datos de instalación
            const installationResponse = await api.get(`/installations/client/${client.id}`);

            if (installationResponse.data.length > 0) {
                const installation = installationResponse.data[ 0 ];

                // Si no hay planId en la instalación, buscar en la relación
                let planId = installation.planId;
                let sectorId = installation.sectorId;
                let serviceType = '';

                if (!planId && installation.plan) {
                    planId = installation.plan.id;
                }

                if (!sectorId && installation.sector) {
                    sectorId = installation.sector.id;
                }

                // Obtener el tipo de servicio del plan
                if (installation.plan && installation.plan.service) {
                    const serviceName = installation.plan.service.name;

                    // Mapear el nombre del servicio al valor del frontend
                    const serviceNameLower = serviceName.toLowerCase();

                    if (serviceNameLower.includes('inalambrico') || serviceNameLower.includes('inalámbrico') || serviceNameLower.includes('wireless')) {
                        serviceType = 'wireless';
                    } else if (serviceNameLower.includes('fibra') || serviceNameLower.includes('fiber') || serviceNameLower.includes('óptica')) {
                        serviceType = 'fiber';
                    } else {
                        // Por defecto, intentar mapear basado en el nombre
                        serviceType = serviceNameLower.includes('inalambrico') ? 'wireless' : 'fiber';
                    }
                }

                const instalacionDataToSet = {
                    planId: planId ? Number(planId) : undefined,
                    sectorId: sectorId ? Number(sectorId) : undefined,
                    installationDate: installation.installationDate ? createDateFromString(installation.installationDate) : undefined,
                    ipAddress: installation.ipAddress || "",
                    reference: installation.reference || ""
                };

                setInstalacionData(instalacionDataToSet);

                // Establecer el tipo de servicio
                if (serviceType) {
                    setSelectedServiceType(serviceType);
                }

                // Cargar datos de ubicación
                setUbicacionData({
                    reference: installation.reference || "",
                    referenceImage: installation.referenceImage || null
                });

                // Cargar datos de configuración de pagos - Filtrar por installationId específico
                const paymentConfigResponse = await api.get(`/client-payment-config?installationId=${installation.id}&limit=1`);

                if (paymentConfigResponse.data.length > 0) {
                    // Buscar la configuración de pagos específica para esta instalación
                    const paymentConfig = paymentConfigResponse.data.find((config: any) => config.installationId === installation.id);

                    if (paymentConfig) {
                        // Procesar la fecha correctamente para evitar problemas de zona horaria
                        let processedDate = undefined;
                        if (paymentConfig.initialPaymentDate) {
                            // Si la fecha viene como string ISO, crear la fecha correctamente
                            const dateString = paymentConfig.initialPaymentDate;

                            // Crear fecha usando la fecha local sin zona horaria
                            if (typeof dateString === 'string') {
                                // Si es formato ISO, extraer solo la fecha
                                const dateOnly = dateString.split('T')[ 0 ];
                                processedDate = new Date(dateOnly + 'T00:00:00');
                            } else {
                                processedDate = new Date(dateString);
                            }
                        }

                        setPagoData({
                            initialPaymentDate: processedDate,
                            advancePayment: paymentConfig.advancePayment === true // Asegurar que sea boolean
                        });
                    } else {
                        setPagoData({
                            initialPaymentDate: undefined,
                            advancePayment: false
                        });
                    }
                }
            }

            setSelectedClient(client);
            setWizardMode('edit');
            setIsModalOpen(true);
        } catch (error: any) {
            console.error('❌ Error cargando datos del cliente:', error);
            toast.error("Error al cargar los datos del cliente");
        } finally {
            setIsSyncing(false);
        }
    };

    // Helper para preparar datos de instalación combinados (incluye datos de pago)
    const prepareInstallationData = async (clientId: number) => {
        try {
            const installationResponse = await api.get(`/installations?clientId=${clientId}&limit=1`);
            if (installationResponse.data.length > 0) {
                return installationResponse.data[ 0 ];
            }
            return null;
        } catch (error) {
            console.error('Error preparando datos de instalación:', error);
            return null;
        }
    };

    const handleAdd = () => {
        setWizardMode('create');
        setSelectedClient(null);
        setExistingClient(null);
        setStep(0);
        setClienteData({});
        setInstalacionData({});
        setUbicacionData({});
        setPagoData({});
        setSelectedServiceType("");
        setIsStepValid(false);
        setIsModalOpen(true);
    };

    const handleEdit = (client: Client) => {
        loadClientForEdit(client);
    };

    const handleDelete = (clientId: string) => {
        deleteMutation.mutate(parseInt(clientId));
    };

    // Handler para abrir modal de equipos
    const handleAssignEquipment = (client: Client) => {
        setSelectedClientForEquipment(client);
        setIsEquipmentModalOpen(true);
    };

    // Handler para cerrar modal de equipos
    const handleCloseEquipmentModal = () => {
        setIsEquipmentModalOpen(false);
        setSelectedClientForEquipment(null);
    };

    // Handler para cambios de paginación
    const handlePaginationChange = (page: number, newPageSize: number) => {
        setCurrentPage(page);
        setPageSize(newPageSize);
    };

    // Handler para búsqueda
    const handleSearch = () => {
        setCurrentPage(1); // Resetear a la primera página al buscar
    };

    // Handler para filtros avanzados
    const handleAdvancedFiltersChange = (newFilters: any) => {
        setAdvancedFilters(newFilters);
        setCurrentPage(1); // Resetear a la primera página al cambiar filtros
    };

    // Handler para recargar datos
    const handleReload = useCallback(() => {
        // Primero recargar clientes
        refetchClients();
        // Luego sincronizar estados
        syncMutation.mutate();
    }, [ refetchClients, syncMutation ]);

    // Definir headers para la vista móvil (CardTable)
    const clientHeaders = React.useMemo((): Header[] => [
        {
            key: 'client',
            label: 'Cliente',
            render: (value: any, item: Client) => (
                <ClientCard client={item} onEdit={handleEdit} />
            )
        }
    ], [ handleEdit ]);

    // Definir columnas de la tabla
    const clientColumns = React.useMemo((): ColumnDef<Client>[] => {
        const columnsBase = baseColumns;

        return [
            ...columnsBase,
            {
                id: "actions",
                header: "Acciones",
                cell: ({ row }) => (
                    <ClientActionsCell
                        rowData={row.original}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAssignEquipment={handleAssignEquipment}
                    />
                ),
            },
        ];
    }, [ handleEdit, handleDelete, handleAssignEquipment ]);

    // Definir los grupos de filtros
    const filterGroups = React.useMemo(() => [
        {
            id: "status",
            label: "Estado del Cliente",
            type: "checkbox" as const,
            options: [
                { id: "ACTIVE", label: "Activos" },
                { id: "SUSPENDED", label: "Suspendidos" },
                { id: "INACTIVE", label: "Inactivos" }
            ]
        },
        {
            id: "sectors",
            label: "Sectores",
            type: "checkbox-group" as const,
            options: sectors?.map((sector: Sector) => ({
                id: sector.id.toString(),
                label: sector.name
            })) || []
        },
        {
            id: "planCost",
            label: "Costo del Plan",
            type: "slider" as const,
            range: {
                min: 0,
                max: 500,
                step: 10
            }
        }
    ], [ sectors ]);

    // Estado de carga
    const isLoadingMutation = deleteMutation.isPending;
    const isFetchingOrMutating = isFetchingClients || isLoadingMutation;

    // Función para determinar qué función de actualización usar según el step
    const getUpdateFunction = () => {
        switch (step) {
            case 0: // Cliente
                return handleUpdateClientStep;
            case 1: // Instalación
                return handleUpdateInstallationStep;
            case 2: // Ubicación
                return handleUpdateLocationStep;
            case 3: // Pagos
                return handleUpdatePaymentStep;
            default:
                return null;
        }
    };

    // Función para determinar si mostrar el botón de actualizar
    const shouldShowUpdateButton = () => {
        return wizardMode === 'edit' && step >= 0 && step <= 3;
    };

    return (
        <MainContainer>
            <HeaderActions title="Gestión de Clientes">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => syncMutation.mutate()}
                                disabled={isSyncing}
                                className="gap-2"
                            >
                                <RefreshCcw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                                {isSyncing ? "Sincronizando..." : "Sincronizar Estados"}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Recalcula y sincroniza los estados de los clientes basado en fechas de pago.</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                • Recalcula paymentStatus basado en initialPaymentDate
                            </p>
                            <p className="text-xs text-muted-foreground">
                                • Sincroniza client.status con paymentStatus
                            </p>
                            <p className="text-xs text-muted-foreground">
                                • Más de 7 días vencido = SUSPENDED
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <ReloadButton
                    onClick={handleReload}
                    isLoading={isFetchingOrMutating || isFetchingSummary}
                />
                <AddButton onClick={handleAdd} text="Agregar Cliente" />
            </HeaderActions>

            {/* Cards informativos responsivos */}
            {/* <ClientSummaryCards
                cards={createClientSummaryCards(
                    {
                        totalClientes: summaryQuery?.totalClientes || 0,
                        clientesActivos: summaryQuery?.clientesActivos || 0,
                        clientesSuspendidos: summaryQuery?.clientesSuspendidos || 0,
                        clientesInactivos: summaryQuery?.clientesInactivos || 0
                    },
                    {
                        total: <Users />,
                        active: <UserCheck />,
                        suspended: <UserX />,
                        inactive: <Clock />
                    },
                    isFetchingSummary
                )}
            /> */}

            {/* Selector de vista y barra de herramientas */}
            <div className="flex flex-col gap-4">
                <div className={`flex ${isDesktop ? 'flex-row justify-between items-start' : 'flex-col gap-4'} w-full`}>
                    <div className="w-full">
                        <TableToolbar
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            onSearch={handleSearch}
                            searchPlaceholder="Buscar por DNI, nombre o apellidos..."
                            actions={
                                <>
                                    <AdvancedFilters
                                        groups={filterGroups}
                                        onFiltersChange={handleAdvancedFiltersChange}
                                        initialFilters={advancedFilters}
                                    />
                                    <ResponsiveButton variant="outline">Importar</ResponsiveButton>
                                    <ResponsiveButton variant="outline">Exportar</ResponsiveButton>
                                </>
                            }
                        />
                    </div>
                    {showViewSelector && (
                        <div className={`${isDesktop ? 'ml-4' : 'mt-4'}`}>
                            <ViewModeSwitcher viewMode={viewMode} setViewMode={(mode) => setViewMode(mode as "list" | "grid")} />
                        </div>
                    )}
                </div>
            </div>

            {/* Vista automática basada en dispositivo */}
            {!isDesktop ? (
                // En dispositivos móviles, tablets y laptops: siempre cards
                <PaginatedCards
                    data={clientsQuery?.data ?? []}
                    totalRecords={clientsQuery?.total || 0}
                    pageSize={pageSize}
                    onPaginationChange={handlePaginationChange}
                    renderCard={(client: Client) => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onEdit={handleEdit}
                        />
                    )}
                    isLoading={isFetchingOrMutating}
                />
            ) : (
                // En desktop: permitir cambio entre tabla y cards
                viewMode === "list" ? (
                    <ResponsiveTable<Client>
                        data={clientsQuery?.data ?? []}
                        columns={clientColumns}
                        headers={clientHeaders}
                        isLoading={isFetchingOrMutating}
                        pagination={{
                            onPaginationChange: handlePaginationChange,
                            totalRecords: clientsQuery?.total || 0,
                            pageSize: pageSize,
                            currentPage: currentPage
                        }}
                    />
                ) : (
                    <PaginatedCards
                        data={clientsQuery?.data ?? []}
                        totalRecords={clientsQuery?.total || 0}
                        pageSize={pageSize}
                        onPaginationChange={handlePaginationChange}
                        renderCard={(client: Client) => (
                            <ClientCard
                                key={client.id}
                                client={client}
                                onEdit={handleEdit}
                            />
                        )}
                        isLoading={isFetchingOrMutating}
                    />
                )
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} modal={false}>
                <DialogContent
                    className="sm:max-w-4xl max-w-[95vw] w-full h-[85vh] max-h-[75vh] p-0 flex flex-col gap-0"
                    onInteractOutside={(e) => {
                        e.preventDefault();
                    }}
                >
                    <DialogHeader className="flex-shrink-0 px-4 py-3 border-b">
                        <DialogTitle className="text-lg font-semibold">
                            {wizardMode === 'edit' ? "Editar Cliente" : "Agregar Cliente"}
                        </DialogTitle>
                        <DialogDescription>
                            {wizardMode === 'edit'
                                ? "Modifique la información del cliente seleccionado"
                                : "Complete todos los pasos para registrar un nuevo cliente"
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 min-h-0 overflow-hidden">
                        {isSyncing ? (
                            <div className="h-full p-4 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-sm text-muted-foreground">Cargando datos del cliente...</p>
                                </div>
                            </div>
                        ) : (
                            <MultiStepForm
                                steps={steps}
                                currentStep={step}
                                onStepChange={setStep}
                                onNext={handleNext}
                                onBack={handleBack}
                                onSubmit={handleWizardSubmit}
                                onUpdate={getUpdateFunction() || undefined}
                                isNextDisabled={!isStepValid}
                                isBackDisabled={step === 0}
                                isSubmitting={isSubmitting}
                                isUpdating={isUpdating}
                                showUpdateButton={shouldShowUpdateButton()}
                            >
                                {step === 0 && (
                                    <ClienteStep
                                        values={clienteData}
                                        onChange={handleClienteChange}
                                        onValidationChange={handleValidationChange}
                                        onExistingClientFound={handleExistingClientFound}
                                        isEditMode={wizardMode === 'edit'}
                                    />
                                )}
                                {step === 1 && (
                                    <>

                                        {/* Renderizar InstalacionStep */}
                                        <InstalacionStep
                                            values={instalacionData}
                                            onChange={handleInstalacionChange}
                                            serviceTypes={serviceTypes}
                                            selectedServiceType={selectedServiceType}
                                            onServiceTypeChange={setSelectedServiceType}
                                            plans={plans}
                                            sectors={sectors}
                                            onValidationChange={handleValidationChange}
                                            isEditMode={wizardMode === 'edit'}
                                        />
                                    </>
                                )}
                                {step === 2 && (
                                    <UbicacionStep
                                        values={ubicacionData}
                                        onChange={handleUbicacionChange}
                                        isEditMode={wizardMode === 'edit'}
                                    />
                                )}
                                {step === 3 && (
                                    <PagosStep
                                        values={pagoData}
                                        onChange={handlePagoChange}
                                        onGenerarPago={handleGenerarPago}
                                        onValidationChange={handleValidationChange}
                                        selectedPlan={instalacionData.planId ? plans?.find(p => p.id === instalacionData.planId) : undefined}
                                        isEditMode={wizardMode === 'edit'}
                                    />
                                )}
                            </MultiStepForm>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Componente de información del dispositivo (solo en desarrollo) */}
            {/* <DeviceInfo showBreakpoints={true} showPaymentStatus={showPaymentStatus} /> */}

            {/* Modal de asignación de equipos */}
            <EquipmentAssignmentModal
                client={selectedClientForEquipment}
                isOpen={isEquipmentModalOpen}
                onClose={handleCloseEquipmentModal}
            />

            {/* Modal de pago adelantado */}
            {advancePaymentData && (
                <AdvancePaymentModal
                    isOpen={isAdvancePaymentModalOpen}
                    onClose={() => {
                        setIsAdvancePaymentModalOpen(false);
                        setAdvancePaymentData(null);
                    }}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentCancel={handlePaymentCancel}
                    clientId={advancePaymentData.clientId}
                    clientName={advancePaymentData.clientName}
                    clientLastName={advancePaymentData.clientLastName}
                    planPrice={advancePaymentData.planPrice}
                    planName={advancePaymentData.planName}
                    initialPaymentDate={advancePaymentData.initialPaymentDate}
                />
            )}
        </MainContainer>
    );
}