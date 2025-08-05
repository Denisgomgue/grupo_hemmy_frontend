import React, { useState, useEffect } from 'react';
import { SearchSelectInput, SearchSelectOption } from '@/components/ui/search-select-input';
import { Client } from '@/types/clients/client';
import { useClient } from '@/hooks/use-client';
import { User, MapPin, Phone } from 'lucide-react';

interface ClientSearchSelectProps {
    value?: number;
    onChange: (clientId: number) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    className?: string;
    onClientSelect?: (client: Client) => void;
}

export function ClientSearchSelect({
    value,
    onChange,
    placeholder = "Buscar cliente...",
    disabled = false,
    error = false,
    className,
    onClientSelect
}: ClientSearchSelectProps) {
    const [ options, setOptions ] = useState<SearchSelectOption[]>([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const { refreshClient } = useClient();

    const loadClients = async (searchQuery?: string) => {
        setIsLoading(true);
        try {
            const result = await refreshClient(1, 50, searchQuery);
            const clientOptions: SearchSelectOption[] = result.data.map(client => ({
                value: client.id,
                label: `${client.name || ''} ${client.lastName || ''}`.trim() || 'Sin nombre',
                description: `DNI: ${client.dni}${client.phone ? ` • ${client.phone}` : ''}`,
                icon: <User className="h-4 w-4" />
            }));
            setOptions(clientOptions);
        } catch (error) {
            console.error('Error loading clients:', error);
            setOptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const handleSearch = (query: string) => {
        loadClients(query);
    };

    const handleClientSelect = (clientId: number) => {
        onChange(clientId);
        const selectedClient = options.find(opt => opt.value === clientId);
        if (selectedClient && onClientSelect) {
            // Encontrar el cliente completo en los datos
            const client = options.find(opt => opt.value === clientId);
            if (client) {
                // Aquí necesitarías obtener el cliente completo del hook
                // Por ahora solo pasamos el ID
                onClientSelect({ id: clientId } as Client);
            }
        }
    };

    const renderClientOption = (option: SearchSelectOption, isSelected: boolean) => (
        <div
            className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground ${isSelected ? 'bg-accent text-accent-foreground' : ''
                }`}
            onClick={() => handleClientSelect(option.value as number)}
        >
            <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
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
            onChange={handleClientSelect}
            onSearch={handleSearch}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            className={className}
            options={options}
            isLoading={isLoading}
            emptyMessage="No hay clientes disponibles"
            noResultsMessage="No se encontraron clientes"
            renderOption={renderClientOption}
            minSearchLength={2}
            debounceMs={500}
        />
    );
} 