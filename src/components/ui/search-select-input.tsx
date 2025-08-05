import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from './input';
import { Button } from './button';
import { ScrollArea } from './scroll-area';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchSelectOption {
    value: string | number;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export interface SearchSelectInputProps {
    // Props básicas
    value?: string | number;
    onChange: (value: string | number) => void;
    onSearch?: (query: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    className?: string;

    // Props de opciones
    options: SearchSelectOption[];
    isLoading?: boolean;
    emptyMessage?: string;
    noResultsMessage?: string;

    // Props de configuración
    searchable?: boolean;
    clearable?: boolean;
    multiple?: boolean;
    maxHeight?: number;
    minSearchLength?: number;
    debounceMs?: number;

    // Props de renderizado
    renderOption?: (option: SearchSelectOption, isSelected: boolean) => React.ReactNode;
    renderSelected?: (option: SearchSelectOption) => React.ReactNode;

    // Props de filtrado
    filterOptions?: (options: SearchSelectOption[], query: string) => SearchSelectOption[];

    // Props de eventos
    onOpen?: () => void;
    onClose?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

export function SearchSelectInput({
    value,
    onChange,
    onSearch,
    placeholder = "Buscar y seleccionar...",
    disabled = false,
    error = false,
    className,
    options = [],
    isLoading = false,
    emptyMessage = "No hay opciones disponibles",
    noResultsMessage = "No se encontraron resultados",
    searchable = true,
    clearable = true,
    multiple = false,
    maxHeight = 200,
    minSearchLength = 0,
    debounceMs = 300,
    renderOption,
    renderSelected,
    filterOptions,
    onOpen,
    onClose,
    onFocus,
    onBlur
}: SearchSelectInputProps) {
    const [ isOpen, setIsOpen ] = useState(false);
    const [ searchQuery, setSearchQuery ] = useState('');
    const [ selectedOption, setSelectedOption ] = useState<SearchSelectOption | null>(null);
    const [ filteredOptions, setFilteredOptions ] = useState<SearchSelectOption[]>(options);
    const [ highlightedIndex, setHighlightedIndex ] = useState(-1);
    const [ isAnimating, setIsAnimating ] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Encontrar la opción seleccionada basada en el valor
    useEffect(() => {
        if (value !== undefined) {
            const option = options.find(opt => opt.value === value);
            setSelectedOption(option || null);
        } else {
            setSelectedOption(null);
        }
    }, [ value, options ]);

    // Filtrar opciones basado en la búsqueda
    useEffect(() => {
        // Si tenemos onSearch (búsqueda en backend), usar todas las opciones
        if (onSearch) {
            setFilteredOptions(options);
            return;
        }

        if (searchQuery.length < minSearchLength) {
            setFilteredOptions(options);
            return;
        }

        if (filterOptions) {
            setFilteredOptions(filterOptions(options, searchQuery));
        } else {
            const filtered = options.filter(option =>
                option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                option.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredOptions(filtered);
        }
    }, [ searchQuery, options, minSearchLength, filterOptions, onSearch ]);

    // Cerrar dropdown cuando se selecciona una opción
    useEffect(() => {
        if (selectedOption && isOpen) {
            // Pequeño delay para permitir que la animación de selección se complete
            const timer = setTimeout(() => {
                if (!isAnimating) {
                    handleClose();
                }
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [ selectedOption, isOpen, isAnimating ]);

    // Debounce para la búsqueda
    useEffect(() => {
        if (onSearch && searchQuery.length >= minSearchLength) {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            searchTimeoutRef.current = setTimeout(() => {
                onSearch(searchQuery);
            }, debounceMs);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [ searchQuery, onSearch, minSearchLength, debounceMs ]);

    // Manejar navegación con teclado
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpen();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[ highlightedIndex ]) {
                    handleSelectOption(filteredOptions[ highlightedIndex ]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                handleClose();
                break;
        }
    }, [ isOpen, filteredOptions, highlightedIndex ]);

    const handleSelectOption = (option: SearchSelectOption) => {
        if (option.disabled) return;

        // Animación suave de selección
        setIsAnimating(true);

        onChange(option.value);
        setSelectedOption(option);
        setSearchQuery('');
        setHighlightedIndex(-1);

        // Cerrar inmediatamente después de la selección
        handleClose();

        // Resetear el estado de animación después de un breve delay
        setTimeout(() => {
            setIsAnimating(false);

            // Mantener el focus en el input principal después de la selección
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }, 100);
    };

    const handleClear = () => {
        onChange('');
        setSelectedOption(null);
        setSearchQuery('');
        inputRef.current?.focus();
    };

    const handleOpen = () => {
        if (disabled || isAnimating) return;

        setIsOpen(true);
        setHighlightedIndex(-1);
        onOpen?.();
    };

    const handleClose = () => {
        if (isAnimating) return;

        setIsOpen(false);
        setHighlightedIndex(-1);
        onClose?.();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setSearchQuery(newQuery);

        if (!isOpen && newQuery.length > 0) {
            handleOpen();
        }
    };

    const handleInputFocus = () => {
        if (!disabled) {
            handleOpen();
        }
        onFocus?.();
    };

    const handleInputBlur = () => {
        // Solo cerrar si no estamos en medio de una animación y el focus no está en el dropdown
        setTimeout(() => {
            if (!isAnimating && !dropdownRef.current?.contains(document.activeElement)) {
                handleClose();
            }
        }, 150);
        onBlur?.();
    };

    // Renderizado por defecto de una opción
    const defaultRenderOption = (option: SearchSelectOption, isSelected: boolean) => (
        <div
            className={cn(
                "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-150",
                isSelected && "bg-accent text-accent-foreground",
                option.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => handleSelectOption(option)}
        >
            <div className="flex items-center gap-2">
                {option.icon}
                <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                    )}
                </div>
            </div>
            {isSelected && <Check className="h-4 w-4" />}
        </div>
    );

    // Renderizado por defecto del elemento seleccionado
    const defaultRenderSelected = (option: SearchSelectOption) => (
        <div className="flex items-center gap-2">
            {option.icon}
            <span>{option.label}</span>
        </div>
    );

    return (
        <div className={cn("relative", className)}>
            <div className="relative">
                <Input
                    ref={inputRef}
                    type="text"
                    value={selectedOption?.label || ''}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        "pr-10 transition-all duration-200",
                        error && "border-destructive focus-visible:ring-destructive",
                        isOpen && "ring-2 ring-ring ring-offset-2"
                    )}
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {clearable && selectedOption && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground transition-colors duration-150"
                            onClick={handleClear}
                            disabled={disabled}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-6 w-6 p-0 transition-all duration-200",
                            isOpen && "rotate-180"
                        )}
                        onClick={isOpen ? handleClose : handleOpen}
                        disabled={disabled}
                    >
                        <ChevronsUpDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute z-[9999] w-full mt-1 bg-popover border rounded-md shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                >
                    <ScrollArea className="max-h-[300px] overflow-y-auto">
                        {searchable && (
                            <div className="p-2 border-b">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 transition-all duration-200"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            // Prevenir que el evento se propague al input principal
                                            e.stopPropagation();
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="py-1">
                            {isLoading ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    Cargando...
                                </div>
                            ) : filteredOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    {options.length === 0 ? emptyMessage : noResultsMessage}
                                </div>
                            ) : (
                                filteredOptions.map((option, index) => (
                                    <div
                                        key={option.value}
                                        className={cn(
                                            highlightedIndex === index && "bg-accent",
                                            "transition-colors duration-150"
                                        )}
                                    >
                                        {renderOption
                                            ? renderOption(option, option.value === value)
                                            : defaultRenderOption(option, option.value === value)
                                        }
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
} 