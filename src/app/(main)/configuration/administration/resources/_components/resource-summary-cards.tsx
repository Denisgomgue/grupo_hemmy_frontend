import { Card, CardContent } from "@/components/ui/card"
import { Resource } from "@/hooks/use-resources-api"
import {
    FolderOpen,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react"

export interface ResourceSummary {
    totalResources: number;
    activeResources: number;
    inactiveResources: number;
    recentResources: number;
}

interface ResourceSummaryCardsProps {
    summary: ResourceSummary
    isLoading?: boolean
}

export function ResourceSummaryCards({ summary, isLoading = false }: ResourceSummaryCardsProps) {
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
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total de Módulos</p>
                            <h3 className="text-2xl font-bold">{summary.totalResources}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Módulos en el sistema</p>
                        </div>
                        <FolderOpen className="h-8 w-8 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Módulos Activos</p>
                            <h3 className="text-2xl font-bold">{summary.activeResources}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Disponibles en navegación</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Módulos Inactivos</p>
                            <h3 className="text-2xl font-bold">{summary.inactiveResources}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Ocultos de la navegación</p>
                        </div>
                        <XCircle className="h-8 w-8 text-orange-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Recientes</p>
                            <h3 className="text-2xl font-bold">{summary.recentResources}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Creados en la última semana</p>
                        </div>
                        <Clock className="h-8 w-8 text-purple-500" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 