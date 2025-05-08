"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardTableSkeleton } from "./card-table-skeleton"

export interface Header {
    label: string
    key: string
    render?: (value: any, item: any) => React.ReactNode
}

interface CardTableProps {
    headers: Header[]
    data: Record<string, React.ReactNode>[]
    actions?: (item: Record<string, React.ReactNode>) => React.ReactNode
    totalRecords: number
    pageSize: number
    onPaginationChange: (page: number, pageSize: number) => void
    isLoading?: boolean
}

export function CardTable({
    headers,
    data,
    actions,
    totalRecords = 0,
    pageSize = 10,
    onPaginationChange,
    isLoading = false,
}: CardTableProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [currentPageSize, setCurrentPageSize] = useState(pageSize)

    const totalPages = Math.ceil(totalRecords / currentPageSize)

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        setCurrentPage(newPage)
        onPaginationChange(newPage, currentPageSize)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setCurrentPageSize(newPageSize)
        setCurrentPage(1)
        onPaginationChange(1, newPageSize)
    }

    const renderPageButtons = () => {
        const buttons = []
        const currentPageNum = currentPage

        buttons.push(
            <Button
                key="prev"
                variant="ghost"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>,
        )

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPageNum - 2 && i <= currentPageNum + 2)) {
                buttons.push(
                    <Button
                        key={i}
                        variant={i === currentPageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handlePageChange(i)}
                        className={cn("min-w-[32px] px-3.5 rounded-full", i === currentPageNum && "rounded-full")}
                    >
                        {i}
                    </Button>,
                )
            } else if (i === currentPageNum - 3 || i === currentPageNum + 3) {
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>,
        )

        return buttons
    }

    if (isLoading) {
        return <CardTableSkeleton />
    }

    return (
        <div className="space-y-4">
            {data.map((item, index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                    {headers.map((header) => (
                        <div key={header.key} className="mb-2 text-gray-900 dark:text-gray-100">
                            <div className="font-semibold text-sm">{header.label}:</div>
                            <div className="text-base font-medium">
                                {header.render ? header.render(item[header.key], item) : item[header.key]}
                            </div>
                        </div>
                    ))}
                    {actions && <div className="flex items-center justify-center mt-4">{actions(item)}</div>}
                </div>
            ))}

            <div className="flex flex-col gap-4 p-4 border-t md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-2 justify-between md:justify-start">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Display:</span>
                            <Select
                                value={`${currentPageSize}`}
                                onValueChange={(value) => handlePageSizeChange(Number(value))}
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
                            <span className="text-sm font-medium">{currentPage}</span>
                            <span className="text-sm text-muted-foreground">of</span>
                            <span className="text-sm font-medium">{totalPages}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-1 w-full md:w-auto">{renderPageButtons()}</div>
            </div>
        </div>
    )
}