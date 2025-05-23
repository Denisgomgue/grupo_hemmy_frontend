import { Card, CardContent } from "@/components/ui/card"
import React from "react"

export interface InfoCardConfig {
    title: string
    value: React.ReactNode
    description?: string
    icon: React.ReactNode
    borderColor?: string
    bgColor?: string
    textColor?: string
    extra?: React.ReactNode // Para botones, acciones, etc.
}

export function InfoSummaryCards({ cards }: { cards: InfoCardConfig[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, idx) => (
                <Card
                    key={idx}
                    className={`border-l-4 ${card.borderColor || "border-l-blue-500"} ${card.bgColor || ""}`}
                >
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`text-sm font-medium mb-1 ${card.textColor || "text-muted-foreground"}`}>{card.title}</p>
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-2xl font-bold ${card.textColor || ""}`}>{card.value}</h3>
                                    {card.extra}
                                </div>
                                {card.description && (
                                    <p className={`text-sm mt-1 ${card.textColor || "text-muted-foreground"}`}>{card.description}</p>
                                )}
                            </div>
                            {card.icon}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
} 