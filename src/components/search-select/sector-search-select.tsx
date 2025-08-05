import React, { useState, useEffect } from 'react';
import { SearchSelectInput, SearchSelectOption } from '@/components/ui/search-select-input';
import { Sector } from '@/types/sectors/sector';
import { useSector } from '@/hooks/use-sector';
import { MapPin } from 'lucide-react';

interface SectorSearchSelectProps {
    value?: number;
    onChange: (sectorId: number) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    className?: string;
    onSectorSelect?: (sector: Sector) => void;
}

export function SectorSearchSelect({
    value,
    onChange,
    placeholder = "Buscar sector...",
    disabled = false,
    error = false,
    className,
    onSectorSelect
}: SectorSearchSelectProps) {
    const [ options, setOptions ] = useState<SearchSelectOption[]>([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const { fetchSectors } = useSector();

    const loadSectors = async (searchQuery?: string) => {
        setIsLoading(true);
        try {
            const result = await fetchSectors(1, 50, searchQuery);
            const sectorOptions: SearchSelectOption[] = result.data.map(sector => ({
                value: sector.id,
                label: sector.name,
                description: sector.description || 'Sin descripción',
                icon: <MapPin className="h-4 w-4" />
            }));
            setOptions(sectorOptions);
        } catch (error) {
            console.error('Error loading sectors:', error);
            setOptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSectors();
    }, []);

    const handleSearch = (query: string) => {
        loadSectors(query);
    };

    const handleSectorSelect = (sectorId: number) => {
        onChange(sectorId);
        const selectedSector = options.find(opt => opt.value === sectorId);
        if (selectedSector && onSectorSelect) {
            // Aquí necesitarías obtener el sector completo del hook
            onSectorSelect({ id: sectorId } as Sector);
        }
    };

    const renderSectorOption = (option: SearchSelectOption, isSelected: boolean) => (
        <div
            className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground ${isSelected ? 'bg-accent text-accent-foreground' : ''
                }`}
            onClick={() => handleSectorSelect(option.value as number)}
        >
            <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
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
            onChange={handleSectorSelect}
            onSearch={handleSearch}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            className={className}
            options={options}
            isLoading={isLoading}
            emptyMessage="No hay sectores disponibles"
            noResultsMessage="No se encontraron sectores"
            renderOption={renderSectorOption}
            minSearchLength={2}
            debounceMs={500}
        />
    );
} 