import { Card, CardContent } from "@/components/ui/card"
import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeviceType } from "@/hooks/use-mobile"

export interface InfoCardConfig {
    title: string
    value: React.ReactNode
    description?: string
    icon: React.ReactNode
    borderColor?: string
    bgColor?: string
    textColor?: string
    extra?: React.ReactNode // Para botones, acciones, etc.
    isLoading?: boolean
}

export function InfoSummaryCards({ cards, isLoading = false }: { cards: InfoCardConfig[], isLoading?: boolean }) {
    const deviceType = useDeviceType();

    // Determinar el número de columnas basado en el dispositivo
    const getGridCols = () => {
        switch (deviceType) {
            case 'mobile':
                return 'grid-cols-1'; // 1 columna en móvil
            case 'tablet':
                return 'grid-cols-2'; // 2 columnas en tablet
            case 'laptop':
                return 'grid-cols-2'; // 2 columnas en laptop
            case 'desktop':
                return 'grid-cols-4'; // 4 columnas en desktop
            default:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'; // Fallback
        }
    };

    const gridCols = getGridCols();

    if (isLoading) {
        return (
            <div className={`grid ${gridCols} gap-4 mb-6`}>
                {Array.from({ length: 4 }).map((_, idx) => (
                    <Card key={idx} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className={`grid ${gridCols} gap-3 sm:gap-4 mb-6`}>
            {cards.map((card, idx) => (
                <Card
                    key={idx}
                    className={`border-l-4 ${card.borderColor || "border-l-blue-500"} ${card.bgColor || ""} hover:shadow-md transition-shadow duration-200`}
                >
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium mb-1 ${card.textColor || "text-muted-foreground"}`}>
                                    {card.title}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {card.isLoading ? (
                                        <Skeleton className="h-8 w-16" />
                                    ) : (
                                        <h3 className={`text-xl sm:text-2xl font-bold ${card.textColor || ""} break-words`}>
                                            {card.value}
                                        </h3>
                                    )}
                                    {card.extra}
                                </div>
                                {card.description && (
                                    <p className={`text-xs sm:text-sm mt-1 ${card.textColor || "text-muted-foreground"} break-words`}>
                                        {card.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex-shrink-0 ml-2">
                                {React.cloneElement(card.icon as React.ReactElement, {
                                    className: `h-6 w-6 sm:h-8 sm:w-8 ${deviceType === 'mobile' ? 'h-5 w-5' : ''}`
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
} 