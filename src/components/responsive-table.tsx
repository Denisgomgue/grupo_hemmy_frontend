"use client";

import * as React from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { GeneralTable } from "@/components/dataTable/table"; // Asumiendo tabla de escritorio genérica
// Importar tipos necesarios de @tanstack/react-table
import {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    RowSelectionState
} from "@tanstack/react-table";
// Importar componente de paginación si GeneralTable no lo incluye o si se quiere genérico
// import { DataTablePagination } from "@/components/dataTable/data-table-pagination";

// Definir interfaz genérica para props
interface ResponsiveTableProps<T> {
    data: T[];
    columns: ColumnDef<T, any>[]; 
    headers: any[]; 
    renderCard?: (item: T) => React.ReactNode; 
    isLoading?: boolean;
    // Props de paginación
    pagination?: {
        onPaginationChange?: (page: number, pageSize: number) => void;
        totalRecords?: number;
        pageSize?: number;
        currentPage?: number;
    };
    error?: any;
    // Opcional: Prop para pasar acciones a las tarjetas si es necesario
    // cardActions?: { [key: string]: (item: T) => void };
}

export function ResponsiveTable<T>({
    data,
    columns,
    headers,
    renderCard,
    isLoading = false,
    pagination,
    error,
    // cardActions
}: ResponsiveTableProps<T>) {
    const isMobile = useIsMobile();

    // --- Lógica para GeneralTable (puede necesitar ajustes si no es genérica) ---
    // Esta lógica asume que GeneralTable puede manejar columnas y datos genéricos.
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    // Adaptar columnas podría ser necesario si GeneralTable necesita acciones específicas
    // const adaptedColumns = React.useMemo(() => columns.map(col => ({ ... })), [columns]);
    // Por ahora, pasamos las columnas directamente
    // -----------------------------------------------------------------------------

    return (
        <div className="w-full">
            {isMobile ? (
                // --- Vista Móvil: Renderizar usando renderCard --- 
                <div className="grid grid-cols-1 gap-4">
                    {isLoading && (
                        // Esqueleto genérico para tarjetas
                        Array.from({ length: pagination?.pageSize || 10 }).map((_, index) => (
                            <div key={index} className="p-4 border rounded-lg shadow-sm h-60 animate-pulse bg-muted"></div>
                        ))
                    )}
                    {!isLoading && data.length === 0 && (
                        <p className="text-center text-muted-foreground col-span-full py-10">
                            No hay elementos para mostrar.
                        </p>
                    )}
                    {/* Mapear sobre data y llamar a renderCard si está disponible, o mostrar una tarjeta predeterminada */ 
                    !isLoading && data.map((item, index) => (
                         // Usar un key estable, idealmente item.id si existe y es único
                        <React.Fragment key={(item as any).id ?? index}>
                           {renderCard ? renderCard(item) : (
                             <div className="p-4 border rounded-lg">
                               {/* Renderizado predeterminado de tarjeta */}
                               <p>Elemento {index+1}</p>
                             </div>
                           )}
                        </React.Fragment>
                    ))}
                    {/* TODO: Añadir controles de paginación móvil genéricos si es necesario */} 
                </div>
            ) : (
                 // --- Vista Escritorio: Renderizar GeneralTable --- 
                 // Pasar columnas y datos genéricos
                <GeneralTable
                    columns={columns} 
                    data={data}
                    isLoading={isLoading}
                    error={error}
                    // Pasar props de paginación
                    onPaginationChange={pagination?.onPaginationChange}
                    totalRecords={pagination?.totalRecords}
                    pageSize={pagination?.pageSize}
                />
            )}
        </div>
    );
} 