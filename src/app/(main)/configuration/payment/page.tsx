"use client"

import * as React from "react"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import type { Payment } from "@/types/payments/payment"
import { usePaymentQuery } from "@/hooks/use-payment-query"
import { PaymentForm } from "./_components/payment-form"
import { ResponsiveTable } from "@/components/responsive-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MainContainer } from "@/components/layout/main-container"
import { HeaderActions } from "@/components/layout/header-actions"
import { AddButton } from "@/components/layout/add-button"
import { ReloadButton } from "@/components/layout/reload-button"
import type { PaymentFormData } from "@/schemas/payment-schema"
import { createBaseColumns } from "./_components/columns"
import { headers } from "./_components/headers"
import { PaymentActionsDropdown } from "./_components/payment-actions-dropdown"
import { PaymentCard } from "./_components/payment-card"
import { PaymentSummaryCards } from "@/components/payment/payment-summary-cards"
import { PaymentFilterTabs } from "./_components/payment-filter-tabs"
import { PaymentDetailModal } from "@/components/payment/payment-detail-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ColumnDef } from "@tanstack/react-table"
import { useState, useEffect, useMemo } from "react"
import { PaginatedCards } from "@/components/dataTable/paginated-cards"
import { ViewModeSwitcher } from "@/components/dataTable/view-mode-switcher"
import { TableToolbar } from "@/components/dataTable/table-toolbar"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "sonner"
import api from "@/lib/axios"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Settings2 } from "lucide-react"
import { usePaymentFilters } from '@/hooks/use-payment-filters'

