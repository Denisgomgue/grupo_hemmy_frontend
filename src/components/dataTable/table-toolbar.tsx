import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ReactNode } from "react"
import { useDeviceType } from "@/hooks/use-mobile"

interface TableToolbarProps {
    onSearch?: (value: string) => void
    searchPlaceholder?: string
    filters?: ReactNode
    actions?: ReactNode
    value?: string
    onValueChange?: (value: string) => void
}

export function TableToolbar({
    onSearch,
    searchPlaceholder = "Buscar...",
    filters,
    actions,
    value,
    onValueChange,
}: TableToolbarProps) {
    const deviceType = useDeviceType();
    const isMobileOrTablet = deviceType === 'mobile' || deviceType === 'tablet';
    const isLaptopOrDesktop = deviceType === 'laptop' || deviceType === 'desktop';

    return (
        <div className={`flex ${isMobileOrTablet ? 'flex-col' : 'flex-col lg:flex-row'} justify-between items-stretch gap-4 w-full`}>
            {/* Primera fila: Búsqueda y acciones */}
            <div className={`flex ${isMobileOrTablet ? 'flex-col gap-3' : 'flex-row justify-between items-center gap-4'} w-full`}>
                {/* Barra de búsqueda */}
                <form
                    onSubmit={e => {
                        e.preventDefault()
                        if (onSearch) onSearch(value || "")
                    }}
                    className={`${isMobileOrTablet ? 'w-full' : 'w-full'}`}
                >
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={searchPlaceholder}
                            className={`w-full pl-9 border-input bg-background hover:bg-accent/10 focus-visible:ring-purple-800 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:border-purple-900 ${isMobileOrTablet ? '' : 'max-w-md'}`}
                            value={value}
                            onChange={e => onValueChange?.(e.target.value)}
                        />
                    </div>
                </form>

                {/* Acciones (filtros y botones) */}
                <div className={`flex ${isMobileOrTablet ? 'flex-col gap-2' : 'flex-row'} items-center gap-2 w-full ${isMobileOrTablet ? '' : 'justify-end'}`}>
                    {filters && (
                        <div className={`${isMobileOrTablet ? 'w-full' : ''}`}>
                            {filters}
                        </div>
                    )}
                    {actions && (
                        <div className={`flex ${isMobileOrTablet ? 'flex-col w-full gap-2' : 'flex-row gap-2'}`}>
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 