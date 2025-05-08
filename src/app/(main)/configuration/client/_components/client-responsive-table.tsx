"use client";

import * as React from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Client } from "@/types/clients/client";
import { ClientCard } from "./client-card";
import { GeneralTable } from "@/components/dataTable/table"; 
import { baseColumns } from "./columns"; 
import {
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    RowSelectionState
} from "@tanstack/react-table";

interface ClientResponsiveTableProps {
    data: Client[];
    isLoading?: boolean;
    onEdit: (client: Client) => void; 
    onPaginationChange?: (page: number, pageSize: number) => void;
    totalRecords?: number;
    pageSize?: number;
    currentPage?: number; 
}

export function ClientResponsiveTable({
    data,
    isLoading = false,
    onEdit,
    onPaginationChange,
    totalRecords = 0,
    pageSize = 10,
    currentPage = 1
}: ClientResponsiveTableProps) {
    const isMobile = useIsMobile();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const adaptedColumns = React.useMemo(() => baseColumns.map(col => ({
        ...col,
        meta: { // Añadir meta información si GeneralTable/columnas lo usan
            ...(col.meta as object || {}),
            onEdit: onEdit
        }
    })), [onEdit]);
    // -----------------------------------------------------------------------------

    return (
        <div className="w-full">
            {isMobile ? (
                // --- Vista Móvil: Renderizar ClientCard --- 
                <div className="grid grid-cols-1 gap-4">
                    {isLoading && (
                         // Esqueleto o indicador de carga para tarjetas
                         Array.from({ length: pageSize }).map((_, index) => (
                            <div key={index} className="p-4 border rounded-lg shadow-sm h-60 animate-pulse bg-muted"></div>
                        ))
                    )}
                    {!isLoading && data.length === 0 && (
                        <p className="text-center text-muted-foreground col-span-full py-10">
                            No hay clientes para mostrar.
                        </p>
                    )}
                    {!isLoading && data.map((client) => (
                        <ClientCard key={client.id} client={client} onEdit={onEdit} />
                    ))}
                    {/* TODO: Añadir controles de paginación para la vista móvil si es necesario */} 
                     {/* {!isLoading && totalRecords > pageSize && (
                         <MobilePagination ... /> 
                     )} */}
                </div>
            ) : (
                 // --- Vista Escritorio: Renderizar GeneralTable --- 
                 // Pasar las props que GeneralTable necesite. Ajustar según tu implementación.
                <GeneralTable
                    columns={adaptedColumns} // Usar columnas adaptadas con onEdit en meta
                    data={data}
                    isLoading={isLoading}
                    // Pasar estados y handlers si GeneralTable usa react-table directamente
                    // sorting={sorting}
                    // setSorting={setSorting}
                    // columnFilters={columnFilters}
                    // setColumnFilters={setColumnFilters}
                    // columnVisibility={columnVisibility}
                    // setColumnVisibility={setColumnVisibility}
                    // rowSelection={rowSelection}
                    // setRowSelection={setRowSelection}
                    // Pasar props de paginación
                    onPaginationChange={onPaginationChange}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    //currentPage={currentPage} // GeneralTable necesita saber la página actual
                />
                 /* Paginación para la tabla si no está incluida en GeneralTable 
                 <div className="py-4">
                     <DataTablePagination table={table} /> // Necesitarías la instancia 'table'
                 </div>
                 */ 
            )}
        </div>
    );
} 