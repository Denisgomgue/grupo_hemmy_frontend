import { useIsMobile } from "@/hooks/use-mobile"
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
    const isMobile = useIsMobile()
    const onPaginationChange = pagination?.onPaginationChange
    const totalRecords = pagination?.totalRecords || 0
    const pageSize = pagination?.pageSize || 10
    const currentPage = pagination?.currentPage || 1

    return (
        <>
            {isMobile ? (
                <CardTable
                    headers={headers}
                    data={data as Record<string, React.ReactNode>[]}
                    actions={actions as (item: Record<string, React.ReactNode>) => React.ReactNode}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    onPaginationChange={(page, newPageSize) => onPaginationChange?.(page, newPageSize)}
                    isLoading={isLoading}
                />
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