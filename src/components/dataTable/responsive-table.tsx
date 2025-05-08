import { useIsMobile } from "@/hooks/use-mobile"
import type React from "react"
import { CardTable, Header } from "./card-table"
import { GeneralTable } from "./table"

interface ResponsiveTableProps<TData extends Record<string, React.ReactNode>> {
    columns: any[]
    headers: Header[];
    data: any[]
    isLoading?: boolean
    error?: any
    actions?: any
    onPaginationChange?: (page: number, pageSize: number) => void
    totalRecords?: number
    pageSize?: number
}

export function ResponsiveTable<TData extends Record<string, React.ReactNode>>({
    columns,
    headers,
    data,
    isLoading = false,
    error = null,
    actions,
    onPaginationChange,
    totalRecords = 0,
    pageSize = 10,
}: ResponsiveTableProps<TData>) {
    const isMobile = useIsMobile()

    return (
        <>
            {isMobile ? (
                <CardTable
                    headers={headers}
                    data={data}
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
                />
            )}
        </>
    )
}