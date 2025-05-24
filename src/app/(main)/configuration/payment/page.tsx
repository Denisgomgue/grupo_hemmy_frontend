"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import type { Payment } from "@/types/payments/payment"
import { usePayments } from "@/hooks/use-payment"
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
import { useState, useEffect, useMemo } from "react"
import { PaginatedCards } from "@/components/dataTable/paginated-cards"
import { ViewModeSwitcher } from "@/components/dataTable/view-mode-switcher"
import { TableToolbar } from "@/components/dataTable/table-toolbar"
import { useDebounce } from "@/hooks/use-debounce"

export default function PaymentPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [ isModalOpen, setIsModalOpen ] = useState(false)
  const [ selectedPayment, setSelectedPayment ] = useState<Payment | null>(null)
  const [ currentPage, setCurrentPage ] = useState(1)
  const [ pageSize, setPageSize ] = useState(10)
  const [ totalRecords, setTotalRecords ] = useState(0)
  const [ currentFilter, setCurrentFilter ] = useState("ALL")
  const [ searchTerm, setSearchTerm ] = useState("")
  const [ localSearchTerm, setLocalSearchTerm ] = useState("")
  const [ viewMode, setViewMode ] = useState<"list" | "grid">("list")
  const [ paymentSummary, setPaymentSummary ] = useState({
    totalRecaudado: 0,
    pagosPagados: 0,
    pagosPendientes: 0,
    pagosAtrasados: 0,
    periodoUtilizado: 'thisMonth'
  })
  const [ isLoading, setIsLoading ] = useState(false)
  const [ isSubmitting, setIsSubmitting ] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 700)

  const {
    refreshPayments,
    payments,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentSummary
  } = usePayments()

  // Filtrado local de pagos
  const filteredPayments = useMemo(() => {
    if (!localSearchTerm) return payments;

    return payments.filter(payment => {
      const searchTermLower = localSearchTerm.toLowerCase();
      return (
        payment.client.name.toLowerCase().includes(searchTermLower) ||
        payment.client.lastName.toLowerCase().includes(searchTermLower) ||
        payment.client.dni.toLowerCase().includes(searchTermLower) ||
        payment.reference?.toLowerCase().includes(searchTermLower) ||
        payment.amount.toString().includes(searchTermLower) ||
        payment.paymentType.toLowerCase().includes(searchTermLower)
      );
    });
  }, [ payments, localSearchTerm ]);

  // Efecto para búsqueda en backend cuando sea necesario
  useEffect(() => {
    if (debouncedSearchTerm !== localSearchTerm) {
      loadPayments();
    }
  }, [ debouncedSearchTerm ]);

  // Cargar pagos
  const loadPayments = async () => {
    setIsLoading(true)
    try {
      const result = await refreshPayments(currentPage, pageSize, currentFilter, searchTerm)
      setTotalRecords(result.total)
    } catch (error) {
      console.error('Error al cargar pagos:', error)
      toast({
        title: "Error al cargar pagos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar resumen de pagos
  const loadPaymentSummary = async () => {
    try {
      const summary = await getPaymentSummary()
      setPaymentSummary(summary)
    } catch (error) {
      console.error('Error al cargar resumen:', error)
    }
  }

  // Cargar datos al cambiar los filtros
  useEffect(() => {
    loadPayments()
  }, [ currentPage, pageSize, currentFilter, searchTerm ])

  // Cargar resumen al inicio
  useEffect(() => {
    loadPaymentSummary()
  }, [])

  const handleAdd = () => {
    setSelectedPayment(null)
    setIsModalOpen(true)
  }

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsModalOpen(true)
  }

  const handleDelete = async (paymentId: string) => {
    const idAsNumber = Number.parseInt(paymentId, 10)
    if (isNaN(idAsNumber)) {
      toast({ title: "ID de pago inválido", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      await deletePayment(idAsNumber)
      toast({ title: "Pago eliminado correctamente" })
      loadPayments()
      loadPaymentSummary()
    } catch (error) {
      console.error('Error al eliminar pago:', error)
      toast({
        title: "Error al eliminar pago",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (values: PaymentFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedPayment) {
        await updatePayment(selectedPayment.id, values)
        toast({ title: "Pago actualizado correctamente" })
      } else {
        await createPayment(values)
        toast({ title: "Pago creado correctamente" })
      }
      setIsModalOpen(false)
      setSelectedPayment(null)
      loadPayments()
      loadPaymentSummary()
    } catch (error) {
      console.error('Error al guardar pago:', error)
      toast({
        title: `Error al ${selectedPayment ? "actualizar" : "crear"} pago`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaginationChange = (page: number, newPageSize: number) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const handleReload = () => {
    loadPayments()
    loadPaymentSummary()
  }

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter)
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setLocalSearchTerm(value);
    // Si hay más de 5 caracteres, activamos la búsqueda en backend
    if (value.length > 8) {
      setSearchTerm(value);
    } else {
      setSearchTerm("");
    }
  };

  const handleSetViewMode = (mode: string) => {
    if (mode === "list" || mode === "grid") setViewMode(mode)
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
  }, [ handleDelete, handleEdit ])

  return (
    <MainContainer>
      <HeaderActions title="Registro de Pagos">
        <ReloadButton onClick={handleReload} isLoading={isLoading} />
        <AddButton onClick={handleAdd} text="Nuevo Pago" />
      </HeaderActions>

      {/* Summary Cards */}
      <PaymentSummaryCards
        summary={{
          totalCollected: paymentSummary.totalRecaudado,
          paidCount: paymentSummary.pagosPagados,
          pendingCount: paymentSummary.pagosPendientes,
          lateCount: paymentSummary.pagosAtrasados
        }}
        isLoading={isLoading}
      />

      {/* Filter Tabs */}
      <PaymentFilterTabs
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
      />

      {/* Search and View Controls */}
      <div className="flex items-center justify-between mb-6">
        <TableToolbar
          value={localSearchTerm}
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
          data={filteredPayments}
          isLoading={isLoading}
          pagination={{
            currentPage,
            pageSize,
            totalRecords,
            onPaginationChange: handlePaginationChange,
          }}
        />
      ) : (
        <PaginatedCards
          data={filteredPayments}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPaginationChange={handlePaginationChange}
          renderCard={(payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onEdit={() => handleEdit(payment)}
              onDelete={() => handleDelete(payment.id.toString())}
            />
          )}
          isLoading={isLoading}
        />
      )}

      {/* Payment Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPayment ? "Editar" : "Crear"} Pago</DialogTitle>
          </DialogHeader>
          <PaymentForm
            payment={selectedPayment}
            onSubmit={handleSave}
            isLoading={isSubmitting}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </MainContainer>
  )
}
