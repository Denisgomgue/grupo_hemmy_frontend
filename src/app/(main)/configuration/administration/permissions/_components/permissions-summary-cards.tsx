"use client";

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, CheckCircle, XCircle } from "lucide-react"

export interface PermissionsSummary {
    totalRoles: number;
    totalResources: number;
    activeRoles: number;
    inactiveRoles: number;
}

interface PermissionsSummaryCardsProps {
    summary: PermissionsSummary
    isLoading?: boolean
}

export function PermissionsSummaryCards({ summary, isLoading = false }: PermissionsSummaryCardsProps) {
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
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total de Roles</p>
                            <h3 className="text-2xl font-bold">{summary.totalRoles}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Roles en el sistema</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total de Recursos</p>
                            <h3 className="text-2xl font-bold">{summary.totalResources}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Recursos disponibles</p>
                        </div>
                        <Shield className="h-8 w-8 text-purple-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Roles Activos</p>
                            <h3 className="text-2xl font-bold">{summary.activeRoles}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Roles habilitados</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Roles Inactivos</p>
                            <h3 className="text-2xl font-bold">{summary.inactiveRoles}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Roles deshabilitados</p>
                        </div>
                        <XCircle className="h-8 w-8 text-orange-500" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 