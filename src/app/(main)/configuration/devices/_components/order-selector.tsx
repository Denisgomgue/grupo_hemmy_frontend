"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar, ArrowUpDown } from "lucide-react"

interface OrderSelectorProps {
    orderBy: 'created' | 'updated'
    orderDirection: 'ASC' | 'DESC'
    onOrderChange: (orderBy: 'created' | 'updated', orderDirection: 'ASC' | 'DESC') => void
}

export function OrderSelector({ orderBy, orderDirection, onOrderChange }: OrderSelectorProps) {
    const handleOrderByChange = (value: string) => {
        onOrderChange(value as 'created' | 'updated', orderDirection)
    }

    const handleDirectionChange = (value: string) => {
        onOrderChange(orderBy, value as 'ASC' | 'DESC')
    }

    const toggleDirection = () => {
        const newDirection = orderDirection === 'ASC' ? 'DESC' : 'ASC'
        onOrderChange(orderBy, newDirection)
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Orden:</span>
                <Select value={orderBy} onValueChange={handleOrderByChange}>
                    <SelectTrigger className="w-34">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Creación
                            </div>
                        </SelectItem>
                        <SelectItem value="updated">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Modificación
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={toggleDirection}
                className="px-2"
                title={orderDirection === 'DESC' ? 'Más recientes primero' : 'Más antiguos primero'}
            >
                <ArrowUpDown className={`h-4 w-4 transition-transform ${orderDirection === 'ASC' ? 'rotate-180' : ''}`} />
            </Button>
        </div>
    )
}
