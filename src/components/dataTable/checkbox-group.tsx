import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface Option {
    id: string;
    label: string;
}

interface CheckboxGroupProps {
    options: Option[];
    selectedValues: { [ key: string ]: boolean };
    onChange: (id: string, checked: boolean) => void;
    title?: string;
    className?: string;
}

export function CheckboxGroup({ options, selectedValues, onChange, title, className }: CheckboxGroupProps) {
    return (
        <div className={cn("w-full", className)}>
            {title && (
                <h4 className="mb-4 text-sm font-medium leading-none">{title}</h4>
            )}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {options.map((option) => (
                    <label
                        key={option.id}
                        className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-lg border p-4 transition-colors",
                            selectedValues[ option.id ]
                                ? "border-primary bg-primary/5"
                                : "border-input hover:bg-accent/5"
                        )}
                    >
                        <Checkbox
                            checked={selectedValues[ option.id ] || false}
                            onCheckedChange={(checked) => onChange(option.id, checked as boolean)}
                            className="h-5 w-5"
                        />
                        <span className="text-sm">{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    )
} 