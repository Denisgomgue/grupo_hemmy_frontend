import { Card, CardContent } from "@/components/ui/card"
import { Cpu, Wifi, Settings, WifiOff, AlertTriangle, PauseCircle } from "lucide-react"

export interface DeviceSummary {
    total: number;
    active: number;
    offline: number;
    maintenance: number;
    error: number;
    inactive: number;
}

interface DeviceSummaryCardsProps {
    summary: DeviceSummary
    isLoading?: boolean
}

export function DeviceSummaryCards({ summary, isLoading = false }: DeviceSummaryCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[ ...Array(4) ].map((_, i) => (
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
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total Dispositivos</p>
                            <h3 className="text-2xl font-bold">{summary.total}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Registrados en el sistema</p>
                        </div>
                        <Cpu className="h-8 w-8 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Activos</p>
                            <h3 className="text-2xl font-bold">{summary.active}</h3>
                            <p className="text-sm text-muted-foreground mt-1">En funcionamiento</p>
                        </div>
                        <Wifi className="h-8 w-8 text-green-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">En Mantenimiento</p>
                            <h3 className="text-2xl font-bold">{summary.maintenance}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Revisión o reparación</p>
                        </div>
                        <Settings className="h-8 w-8 text-yellow-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Desconectados</p>
                            <h3 className="text-2xl font-bold">{summary.offline}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Sin conexión</p>
                        </div>
                        <WifiOff className="h-8 w-8 text-red-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Puedes agregar más cards para error e inactivos si lo deseas */}
        </div>
    )
} 