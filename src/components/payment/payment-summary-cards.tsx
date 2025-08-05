import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, DollarSign, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react"

export interface PaymentSummary {
  totalCollected: number;
  paidCount: number;
  pendingCount: number;
  lateCount: number;
  voidedCount: number;
  period?: string;
}

interface PaymentSummaryCardsProps {
  summary: PaymentSummary
  isLoading?: boolean
}

export function PaymentSummaryCards({ summary, isLoading = false }: PaymentSummaryCardsProps) {
  const [ showAmount, setShowAmount ] = useState(false)
  const [ displayedAmount, setDisplayedAmount ] = useState(0)

  // Animación de conteo
  const handleToggleAmount = () => {
    if (!showAmount) {
      let start = 0
      const end = summary.totalCollected || 0
      const duration = 600 // ms
      const steps = 30
      const increment = end / steps
      let current = 0
      setDisplayedAmount(0)
      setShowAmount(true)
      const interval = setInterval(() => {
        current += increment
        if (current >= end) {
          setDisplayedAmount(end)
          clearInterval(interval)
        } else {
          setDisplayedAmount(Math.round(current))
        }
      }, duration / steps)
    } else {
      setShowAmount(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[ ...Array(5) ].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-32"></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Recaudado</p>
              <div className="flex items-center justify-between gap-6">
                <h3 className="text-2xl font-bold select-none">
                  S/. {showAmount
                    ? displayedAmount.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : "------"}
                </h3>
                <button
                  type="button"
                  aria-label={showAmount ? "Ocultar monto" : "Mostrar monto"}
                  onClick={handleToggleAmount}
                  className="focus:outline-none bg-transparent flex items-center justify-center"
                >
                  {showAmount ? <EyeOff className="h-6 w-6 text-blue-100 hover:text-blue-500" /> : <Eye className="h-6 w-6 text-blue-100 hover:text-blue-500" />}
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Pagos válidos (al día + atrasados)</p>
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

      <Card className="border-l-4 border-l-gray-500 bg-gray-50 dark:bg-gray-950/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pagos Anulados</p>
              <h3 className="text-2xl font-bold">{summary.voidedCount}</h3>
              <p className="text-sm text-muted-foreground mt-1">Cancelados</p>
            </div>
            <XCircle className="h-8 w-8 text-gray-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
