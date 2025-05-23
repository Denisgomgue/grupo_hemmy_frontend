import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"

interface ViewModeSwitcherProps {
    viewMode: string
    setViewMode: (mode: string) => void
    modes?: { value: string, icon: React.ReactNode, label?: string }[]
}

export function ViewModeSwitcher({ viewMode, setViewMode, modes }: ViewModeSwitcherProps) {
    // Por defecto: lista y grid
    const defaultModes = [
        { value: "list", icon: <List className="h-4 w-4" />, label: "Lista" },
        { value: "grid", icon: <LayoutGrid className="h-4 w-4" />, label: "Cuadrícula" },
    ]
    const modeList = modes || defaultModes

    return (
        <div className="flex border rounded-md">
            {modeList.map((mode, idx) => (
                <Button
                    key={mode.value}
                    variant={viewMode === mode.value ? "default" : "ghost"}
                    size="icon"
                    className={
                        idx === 0
                            ? "rounded-r-none"
                            : idx === modeList.length - 1
                                ? "rounded-l-none"
                                : "rounded-none"
                    }
                    onClick={() => setViewMode(mode.value)}
                    aria-label={mode.label || mode.value}
                >
                    {mode.icon}
                </Button>
            ))}
        </div>
    )
} 