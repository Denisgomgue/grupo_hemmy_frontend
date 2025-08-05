"use client";

import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeviceType } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface ClientSummaryCard {
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    borderColor: string;
    bgColor?: string;
    textColor?: string;
    isLoading?: boolean;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

interface ClientSummaryCardsProps {
    cards: ClientSummaryCard[];
    isLoading?: boolean;
    className?: string;
}

export function ClientSummaryCards({ cards, isLoading = false, className }: ClientSummaryCardsProps) {
    const deviceType = useDeviceType();

    // Configuración responsiva específica para clientes
    const getResponsiveConfig = () => {
        switch (deviceType) {
            case 'mobile':
                return {
                    gridCols: 'grid-cols-1',
                    gap: 'gap-3',
                    padding: 'p-3',
                    iconSize: 'h-5 w-5',
                    textSize: 'text-lg',
                    descriptionSize: 'text-xs'
                };
            case 'tablet':
                return {
                    gridCols: 'grid-cols-2',
                    gap: 'gap-4',
                    padding: 'p-4',
                    iconSize: 'h-6 w-6',
                    textSize: 'text-xl',
                    descriptionSize: 'text-sm'
                };
            case 'laptop':
                return {
                    gridCols: 'grid-cols-2',
                    gap: 'gap-4',
                    padding: 'p-5',
                    iconSize: 'h-7 w-7',
                    textSize: 'text-2xl',
                    descriptionSize: 'text-sm'
                };
            case 'desktop':
                return {
                    gridCols: 'grid-cols-4',
                    gap: 'gap-6',
                    padding: 'p-6',
                    iconSize: 'h-8 w-8',
                    textSize: 'text-2xl',
                    descriptionSize: 'text-sm'
                };
            default:
                return {
                    gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
                    gap: 'gap-4',
                    padding: 'p-4 sm:p-6',
                    iconSize: 'h-6 w-6 sm:h-8 sm:w-8',
                    textSize: 'text-xl sm:text-2xl',
                    descriptionSize: 'text-xs sm:text-sm'
                };
        }
    };

    const config = getResponsiveConfig();

    if (isLoading) {
        return (
            <div className={cn(`grid ${config.gridCols} ${config.gap} mb-6`, className)}>
                {Array.from({ length: 4 }).map((_, idx) => (
                    <Card key={idx} className="border-l-4 border-l-purple-500 animate-pulse">
                        <CardContent className={config.padding}>
                            <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className={`h-8 w-16`} />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className={`${config.iconSize} rounded`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className={cn(`grid ${config.gridCols} ${config.gap} mb-6`, className)}>
            {cards.map((card, idx) => (
                <Card
                    key={idx}
                    className={cn(
                        "border-l-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1",
                        card.borderColor,
                        card.bgColor
                    )}
                >
                    <CardContent className={config.padding}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "font-medium mb-2 text-muted-foreground",
                                    config.descriptionSize
                                )}>
                                    {card.title}
                                </p>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {card.isLoading ? (
                                        <Skeleton className={`h-8 w-16`} />
                                    ) : (
                                        <h3 className={cn(
                                            "font-bold text-foreground",
                                            config.textSize
                                        )}>
                                            {card.value.toLocaleString()}
                                        </h3>
                                    )}

                                    {card.trend && (
                                        <span className={cn(
                                            "text-xs px-2 py-1 rounded-full",
                                            card.trend.isPositive
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                        )}>
                                            {card.trend.isPositive ? '+' : ''}{card.trend.value}%
                                        </span>
                                    )}
                                </div>

                                <p className={cn(
                                    "mt-1 text-muted-foreground",
                                    config.descriptionSize
                                )}>
                                    {card.description}
                                </p>
                            </div>

                            <div className="flex-shrink-0 ml-3">
                                {React.cloneElement(card.icon as React.ReactElement, {
                                    className: cn(
                                        config.iconSize,
                                        "text-muted-foreground"
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
} 