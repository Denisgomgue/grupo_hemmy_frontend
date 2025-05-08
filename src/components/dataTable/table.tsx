"use client"

import { GoSortAsc, GoSortDesc } from "react-icons/go"
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

interface GeneralTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
    error?: string | null
    className?: string
    onPaginationChange?: (page: number, pageSize: number) => void
    totalRecords?: number
    pageSize?: number
}

export function GeneralTable<TData, TValue>({
    columns,
    data,
    isLoading = false,
    error = null,
    className,
    onPaginationChange,
    totalRecords,
    pageSize: initialPageSize = 10,
}: GeneralTableProps<TData, TValue>) {
    const [pageSize, setPageSize] = useState(initialPageSize)
    const [pageIndex, setPageIndex] = useState(0)
    const [goToPage, setGoToPage] = useState("1")

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: totalRecords !== undefined,
        pageCount: totalRecords !== undefined ? Math.ceil(totalRecords / pageSize) : Math.ceil(data.length / pageSize),
        state: {
            pagination: {
                pageSize,
                pageIndex,
            },
        },
        onPaginationChange: (updater) => {
            const newState = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater
            setPageIndex(newState.pageIndex)
            setPageSize(newState.pageSize)
            if (onPaginationChange) {
                onPaginationChange(newState.pageIndex + 1, newState.pageSize)
            }
        },
    })

    useEffect(() => {
        table.setPageSize(initialPageSize)
    }, [initialPageSize, table])

    const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const page = Number.parseInt(goToPage)
            if (!isNaN(page) && page >= 1 && page <= table.getPageCount()) {
                table.setPageIndex(page - 1)
            } else {
                setGoToPage((pageIndex + 1).toString())
            }
        }
    }

    useEffect(() => {
        setGoToPage((pageIndex + 1).toString())
    }, [pageIndex])

    const renderPageButtons = () => {
        const totalPages = table.getPageCount()
        const currentPage = pageIndex + 1
        const buttons = []

        buttons.push(
            <Button
                key="prev"
                variant="ghost"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isLoading}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>,
        )

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                buttons.push(
                    <Button
                        key={i}
                        variant={i === currentPage ? "default" : "ghost"}
                        size="sm"
                        onClick={() => table.setPageIndex(i - 1)}
                        className={cn("min-w-[32px] px-3.5 rounded-full", i === currentPage && "rounded-full")}
                    >
                        {i}
                    </Button>,
                )
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                buttons.push(
                    <Button key={`ellipsis-${i}`} variant="ghost" size="sm" disabled className="min-w-[32px] px-2">
                        ...
                    </Button>,
                )
            }
        }

        buttons.push(
            <Button
                key="next"
                variant="ghost"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isLoading}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>,
        )

        return buttons
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">Error: {error}</div>
    }

    return (
        <div className="w-full">
            <ScrollArea className="w-full overflow-x-auto space-y-4">
                <ScrollBar orientation="horizontal" className="top-0" />
                <Table
                    className={cn(
                        "overflow-hidden rounded-md",
                        "bg-white dark:bg-gray-800 border dark:border-gray-700",
                        className,
                    )}
                >
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-gray-100 dark:bg-gray-900">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-primary dark:text-gray-300 font-bold text-xs h-12 p-0">
                                        {header.isPlaceholder ? null : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "bg-transparent select-none w-full hover:bg-gray-200 dark:hover:bg-gray-800",
                                                    "hover:text-primary dark:hover:text-white",
                                                    header.column.getIsSorted() && "bg-primary/10 dark:bg-primary/20",
                                                )}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{
                                                    asc: <GoSortAsc className="ml-1 w-4 h-4 shrink-0" />,
                                                    desc: <GoSortDesc className="ml-1 w-4 h-4 shrink-0" />,
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </Button>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, index) => (
                                <TableRow key={`row-${index}`} className="dark:bg-[#252526]">
                                    {[...Array(table.getAllColumns().length)].map((_, cellIndex) => (
                                        <TableCell key={`cell-${cellIndex}`} className="dark:border-gray-700">
                                            <Skeleton className="h-14" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="text-gray-800 dark:text-gray-300 dark:border-gray-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getAllColumns().length}
                                    className="h-24 text-center text-primary dark:text-gray-300 bg-gray-200 dark:bg-gray-900 p-12"
                                >
                                    No hay resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
            <div className="flex flex-col gap-4 p-4 border-t md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-2 justify-between md:justify-start">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Display:</span>
                            <Select
                                value={`${pageSize}`}
                                onValueChange={(value) => table.setPageSize(Number(value))}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[5, 10, 20, 50].map((size) => (
                                        <SelectItem key={size} value={`${size}`}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Page</span>
                            <span className="text-sm font-medium">{pageIndex + 1}</span>
                            <span className="text-sm text-muted-foreground">of</span>
                            <span className="text-sm font-medium">
                                {totalRecords ? Math.ceil(totalRecords / pageSize) : Math.ceil(data.length / pageSize)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 justify-between md:justify-start">
                        <span className="text-sm text-muted-foreground">Go to page:</span>
                        <Input
                            type="number"
                            min={1}
                            max={table.getPageCount()}
                            value={goToPage}
                            onChange={(e) => setGoToPage(e.target.value)}
                            onKeyDown={handleGoToPage}
                            className="h-8 w-[70px]"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-center gap-1 w-full md:w-auto">{renderPageButtons()}</div>
            </div>
        </div>
    )
}