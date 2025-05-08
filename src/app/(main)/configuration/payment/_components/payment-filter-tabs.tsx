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
        <TabsTrigger value="ALL" disabled={isLoading}>
          Todos
        </TabsTrigger>
        <TabsTrigger value="PAYMENT_DAILY" disabled={isLoading}>
          Pagados
        </TabsTrigger>
        <TabsTrigger value="PENDING" disabled={isLoading}>
          Pendientes
        </TabsTrigger>
        <TabsTrigger value="LATE_PAYMENT" disabled={isLoading}>
          Atrasados
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
