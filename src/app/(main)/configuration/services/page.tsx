"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { columns } from "./_components/columns"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useServices } from "@/hooks/use-service"
import { ServiceForm } from "./_components/service-form"
import type { ServicesFormData } from "@/schemas/services-shema"
import type { Service } from "@/types/services/service"
import Can from "@/components/permission/can";
import { ResponsiveTable } from "@/components/dataTable/responsive-table"
import { headers } from "./_components/headers"
import { ActionsCell } from "./_components/actions-cell"
import { PlusCircle } from "lucide-react";

export default function ServicePage() {
    const { services, refreshService } = useServices()
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentData, setCurrentData] = useState<Service | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    useEffect(() => {
        fetchData()
    }, [])

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        return services.slice(start, end)
    }, [services, currentPage, pageSize])

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
            await refreshService(currentPage, pageSize)
        } catch (error) {
            toast.error("Error al cargar los servicios")
            console.error("Error fetching services:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateService = async (serviceData: ServicesFormData) => {
        setIsLoading(true)
        try {
            await api.post<ServicesFormData>("/services", serviceData)
            toast.success("Servicio creado correctamente")
            await refreshService()
            setIsDialogOpen(false)
        } catch (error) {
            toast.error("Error al crear el servicio")
            console.error("Error creating service:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Can action="ver-servicio" subject="servicio" redirectOnFail={true}>
            <div className="container mx-auto bg-white dark:bg-slate-900 p-4 rounded-md border">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-xl font-bold mb-4 md:mb-0 text-center md:text-3xl md:text-left">Servicios</h1>
                    <div className="flex md:flex-row flex-col justify-between items-center gap-2">
                        <Can action="crear-servicio" subject="servicio">
                            <Button
                                onClick={() => {
                                    setIsDialogOpen(true)
                                    setCurrentData(null)
                                }}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Servicio
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
                    totalRecords={services.length}
                    pageSize={pageSize}
                    onPaginationChange={handlePaginationChange}
                    actions={(row: Service) => <ActionsCell rowData={row} />}
                />

                {isDialogOpen && (
                    <ServiceForm
                        open={isDialogOpen}
                        isEdit={currentData}
                        onSave={handleCreateService}
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