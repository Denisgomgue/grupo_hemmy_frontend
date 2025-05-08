"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import type { Payment } from "@/types/payments/payment"
import { usePayment } from "@/hooks/use-payment"
import api from "@/lib/axios"
import { PaymentForm } from "./_components/payment-form"
import { ResponsiveTable } from "@/components/responsive-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MainContainer } from "@/components/layout/main-container"
import { HeaderActions } from "@/components/layout/header-actions"
import { AddButton } from "@/components/layout/add-button"
import { ReloadButton } from "@/components/layout/reload-button"
import type { PaymentFormData } from "@/schemas/payment-schema"
import { baseColumns } from "./_components/columns"
import { headers } from "./_components/headers"
import { PaymentActionsDropdown } from "./_components/payment-actions-dropdown"
import { PaymentCard } from "./_components/payment-card"
import { PaymentSummaryCards } from "@/components/payment/payment-summary-cards"
import { PaymentFilterTabs } from "./_components/payment-filter-tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ColumnDef } from "@tanstack/react-table"

export default function PaymentPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [totalRecords, setTotalRecords] = React.useState(0)
  const [currentFilter, setCurrentFilter] = React.useState("ALL")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list")

  const { refreshPayments, fetchPaymentSummary } = usePayment()

  const paymentsQuery = useQuery<{ data: Payment[]; total: number }, Error>({
    queryKey: ["payments", currentPage, pageSize, currentFilter, searchTerm],
    queryFn: () => refreshPayments(currentPage, pageSize, currentFilter),
    placeholderData: (previousData) => previousData,
  })

  const paymentSummaryQuery = useQuery({
    queryKey: ["paymentSummary"],
    queryFn: fetchPaymentSummary,
  })

  React.useEffect(() => {
    if (paymentsQuery.data) {
      setTotalRecords(paymentsQuery.data.total)
    }
  }, [paymentsQuery.data])

  const createPaymentFn = async (data: PaymentFormData) => {
    const response = await api.post("/payment", data)
    return response.data
  }

  const updatePaymentFn = async ({ id, data }: { id: number; data: PaymentFormData }) => {
    const response = await api.patch(`/payment/${id}`, data)
    return response.data
  }

  const deletePaymentFn = async (id: number) => {
    const response = await api.delete(`/payment/${id}`)
    return response.data
  }

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", currentPage, pageSize, currentFilter] })
      queryClient.invalidateQueries({ queryKey: ["paymentSummary"] })
      setIsModalOpen(false)
      setSelectedPayment(null)
      toast({
        title: `Pago ${selectedPayment ? "actualizado" : "creado"} correctamente`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: `Error al ${selectedPayment ? "actualizar" : "crear"} pago`,
        description: error.message,
        variant: "destructive",
      })
    },
  }

  const createMutation = useMutation<unknown, Error, PaymentFormData>({
    mutationFn: createPaymentFn,
    ...mutationOptions,
  })

  const updateMutation = useMutation<unknown, Error, { id: number; data: PaymentFormData }>({
    mutationFn: updatePaymentFn,
    ...mutationOptions,
  })

  const deleteMutation = useMutation<unknown, Error, number>({
    mutationFn: deletePaymentFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", currentPage, pageSize, currentFilter] })
      queryClient.invalidateQueries({ queryKey: ["paymentSummary"] })
      toast({
        title: "Pago eliminado correctamente",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar pago",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleAdd = () => {
    setSelectedPayment(null)
    setIsModalOpen(true)
  }

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsModalOpen(true)
  }

  const handleDelete = (paymentId: string) => {
    const idAsNumber = Number.parseInt(paymentId, 10)
    if (isNaN(idAsNumber)) {
      console.error("Invalid payment ID for deletion")
      toast({ title: "ID de pago inválido", variant: "destructive" })
      return
    }
    deleteMutation.mutate(idAsNumber)
  }

  const handleSave = (values: PaymentFormData) => {
    if (selectedPayment) {
      updateMutation.mutate({ id: selectedPayment.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handlePaginationChange = (page: number, newPageSize: number) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const handleReload = () => {
    paymentsQuery.refetch()
    paymentSummaryQuery.refetch()
  }

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    // This would typically update a state variable that's used in the query
  }

  const paymentColumns = React.useMemo((): ColumnDef<Payment>[] => {
    const columnsBase = baseColumns

    return [
      ...columnsBase,
      {
        id: "actions",
        header: "Opciones",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <PaymentActionsDropdown payment={row.original} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        ),
      },
    ]
  }, [handleDelete, handleEdit])

  const isLoadingMutation = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  const isFetchingOrMutating = paymentsQuery.isFetching || paymentSummaryQuery.isFetching || isLoadingMutation

  return (
    <MainContainer>
      <HeaderActions title="Registro de Pagos">
        <ReloadButton onClick={handleReload} isLoading={isFetchingOrMutating} />
        <AddButton onClick={handleAdd} text="Nuevo Pago" />
      </HeaderActions>

      {/* Summary Cards */}
      <PaymentSummaryCards
        summary={paymentSummaryQuery.data || { totalCollected: 0, paidCount: 0, pendingCount: 0, lateCount: 0 }}
        isLoading={paymentSummaryQuery.isLoading}
      />

      {/* Filter Tabs */}
      <PaymentFilterTabs
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        isLoading={isFetchingOrMutating}
      />

      {/* Search and View Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <form onSubmit={handleSearch} className="w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full md:w-[300px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <Select defaultValue="recent">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más Reciente</SelectItem>
              <SelectItem value="oldest">Más Antiguo</SelectItem>
              <SelectItem value="amount-high">Mayor Monto</SelectItem>
              <SelectItem value="amount-low">Menor Monto</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ResponsiveTable<Payment>
        data={paymentsQuery.data?.data ?? []}
        columns={paymentColumns}
        headers={headers}
        renderCard={(payment) => <PaymentCard payment={payment} onEdit={handleEdit} onDelete={handleDelete} />}
        isLoading={isFetchingOrMutating}
        onPaginationChange={handlePaginationChange}
        totalRecords={totalRecords}
        pageSize={pageSize}
        currentPage={currentPage}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} modal={false}>
        <DialogContent
          className="sm:max-w-2xl"
          onInteractOutside={(e) => {
            // Previene que el diálogo se cierre al hacer clic dentro de un Select o Popover
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>{selectedPayment ? "Editar Pago" : "Nuevo Pago"}</DialogTitle>
          </DialogHeader>
          <PaymentForm
            payment={selectedPayment}
            onSubmit={handleSave}
            isLoading={isLoadingMutation}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </MainContainer>
  )
}
