import React, { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Wifi, Zap, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatDateForDisplay, normalizeCalendarDate } from "@/lib/utils";
import { InstallationFormData } from "@/schemas/installation-schema";
import { Plan } from "@/types/plans/plan";
import { Sector } from "@/types/sectors/sector";
import { PlanSearchSelect } from "@/components/search-select";
import { SearchSelectInput } from "@/components/ui/search-select-input";
import { IPAddressInput, generateSuggestedIP } from "@/components/ui/ip-address-input";

interface InstalacionStepProps {
    values: Partial<InstallationFormData>;
    onChange: (field: keyof InstallationFormData, value: any) => void;
    serviceTypes: { label: string; value: string }[];
    selectedServiceType: string;
    onServiceTypeChange: (value: string) => void;
    plans?: Plan[];
    sectors?: Sector[];
    onValidationChange?: (isValid: boolean) => void;
    isEditMode?: boolean; // Nueva prop para modo edición
}

interface ValidationErrors {
    serviceType?: string;
    planId?: string;
    sectorId?: string;
    installationDate?: string;
}

// Componente wrapper personalizado para filtrar planes por tipo de servicio
const FilteredPlanSearchSelect: React.FC<{
    value?: number;
    onChange: (planId: number) => void;
    placeholder: string;
    className: string;
    serviceType: string;
    allPlans: Plan[];
    onPlanSelect: (plan: Plan) => void;
    hasError?: boolean;
    isEditMode?: boolean; // Nueva prop para modo edición
}> = ({ value, onChange, placeholder, className, serviceType, allPlans, onPlanSelect, hasError, isEditMode = false }) => {
    // Filtrar planes según el tipo de servicio
    const filteredPlans = useMemo(() => {
        let filtered = allPlans.filter(plan => {
            const serviceName = plan.service?.name?.toLowerCase() || '';
            const planName = plan.name?.toLowerCase() || '';

            if (serviceType === 'wireless') {
                // Buscar servicios que contengan "inalambrico" o "internet inalambrico"
                return serviceName.includes('inalambrico') ||
                    serviceName.includes('internet inalambrico') ||
                    planName.includes('inalambrico') ||
                    planName.includes('wireless');
            } else if (serviceType === 'fiber') {
                // Buscar servicios que contengan "fibra" o "fibra óptica"
                return serviceName.includes('fibra') ||
                    serviceName.includes('fibra óptica') ||
                    planName.includes('fibra') ||
                    planName.includes('fiber');
            }
            return false; // No mostrar planes si no coincide con ningún filtro
        });

        // En modo edición, si hay un plan seleccionado que no está en la lista filtrada, agregarlo
        if (isEditMode && value) {
            const selectedPlan = allPlans.find(plan => plan.id === value);
            if (selectedPlan && !filtered.some(plan => plan.id === value)) {
                console.log('🔍 Agregando plan seleccionado a la lista filtrada:', selectedPlan);
                filtered.push(selectedPlan);
            }
        }

        return filtered;
    }, [ allPlans, serviceType, isEditMode, value ]);

    // Convertir planes filtrados a opciones para SearchSelectInput
    const planOptions = useMemo(() => {
        // Determinar el ícono según el tipo de servicio
        const getServiceIcon = () => {
            if (serviceType === 'wireless') {
                return <Wifi className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
            } else if (serviceType === 'fiber') {
                return <Zap className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />;
            }
            return <Wifi className="h-4 w-4" />;
        };

        return filteredPlans.map(plan => ({
            value: plan.id,
            label: plan.name,
            description: `Velocidad: ${plan.speed || 'N/A'} Mbps • Precio: S/. ${plan.price || 'N/A'}`,
            icon: getServiceIcon()
        }));
    }, [ filteredPlans, serviceType ]);

    // Verificar si el plan seleccionado sigue siendo válido después del filtrado
    const isValidSelection = useMemo(() => {
        if (!value) return true;
        return filteredPlans.some(plan => plan.id === value);
    }, [ value, filteredPlans ]);

    // Si la selección ya no es válida, limpiarla
    useEffect(() => {
        if (!isValidSelection && value) {
            onChange(0); // Limpiar selección
        }
    }, [ isValidSelection, value, onChange ]);

    const handlePlanSelect = (planId: string | number) => {
        const numericPlanId = typeof planId === 'string' ? parseInt(planId) : planId;
        onChange(numericPlanId);
        const selectedPlan = filteredPlans.find(plan => plan.id === numericPlanId);
        if (selectedPlan) {
            onPlanSelect(selectedPlan);
        }
    };

    return (
        <div className="space-y-2">
            <SearchSelectInput
                value={isValidSelection ? value : undefined}
                onChange={handlePlanSelect}
                placeholder={placeholder}
                className={`${className} ${hasError ? "border-red-500" : ""}`}
                options={planOptions}
                isLoading={false}
                emptyMessage="No hay planes disponibles"
                noResultsMessage="No se encontraron planes"
                minSearchLength={0}
                debounceMs={300}
                maxHeight={300}
            />
            {filteredPlans.length === 0 && (
                <p className="text-xs text-orange-600 dark:text-orange-400">
                    No hay planes disponibles para {serviceType === 'wireless' ? 'servicio inalámbrico' : 'fibra óptica'}
                </p>
            )}

        </div>
    );
};

