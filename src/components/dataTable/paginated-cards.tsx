import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginatedCardsProps<T> {
    data: T[]
    totalRecords: number
    pageSize: number
    onPaginationChange: (page: number, pageSize: number) => void
    renderCard: (item: T) => React.ReactNode
    isLoading?: boolean
}

export function PaginatedCards<T>({
    data,
    totalRecords,
    pageSize,
    onPaginationChange,
    renderCard,
    isLoading = false,
}: PaginatedCardsProps<T>) {
    const [ currentPage, setCurrentPage ] = useState(1)
    const totalPages = Math.ceil(totalRecords / pageSize)

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        setCurrentPage(newPage)
        onPaginationChange(newPage, pageSize)
    }

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(e.target.value)
        setCurrentPage(1)
        onPaginationChange(1, newSize)
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch gap-4 mt-5">
                {isLoading
                    ? Array.from({ length: pageSize }).map((_, i) => (
                        <div key={i} className="h-64 rounded-lg bg-muted animate-pulse " />
                    ))
                    : data.map((item) => (
                        <div key={(item as any).id} className="h-full flex flex-col">
                            {renderCard(item)}
                        </div>
                    ))}
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 p-2 border-t">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mostrar:</span>
                    <select
                        className="h-8 w-[70px] border rounded px-2"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        disabled={isLoading}
                    >
                        {[ 5, 10, 20, 50 ].map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2 justify-center ">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
} 