export default function PaymentPage() {
  const queryClient = useQueryClient()
  const { toast: useToastToast } = useToast()

  // Usar el nuevo hook con React Query
  const {
    refreshPayments,
    getPaymentSummary,
    createPayment,
    updatePayment,
    deletePayment,
    regeneratePaymentCodes
  } = usePaymentQuery()

  // Estados para filtros y paginación
  const [ searchTerm, setSearchTerm ] = useState("")
  const [ filters, setFilters ] = useState({ status: 'all' })
  const [ currentPage, setCurrentPage ] = useState(1)
  const [ pageSize, setPageSize ] = useState(10)
  const [ viewMode, setViewMode ] = useState<"list" | "grid">("list")



  // Query para obtener pagos
  const {
    data: paymentsQuery,
    isFetching: isFetchingPayments,
    refetch: refetchPayments
  } = useQuery({
    queryKey: [ "payments", currentPage, pageSize, filters.status, searchTerm ],
    queryFn: () => refreshPayments(currentPage, pageSize, filters.status as any, searchTerm || ""),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Query para obtener resumen de pagos
  const {
    data: summaryQuery,
    isFetching: isFetchingSummary
  } = useQuery({
    queryKey: [ "paymentSummary" ],
    queryFn: () => getPaymentSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success("✅ Pago creado correctamente")
      queryClient.invalidateQueries({ queryKey: [ "payments" ] })
      queryClient.invalidateQueries({ queryKey: [ "paymentSummary" ] })
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Error al crear pago"
      toast.error(`❌ ${errorMessage}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updatePayment(id, data),
    onSuccess: () => {
      toast.success("✅ Pago actualizado correctamente")
      queryClient.invalidateQueries({ queryKey: [ "payments" ] })
      queryClient.invalidateQueries({ queryKey: [ "paymentSummary" ] })
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Error al actualizar pago"
      toast.error(`❌ ${errorMessage}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      toast.success("✅ Pago eliminado correctamente")
      queryClient.invalidateQueries({ queryKey: [ "payments" ] })
      queryClient.invalidateQueries({ queryKey: [ "paymentSummary" ] })
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Error al eliminar pago"
      toast.error(`❌ ${errorMessage}`)
    },
  })

  const regenerateCodesMutation = useMutation({
    mutationFn: regeneratePaymentCodes,
    onSuccess: (result) => {
      toast.success(`🔄 Se procesaron ${result.total} pagos. ${result.updated} actualizados.`)
      queryClient.invalidateQueries({ queryKey: [ "payments" ] })
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Error al regenerar códigos"
      toast.error(`❌ ${errorMessage}`)
    },
  })

  // Estados del modal
  const [ isModalOpen, setIsModalOpen ] = useState(false)
  const [ selectedPayment, setSelectedPayment ] = useState<Payment | null>(null)
  const [ isPaymentDetailModalOpen, setIsPaymentDetailModalOpen ] = useState(false)
  const [ isSelectionModalOpen, setIsSelectionModalOpen ] = useState(false)
  const [ selectedPaymentType, setSelectedPaymentType ] = useState<"payment" | "postponement" | null>(null)

  // Estados de carga
  const isLoadingMutation = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  const isFetchingOrMutating = isFetchingPayments || isFetchingSummary || isLoadingMutation

  // Datos procesados
  const payments = paymentsQuery?.data || []
  const totalRecords = paymentsQuery?.total || 0
  const paymentSummary = summaryQuery || {
    totalRecaudado: 0,
    pagosPagados: 0,
    pagosPendientes: 0,
    pagosAtrasados: 0,
    pagosAnulados: 0,
    periodoUtilizado: 'thisMonth'
  }

  // Paginación de pagos
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return payments.slice(startIndex, endIndex)
  }, [ payments, currentPage, pageSize ])

  const handleAdd = () => {
    setIsSelectionModalOpen(true)
  }

  const handlePaymentTypeSelection = (type: "payment" | "postponement") => {
    setSelectedPaymentType(type)
    setIsSelectionModalOpen(false)
    setSelectedPayment(null)
    setIsModalOpen(true)
  }

  const handleCloseSelectionModal = () => {
    setIsSelectionModalOpen(false)
    setSelectedPaymentType(null)
  }

  const handleEdit = (payment: Payment) => {
    // Determinar el tipo de edición basado en el status del pago
    const isPostponement = payment.status === 'PENDING' && payment.engagementDate;

    if (isPostponement) {
      // Si es un aplazamiento, abrir modal de edición de aplazamiento
      setSelectedPayment(payment)
      setSelectedPaymentType("postponement")
      setIsModalOpen(true)
    } else {
      // Si es un pago normal, abrir modal de edición de pago
      setSelectedPayment(payment)
      setSelectedPaymentType("payment")
      setIsModalOpen(true)
    }
  }

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsPaymentDetailModalOpen(true)
  }

  const handleClosePaymentDetailModal = () => {
    setIsPaymentDetailModalOpen(false)
    setSelectedPayment(null)
  }

  const handleEditFromDetail = (payment: Payment) => {
    // Determinar el tipo de edición basado en el status del pago
    const isPostponement = payment.status === 'PENDING' && payment.engagementDate;

    if (isPostponement) {
      // Si es un aplazamiento, abrir modal de edición de aplazamiento
      setSelectedPayment(payment)
      setSelectedPaymentType("postponement")
      setIsPaymentDetailModalOpen(false)
      setIsModalOpen(true)
    } else {
      // Si es un pago normal, abrir modal de edición de pago
      setSelectedPayment(payment)
      setSelectedPaymentType("payment")
      setIsPaymentDetailModalOpen(false)
      setIsModalOpen(true)
    }
  }

  const handleDelete = async (paymentId: string) => {
    const idAsNumber = Number.parseInt(paymentId, 10)
    if (isNaN(idAsNumber)) {
      toast.error("❌ ID de pago inválido")
      return
    }

    try {
      await deleteMutation.mutateAsync(idAsNumber)
    } catch (error) {
      console.error('Error al eliminar pago:', error)
      toast.error("❌ Error al eliminar el pago")
    }
  }

  const handleSave = async (values: PaymentFormData) => {
    try {
      if (selectedPayment) {
        await updateMutation.mutateAsync({ id: selectedPayment.id, data: values })
      } else {
        await createMutation.mutateAsync(values)
      }
      setIsModalOpen(false)
      setSelectedPayment(null)
    } catch (error) {
      console.error('Error al guardar pago:', error)
      toast.error("❌ Error al guardar el pago")
    }
  }

  const handlePaginationChange = (page: number, newPageSize: number) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const handleReload = () => {
    try {
      refetchPayments()
      queryClient.invalidateQueries({ queryKey: [ "paymentSummary" ] })
      toast.success("🔄 Datos recargados correctamente")
    } catch (error) {
      console.error('Error al recargar datos:', error)
      toast.error("❌ Error al recargar los datos")
    }
  }

  const handleFilterChange = (filter: string) => {
    setFilters({ status: filter as any })
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleSetViewMode = (mode: string) => {
    if (mode === "list" || mode === "grid") setViewMode(mode)
  }

  const paymentColumns = React.useMemo((): ColumnDef<Payment>[] => {
    const columnsBase = createBaseColumns(handlePaymentClick)

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
  }, [ handleDelete, handleEdit, handlePaymentClick ])

  const recalculatePaymentStates = async () => {
    try {
      const response = await api.post('/payments/recalculate-states');
      toast.success(`✅ Estados actualizados: ${response.data.message}`);
      // Recargar la lista de pagos
      queryClient.invalidateQueries({ queryKey: [ "payments" ] })
    } catch (error) {
      console.error('Error al recalcular estados:', error)
      toast.error("❌ Error al recalcular los estados de pago");
    }
  };

  const handleRegenerateCodes = async () => {
    if (regenerateCodesMutation.isPending) return;

    try {
      await regenerateCodesMutation.mutateAsync();
    } catch (error) {
      console.error('Error al regenerar códigos:', error)
      toast.error("❌ Error al regenerar los códigos de pago");
    }
  };

  return (
    <MainContainer>
      <HeaderActions title="Registro de Pagos">
        <div className="flex items-center gap-2">
          <ReloadButton onClick={handleReload} disabled={isFetchingOrMutating} />
          <AddButton onClick={handleAdd} disabled={isFetchingOrMutating} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRegenerateCodes}
                  disabled={regenerateCodesMutation.isPending || isFetchingOrMutating}
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Regenerar códigos de pago</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </HeaderActions>

      {/* Summary Cards */}
      <PaymentSummaryCards
        summary={{
          totalCollected: paymentSummary.totalRecaudado,
          paidCount: paymentSummary.pagosPagados,
          pendingCount: paymentSummary.pagosPendientes,
          lateCount: paymentSummary.pagosAtrasados,
          voidedCount: paymentSummary.pagosAnulados,
          period: String(paymentSummary.periodoUtilizado)
        }}
        isLoading={isFetchingSummary}
      />

      {/* Filter Tabs */}
      <PaymentFilterTabs
        currentFilter={filters.status || 'all'}
        onFilterChange={handleFilterChange}
        isLoading={isFetchingOrMutating}
      />

      {/* Search and View Controls */}
      <div className="flex items-center justify-between mb-6">
        <TableToolbar
          value={searchTerm}
          onValueChange={handleSearch}
          searchPlaceholder="Buscar por cliente, DNI, monto..."
          filters={
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
          }
          actions={
            <>
              <Button variant="outline">Exportar</Button>
              <Button variant="outline">Importar</Button>
            </>
          }
        />
        <ViewModeSwitcher viewMode={viewMode} setViewMode={handleSetViewMode} />
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <ResponsiveTable
          headers={headers}
          columns={paymentColumns}
          data={paginatedPayments}
          isLoading={isFetchingOrMutating}
          pagination={{
            currentPage,
            pageSize,
            totalRecords,
            onPaginationChange: handlePaginationChange,
          }}
        />
      ) : (
        <PaginatedCards
          data={paginatedPayments}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPaginationChange={handlePaginationChange}
          renderCard={(payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onEdit={() => handleEdit(payment)}
              onDelete={() => handleDelete(payment.id.toString())}
              onViewDetails={handlePaymentClick}
            />
          )}
          isLoading={isFetchingOrMutating}
        />
      )}

      {/* Payment Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPayment ? "Editar" : "Crear"} {selectedPaymentType === "postponement" ? "Aplazamiento" : "Pago"}
            </DialogTitle>
          </DialogHeader>
          <PaymentForm
            payment={selectedPayment}
            onSubmit={handleSave}
            isLoading={isLoadingMutation}
            onCancel={() => setIsModalOpen(false)}
            paymentType={selectedPaymentType}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          isOpen={isPaymentDetailModalOpen}
          onClose={handleClosePaymentDetailModal}
          onEdit={handleEditFromDetail}
        />
      )}

      {/* Selection Modal */}
      <Dialog open={isSelectionModalOpen} onOpenChange={setIsSelectionModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#5E3583]">Tipo de Registro</DialogTitle>
            <DialogDescription className="text-gray-600">
              Selecciona el tipo de registro que deseas realizar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Opción: Registro de Pago */}
            <div
              className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#5E3583] hover:bg-[#5E3583]/5 transition-all duration-200"
              onClick={() => handlePaymentTypeSelection("payment")}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Registro de Pago</h3>
                  <p className="text-sm text-gray-600">
                    Registrar un pago real con método de pago, referencia y boleta
                  </p>
                </div>
              </div>
            </div>

            {/* Opción: Aplazamiento */}
            <div
              className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#5E3583] hover:bg-[#5E3583]/5 transition-all duration-200"
              onClick={() => handlePaymentTypeSelection("postponement")}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Aplazamiento de Pago</h3>
                  <p className="text-sm text-gray-600">
                    Registrar un compromiso de pago con fecha alternativa (sin boleta)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={handleCloseSelectionModal}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainContainer>
  )
}
