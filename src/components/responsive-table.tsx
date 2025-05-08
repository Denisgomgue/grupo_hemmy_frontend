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
    columns: ColumnDef<T>[]; // Columnas para la tabla de escritorio
    renderCard: (item: T) => React.ReactNode; // Función para renderizar la tarjeta en móvil
    isLoading?: boolean;
    // Props de paginación
    onPaginationChange?: (page: number, pageSize: number) => void;
    totalRecords?: number;
    pageSize?: number;
    currentPage?: number;
    // Opcional: Prop para pasar acciones a las tarjetas si es necesario
    // cardActions?: { [key: string]: (item: T) => void };
}

export function ResponsiveTable<T>({
    data,
    columns,
    renderCard,
    isLoading = false,
    onPaginationChange,
    totalRecords = 0,
    pageSize = 10,
    currentPage = 1,
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
                        Array.from({ length: pageSize }).map((_, index) => (
                            <div key={index} className="p-4 border rounded-lg shadow-sm h-60 animate-pulse bg-muted"></div>
                        ))
                    )}
                    {!isLoading && data.length === 0 && (
                        <p className="text-center text-muted-foreground col-span-full py-10">
                            No hay elementos para mostrar.
                        </p>
                    )}
                    {/* Mapear sobre data y llamar a renderCard */} 
                    {!isLoading && data.map((item, index) => (
                         // Usar un key estable, idealmente item.id si existe y es único
                        <React.Fragment key={(item as any).id ?? index}>
                           {renderCard(item)}
                        </React.Fragment>
                    ))}
                    {/* TODO: Añadir controles de paginación móvil genéricos si es necesario */} 
                </div>
            ) : (
                 // --- Vista Escritorio: Renderizar GeneralTable --- 
                 // Pasar columnas y datos genéricos
                 // Asumiendo que GeneralTable espera <TData, TValue>
                 // Pasamos unknown como TValue por ahora, ajustar si se conoce el tipo
                <GeneralTable<T, unknown> 
                    columns={columns} 
                    data={data}
                    isLoading={isLoading}
                    // Pasar props de paginación y estado si GeneralTable las necesita
                    onPaginationChange={onPaginationChange}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    // currentPage={currentPage} // Pasar si GeneralTable la controla
                    // Pasar estados de tabla si GeneralTable los necesita externamente
                    // sorting={sorting}
                    // setSorting={setSorting}
                    // ...etc
                />
                 /* Paginación genérica para la tabla si no está incluida 
                 <div className="py-4">
                     <DataTablePagination table={table} /> // Necesitaría instancia 'table'
                 </div>
                 */ 
            )}
        </div>
    );
} 