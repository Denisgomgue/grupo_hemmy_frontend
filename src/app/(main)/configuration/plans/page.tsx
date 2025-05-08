"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { columns } from "./_components/columns"
import { toast } from "sonner"
import api from "@/lib/axios"
import { usePlans } from "@/hooks/use-plan"
import { PlanForm } from "./_components/plan-form"
import type { PlanFormData } from "@/schemas/plan-schema"
import type { Plan } from "@/types/plans/plan"
import Can from "@/components/permission/can";
import { ResponsiveTable } from "@/components/dataTable/responsive-table"
import { headers } from "./_components/headers"
import { ActionsCell } from "./_components/actions-cell"
import { PlusCircle } from "lucide-react";

export default function PlanPage() {
    const { plans, refreshPlans } = usePlans()
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentData, setCurrentData] = useState<Plan | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    useEffect(() => {
        fetchData()
    }, [])

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        return plans.slice(start, end)
    }, [plans, currentPage, pageSize])

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
            await refreshPlans(currentPage, pageSize)
        } catch (error) {
            toast.error("Error al cargar los planes")
            console.error("Error fetching plans:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreatePlan = async (planData: PlanFormData) => {
        console.log(planData)
        setIsLoading(true)
        try {
            await api.post<PlanFormData>("/plans", planData)
            toast.success("Plan creado correctamente")
            await refreshPlans()
            setIsDialogOpen(false)
        } catch (error) {
            toast.error("Error al crear el plan")
            console.error("Error creating plan:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Can action="ver-plan" subject="plan" redirectOnFail={true}>
            <div className="container mx-auto bg-white dark:bg-slate-900 p-4 rounded-md border">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-xl font-bold mb-4 md:mb-0 text-center md:text-3xl md:text-left">Planes</h1>
                    <div className="flex md:flex-row flex-col justify-between items-center gap-2">
                        <Can action="crear-plan" subject="plan">
                            <Button
                                onClick={() => {
                                    setIsDialogOpen(true)
                                    setCurrentData(null)
                                }}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Plan
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
                    totalRecords={plans.length}
                    pageSize={pageSize}
                    onPaginationChange={handlePaginationChange}
                    actions={(row: Plan) => <ActionsCell rowData={row} />}
                />

                {isDialogOpen && (
                    <PlanForm
                        open={isDialogOpen}
                        isEdit={currentData}
                        onSave={handleCreatePlan}
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