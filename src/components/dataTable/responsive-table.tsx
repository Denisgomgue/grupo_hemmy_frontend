import { useResponsiveTable } from "@/hooks/use-responsive-view"
import type React from "react"
import { CardTable, Header } from "./card-table"
import { GeneralTable } from "./table"
import { ColumnDef } from "@tanstack/react-table"

interface ResponsiveTableProps<TData> {
    columns: ColumnDef<TData, any>[]
    headers: Header[];
    data: TData[]
    isLoading?: boolean
    error?: any
    actions?: any
    pagination?: {
        onPaginationChange?: (page: number, pageSize: number) => void
        totalRecords?: number
        pageSize?: number
        currentPage?: number
    }
}

export function ResponsiveTable<TData>({
    columns,
    headers,
    data,
    isLoading = false,
    error = null,
    actions,
    pagination,
}: ResponsiveTableProps<TData>) {
    const { isCardsView, deviceType } = useResponsiveTable()
    const onPaginationChange = pagination?.onPaginationChange
    const totalRecords = pagination?.totalRecords || 0
    const pageSize = pagination?.pageSize || 10
    const currentPage = pagination?.currentPage || 1

    return (
        <>
            {isCardsView ? (
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: pageSize }).map((_, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">No hay elementos para mostrar.</p>
                        </div>
                    ) : (
                        <>
                            {data.map((item: any, index: number) => (
                                <div
                                    key={item.id || index}
                                    className="bg-transparent border-none shadow-none"
                                >
                                    {headers[ 0 ] && headers[ 0 ].render ? (
                                        headers[ 0 ].render(item, item)
                                    ) : (
                                        <div>No hay renderizador disponible</div>
                                    )}
                                    {actions && <div className="flex items-center justify-center mt-4">{actions(item)}</div>}
                                </div>
                            ))}

                            {/* Paginación móvil */}
                            {totalRecords > pageSize && (
                                <div className="flex flex-col gap-4 p-4 border-t md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-2 justify-between md:justify-start">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Página</span>
                                            <span className="text-sm font-medium">{currentPage}</span>
                                            <span className="text-sm text-muted-foreground">de</span>
                                            <span className="text-sm font-medium">{Math.ceil(totalRecords / pageSize)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <GeneralTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    error={error}
                    onPaginationChange={(page, newPageSize) => onPaginationChange?.(page, newPageSize)}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    currentPage={currentPage}
                />
            )}
        </>
    )
}