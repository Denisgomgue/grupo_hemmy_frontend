"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { columns } from "./_components/columns"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useSectors } from "@/hooks/use-sector"
import { SectorForm } from "./_components/sector-form"
import type { SectorsFormData } from "@/schemas/sectors-schema"
import type { Sector } from "@/types/sectors/sector"
import Can from "@/components/permission/can";
import { ResponsiveTable } from "@/components/dataTable/responsive-table"
import { headers } from "./_components/headers"
import { ActionsCell } from "./_components/actions-cell"
import { PlusCircle } from "lucide-react";

export default function SectorPage() {
    const { sectors, refreshSector } = useSectors()
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentData, setCurrentData] = useState<Sector | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    useEffect(() => {
        fetchData()
    }, [])

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        return sectors.slice(start, end)
    }, [sectors, currentPage, pageSize])

    const handlePaginationChange = (page: number, newPageSize: number) => {
        setCurrentPage(page)
        if (newPageSize !== pageSize) {
            setPageSize(newPageSize)
            setCurrentPage(1)
        }
    }

    const fetchData = async () => {
        setIsLoading(true)
        try {
            await refreshSector(currentPage, pageSize)
        } catch (error) {
            toast.error("Error al cargar los sectores")
            console.error("Error fetching sectors:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateSector = async (sectorData: SectorsFormData) => {
        // console.log(sectorData)
        setIsLoading(true)
        try {
            await api.post<SectorsFormData>("/sectors", sectorData)
            toast.success("Sector creado correctamente")
            await refreshSector()
            setIsDialogOpen(false)
        } catch (error) {
            toast.error("Error al crear el sector")
            console.error("Error creating sector:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Can action="ver-sector" subject="sector" redirectOnFail={true}>
            <div className="container mx-auto bg-white dark:bg-slate-900 p-4 rounded-md border">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-xl font-bold mb-4 md:mb-0 text-center md:text-3xl md:text-left">Sectores</h1>
                    <div className="flex md:flex-row flex-col justify-between items-center gap-2">
                        <Can action="crear-sector" subject="sector">
                            <Button
                                onClick={() => {
                                    setIsDialogOpen(true)
                                    setCurrentData(null)
                                }}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Sector
                            </Button>
                        </Can>
                        <Button
                            variant="outline"
                            onClick={() => fetchData()}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            Recargar Datos
                        </Button>
                    </div>
                </div>

                <ResponsiveTable
                    columns={columns}
                    headers={headers}
                    data={paginatedData}
                    isLoading={isLoading}
                    totalRecords={sectors.length}
                    pageSize={pageSize}
                    onPaginationChange={handlePaginationChange}
                    actions={(row: Sector) => <ActionsCell rowData={row} />}
                />

                {isDialogOpen && (
                    <SectorForm
                        open={isDialogOpen}
                        isEdit={currentData}
                        onSave={handleCreateSector}
                        onClose={() => {
                            setIsDialogOpen(false)
                            setCurrentData(null)
                        }}
                        loading={isLoading}
                    />
                )}
            </div>
        </Can>
    )
}