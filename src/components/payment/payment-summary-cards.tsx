import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import type { PaymentSummary } from "@/types/payments/payment"

interface PaymentSummaryCardsProps {
  summary: PaymentSummary
  isLoading?: boolean
}

export function PaymentSummaryCards({ summary, isLoading = false }: PaymentSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-32"></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Recaudado</p>
              <h3 className="text-2xl font-bold">S/. {summary.totalCollected.toFixed(2)}</h3>
              <p className="text-sm text-muted-foreground mt-1">Pagos completados</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pagos Pagados</p>
              <h3 className="text-2xl font-bold">{summary.paidCount}</h3>
              <p className="text-sm text-muted-foreground mt-1">Este periodo</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pagos Pendientes</p>
              <h3 className="text-2xl font-bold">{summary.pendingCount}</h3>
              <p className="text-sm text-muted-foreground mt-1">Esperando confirmación</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pagos Atrasados</p>
              <h3 className="text-2xl font-bold">{summary.lateCount}</h3>
              <p className="text-sm text-muted-foreground mt-1">Requieren seguimiento</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
