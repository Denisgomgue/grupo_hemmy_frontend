import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ReactNode } from "react"

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
    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <form
                onSubmit={e => {
                    e.preventDefault()
                    if (onSearch) onSearch(value || "")
                }}
                className="w-full md:w-auto"
            >
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={searchPlaceholder}
                        className="w-full md:w-[300px] pl-9 border-input bg-background hover:bg-accent/10 focus-visible:ring-purple-800 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:border-purple-900"
                        value={value}
                        onChange={e => onValueChange?.(e.target.value)}
                    />
                </div>
            </form>
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                {filters}
                {actions}
            </div>
        </div>
    )
} 