export default function InstalacionStep({
    values,
    onChange,
    serviceTypes,
    selectedServiceType,
    onServiceTypeChange,
    plans = [],
    sectors = [],
    onValidationChange,
    isEditMode = false
}: InstalacionStepProps) {
    // Renderizar componente
    const [ errors, setErrors ] = useState<ValidationErrors>({});
    const [ touched, setTouched ] = useState<Record<string, boolean>>({});

    // Debug: Log del estado actual
    useEffect(() => {
        // Estado actual del componente
    }, [ selectedServiceType, isEditMode, values.planId, values.sectorId, plans.length, sectors.length ]);

    // Efecto para detectar cambios en el plan
    useEffect(() => {
        if (isEditMode && values.planId) {
            const selectedPlan = plans.find(plan => plan.id === values.planId);
            if (selectedPlan) {
                // Plan seleccionado
            }
        }
    }, [ values.planId, plans, isEditMode ]);

    // Filtrar planes según el tipo de servicio seleccionado
    const filteredPlans = useMemo(() => {
        if (!selectedServiceType) return [];

        // Filtrar por el nombre del servicio
        const filtered = plans.filter(plan => {
            const serviceName = plan.service?.name?.toLowerCase() || '';
            const planName = plan.name?.toLowerCase() || '';

            if (selectedServiceType === 'wireless') {
                // Buscar servicios que contengan "inalambrico" o "internet inalambrico"
                const isWireless = serviceName.includes('inalambrico') ||
                    serviceName.includes('internet inalambrico') ||
                    planName.includes('inalambrico') ||
                    planName.includes('wireless');

                return isWireless;
            } else if (selectedServiceType === 'fiber') {
                // Buscar servicios que contengan "fibra" o "fibra óptica"
                const isFiber = serviceName.includes('fibra') ||
                    serviceName.includes('fibra óptica') ||
                    planName.includes('fibra') ||
                    planName.includes('fiber');

                return isFiber;
            }

            return false; // No mostrar planes si no coincide con ningún filtro
        });

        // Si estamos en modo edición y no hay planes filtrados, mostrar todos los planes
        if (isEditMode && filtered.length === 0 && plans.length > 0) {
            return plans;
        }

        return filtered;
    }, [ plans, selectedServiceType, isEditMode ]);

    // Función para validar todos los campos obligatorios
    const validateAllFields = () => {
        const newErrors: ValidationErrors = {};

        if (!selectedServiceType) {
            newErrors.serviceType = "Debe seleccionar un tipo de servicio";
        }

        if (!values.planId) {
            newErrors.planId = "Debe seleccionar un plan";
        }

        if (!values.sectorId) {
            newErrors.sectorId = "Debe seleccionar un sector";
        }

        if (!values.installationDate) {
            newErrors.installationDate = "Debe seleccionar una fecha de instalación";
        }

        return newErrors;
    };

    // Efecto para validar en tiempo real
    useEffect(() => {
        const newErrors = validateAllFields();
        setErrors(newErrors);

        // Notificar si el formulario es válido
        const isValid = Object.keys(newErrors).length === 0;
        if (onValidationChange) {
            onValidationChange(isValid);
        }
    }, [ selectedServiceType, values.planId, values.sectorId, values.installationDate ]);

    // Limpiar selección de plan cuando cambie el tipo de servicio
    const handleServiceTypeChange = (newServiceType: string) => {
        onServiceTypeChange(newServiceType);
        // Limpiar plan seleccionado al cambiar tipo de servicio
        onChange("planId", undefined);
        setTouched(prev => ({ ...prev, serviceType: true }));
    };

    // Manejar blur de campos
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [ field ]: true }));
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Configuración de Instalación</h3>
                <p className="text-sm text-muted-foreground">
                    Configure los detalles técnicos de la instalación
                </p>
            </div>

            {/* Tipo de Servicio */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-foreground">
                    Tipo de Servicio <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {serviceTypes.map((type) => (
                        <Button
                            key={type.value}
                            type="button"
                            variant={selectedServiceType === type.value ? "default" : "outline"}
                            className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 ${selectedServiceType === type.value
                                ? "bg-gradient-to-br from-purple-800 to-cyan-500 hover:from-purple-800 hover:to-cyan-600 text-white shadow-lg transform scale-105"
                                : "hover:bg-accent hover:shadow-md"
                                } ${errors.serviceType && touched.serviceType ? "border-red-500" : ""}`}
                            onClick={() => handleServiceTypeChange(type.value)}
                        >
                            {type.value === "wireless" ? (
                                <Wifi className="h-6 w-6" />
                            ) : (
                                <Zap className="h-6 w-6" />
                            )}
                            <span className="font-medium">{type.label}</span>
                        </Button>
                    ))}
                </div>
                {errors.serviceType && touched.serviceType && (
                    <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        {errors.serviceType}
                    </div>
                )}
            </div>

            {/* Contenedor de campos que aparecen solo cuando se selecciona un servicio */}
            {(selectedServiceType || isEditMode) && (
                <div className="space-y-6 animate-in slide-in-from-top-2 fade-in-0 duration-500">
                    {/* Plan */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Plan <span className="text-red-500">*</span>
                        </label>
                        <div className="relative z-10">
                            <FilteredPlanSearchSelect
                                value={values.planId}
                                onChange={(planId) => {
                                    onChange("planId", planId);
                                    handleBlur("planId");
                                }}
                                placeholder={`Buscar plan ${selectedServiceType === 'wireless' ? 'inalámbrico' : 'fibra óptica'}...`}
                                className="w-full"
                                serviceType={selectedServiceType}
                                allPlans={plans}
                                onPlanSelect={(plan) => {
                                    // Plan seleccionado
                                }}
                                hasError={!!(errors.planId && touched.planId)}
                                isEditMode={isEditMode}
                            />
                        </div>
                        {errors.planId && touched.planId && (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors.planId}
                            </div>
                        )}
                    </div>

                    {/* Sector y Fecha de Instalación */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Sector <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={values.sectorId?.toString() || ""}
                                onValueChange={(value) => {
                                    onChange("sectorId", parseInt(value));
                                    handleBlur("sectorId");
                                }}
                            >
                                <SelectTrigger className={`w-full ${errors.sectorId && touched.sectorId ? "border-red-500" : ""}`}>
                                    <SelectValue placeholder="Seleccione un sector" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px] overflow-y-auto">
                                    {sectors.length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                            No hay sectores disponibles
                                        </div>
                                    ) : (
                                        sectors.map((sector) => (
                                            <SelectItem
                                                key={sector.id}
                                                value={sector.id.toString()}
                                                className="hover:bg-violet-200 hover:text-white focus:bg-purple-900 focus:text-white data-[state=checked]:bg-purple-800 data-[state=checked]:text-white transition-colors duration-200"
                                            >
                                                {sector.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.sectorId && touched.sectorId && (
                                <div className="flex items-center gap-2 text-sm text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.sectorId}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Fecha de Instalación <span className="text-red-500">*</span>
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${errors.installationDate && touched.installationDate ? "border-red-500" : ""}`}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {values.installationDate ? (
                                            formatDateForDisplay(values.installationDate)
                                        ) : (
                                            <span>Seleccione fecha de instalación</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[10000]" align="start">
                                    <Calendar
                                        variant="future"
                                        mode="single"
                                        selected={values.installationDate ? new Date(values.installationDate) : undefined}
                                        onSelect={(date) => {
                                            console.log('📅 InstalacionStep - Fecha seleccionada del calendario:', date);
                                            const normalizedDate = normalizeCalendarDate(date);
                                            console.log('📅 InstalacionStep - Fecha normalizada:', normalizedDate);
                                            onChange("installationDate", normalizedDate);
                                            handleBlur("installationDate");
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.installationDate && touched.installationDate && (
                                <div className="flex items-center gap-2 text-sm text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.installationDate}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dirección IP */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="ipAddress" className="text-sm font-medium text-foreground">
                                Dirección IP
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    const suggestedIP = generateSuggestedIP();
                                    onChange("ipAddress", suggestedIP);
                                }}
                                className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                            >
                                Generar IP
                            </button>
                        </div>
                        <IPAddressInput
                            value={values.ipAddress || ""}
                            onChange={(value) => onChange("ipAddress", value)}
                            placeholder="192.168.1.100"
                            className="w-full"
                        />
                    </div>


                </div>
            )}

            {/* Mensaje cuando no hay servicio seleccionado */}
            {!selectedServiceType && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center animate-in fade-in-0 duration-300">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                            <Wifi className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                                Seleccione un tipo de servicio
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300">
                                Elija entre servicio inalámbrico o fibra óptica para continuar
                            </p>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
} 