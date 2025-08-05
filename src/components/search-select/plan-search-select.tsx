import React, { useState, useEffect } from 'react';
import { SearchSelectInput, SearchSelectOption } from '@/components/ui/search-select-input';
import { Plan } from '@/types/plans/plan';
import { usePlans } from '@/hooks/use-plan';
import { Wifi, DollarSign } from 'lucide-react';

interface PlanSearchSelectProps {
    value?: number;
    onChange: (planId: number) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    className?: string;
    onPlanSelect?: (plan: Plan) => void;
}

export function PlanSearchSelect({
    value,
    onChange,
    placeholder = "Buscar plan...",
    disabled = false,
    error = false,
    className,
    onPlanSelect
}: PlanSearchSelectProps) {
    const [ options, setOptions ] = useState<SearchSelectOption[]>([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ allPlans, setAllPlans ] = useState<Plan[]>([]);
    const { plans, refreshPlans } = usePlans();

    const loadPlans = async () => {
        setIsLoading(true);
        try {
            const result = await refreshPlans(1, 100); // Cargar más planes para mejor búsqueda
            setAllPlans(result.data);
            const planOptions: SearchSelectOption[] = result.data.map(plan => ({
                value: plan.id,
                label: plan.name,
                description: `Velocidad: ${plan.speed || 'N/A'} Mbps • Precio: S/. ${plan.price || 'N/A'}`,
                icon: <Wifi className="h-4 w-4" />
            }));
            setOptions(planOptions);
        } catch (error) {
            console.error('Error loading plans:', error);
            setOptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPlans();
    }, []);

    const handleSearch = (query: string) => {
        if (!query.trim()) {
            // Si no hay búsqueda, mostrar todos los planes
            const planOptions: SearchSelectOption[] = allPlans.map(plan => ({
                value: plan.id,
                label: plan.name,
                description: `Velocidad: ${plan.speed || 'N/A'} Mbps • Precio: S/. ${plan.price || 'N/A'}`,
                icon: <Wifi className="h-4 w-4" />
            }));
            setOptions(planOptions);
            return;
        }

        // Filtrar planes localmente
        const filteredPlans = allPlans.filter(plan =>
            plan.name.toLowerCase().includes(query.toLowerCase())
        );

        const planOptions: SearchSelectOption[] = filteredPlans.map(plan => ({
            value: plan.id,
            label: plan.name,
            description: `Velocidad: ${plan.speed || 'N/A'} Mbps • Precio: S/. ${plan.price || 'N/A'}`,
            icon: <Wifi className="h-4 w-4" />
        }));
        setOptions(planOptions);
    };

    const handlePlanSelect = (planId: number) => {
        onChange(planId);
        const selectedPlan = allPlans.find(plan => plan.id === planId);
        if (selectedPlan && onPlanSelect) {
            onPlanSelect(selectedPlan);
        }
    };

    const renderPlanOption = (option: SearchSelectOption, isSelected: boolean) => (
        <div
            className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground ${isSelected ? 'bg-accent text-accent-foreground' : ''
                }`}
            onClick={() => handlePlanSelect(option.value as number)}
        >
            <div className="flex items-center gap-3">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
            </div>
        </div>
    );

    return (
        <SearchSelectInput
            value={value}
            onChange={handlePlanSelect}
            onSearch={handleSearch}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            className={className}
            options={options}
            isLoading={isLoading}
            emptyMessage="No hay planes disponibles"
            noResultsMessage="No se encontraron planes"
            renderOption={renderPlanOption}
            minSearchLength={1}
            debounceMs={300}
        />
    );
} 