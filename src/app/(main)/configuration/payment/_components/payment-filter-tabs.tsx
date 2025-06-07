"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PaymentFilterTabsProps {
  currentFilter: string
  onFilterChange: (filter: string) => void
  isLoading?: boolean
}

export function PaymentFilterTabs({ currentFilter, onFilterChange, isLoading = false }: PaymentFilterTabsProps) {
  return (
    <Tabs value={currentFilter} onValueChange={onFilterChange} className="mb-6">
      <TabsList className="grid w-full max-w-md grid-cols-4">
        <TabsTrigger value="ALL" data-state={isLoading ? "disabled" : undefined}>
          Todos
        </TabsTrigger>
        <TabsTrigger value="PAYMENT_DAILY" data-state={isLoading ? "disabled" : undefined}>
          Pagados
        </TabsTrigger>
        <TabsTrigger value="PENDING" data-state={isLoading ? "disabled" : undefined}>
          Pendientes
        </TabsTrigger>
        <TabsTrigger value="LATE_PAYMENT" data-state={isLoading ? "disabled" : undefined}>
          Atrasados
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
