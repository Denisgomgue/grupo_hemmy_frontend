import { Button } from "@/components/ui/button"
import { FolderOpen, CheckCircle, XCircle } from "lucide-react"

interface ResourceFilterTabsProps {
    currentFilter: string
    onFilterChange: (filter: string) => void
    isLoading?: boolean
}

export function ResourceFilterTabs({
    currentFilter,
    onFilterChange,
    isLoading
}: ResourceFilterTabsProps) {
    const filters = [
        {
            key: "all",
            label: "Todos",
            icon: FolderOpen,
            variant: "default" as const
        },
        {
            key: "active",
            label: "Activos",
            icon: CheckCircle,
            variant: "default" as const
        },
        {
            key: "inactive",
            label: "Inactivos",
            icon: XCircle,
            variant: "default" as const
        }
    ]

    return (
        <div className="flex space-x-2 mb-6">
            {filters.map((filter) => {
                const Icon = filter.icon
                const isActive = currentFilter === filter.key

                return (
                    <Button
                        key={filter.key}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => onFilterChange(filter.key)}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                    >
                        <Icon className="h-4 w-4" />
                        {filter.label}
                    </Button>
                )
            })}
        </div>
    )
} 