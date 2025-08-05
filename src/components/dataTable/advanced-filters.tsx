import { Button } from "@/components/ui/button"
import { ResponsiveButton } from "@/components/ui/responsive-button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import { Filter } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useState, useEffect } from "react"
import { CheckboxGroup } from "./checkbox-group"

interface FilterOption {
    id: string;
    label: string;
}

interface FilterGroup {
    id: string;
    label: string;
    type: 'checkbox' | 'slider' | 'checkbox-group';
    options?: FilterOption[];
    range?: { min: number; max: number; step: number };
}

interface AdvancedFiltersProps {
    groups: FilterGroup[];
    onFiltersChange: (filters: any) => void;
    initialFilters?: any;
}

export function AdvancedFilters({ groups, onFiltersChange, initialFilters = {} }: AdvancedFiltersProps) {
    const [ filters, setFilters ] = useState(initialFilters);
    const [ isOpen, setIsOpen ] = useState(false);

    useEffect(() => {
        setFilters(initialFilters);
    }, [ initialFilters ]);

    const handleCheckboxChange = (groupId: string, optionId: string, checked: boolean) => {
        const newFilters = {
            ...filters,
            [ groupId ]: {
                ...(filters[ groupId ] || {}),
                [ optionId ]: checked
            }
        };
        setFilters(newFilters);
    };

    const handleSliderChange = (groupId: string, value: number[]) => {
        const newFilters = {
            ...filters,
            [ groupId ]: {
                min: value[ 0 ],
                max: value[ 1 ]
            }
        };
        setFilters(newFilters);
    };

    const handleApplyFilters = () => {
        onFiltersChange(filters);
        setIsOpen(false);
    };

    const handleResetFilters = () => {
        const emptyFilters = {};
        setFilters(emptyFilters);
        onFiltersChange(emptyFilters);
    };

    const renderFilterGroup = (group: FilterGroup) => {
        switch (group.type) {
            case 'checkbox':
                return (
                    <div className="space-y-2">
                        {group.options?.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`${group.id}-${option.id}`}
                                    checked={filters[ group.id ]?.[ option.id ] || false}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange(group.id, option.id, checked as boolean)
                                    }
                                />
                                <Label htmlFor={`${group.id}-${option.id}`}>{option.label}</Label>
                            </div>
                        ))}
                    </div>
                );
            case 'checkbox-group':
                return (
                    <CheckboxGroup
                        options={group.options || []}
                        selectedValues={filters[ group.id ] || {}}
                        onChange={(optionId, checked) => handleCheckboxChange(group.id, optionId, checked)}
                    />
                );
            case 'slider':
                if (!group.range) return null;
                const value = filters[ group.id ] || { min: group.range.min, max: group.range.max };
                return (
                    <div className="space-y-4">
                        <Slider
                            min={group.range.min}
                            max={group.range.max}
                            step={group.range.step}
                            value={[ value.min, value.max ]}
                            onValueChange={(newValue) => handleSliderChange(group.id, newValue)}
                        />
                        <div className="flex justify-between text-sm">
                            <span>S/. {value.min}</span>
                            <span>S/. {value.max}</span>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <ResponsiveButton variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros Avanzados
                </ResponsiveButton>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Filtros Avanzados</SheetTitle>
                    <SheetDescription>
                        Ajusta los filtros para encontrar exactamente lo que buscas
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-200px)] mt-4">
                    <Accordion type="single" collapsible className="w-full">
                        {groups.map((group) => (
                            <AccordionItem key={group.id} value={group.id}>
                                <AccordionTrigger>{group.label}</AccordionTrigger>
                                <AccordionContent>
                                    {renderFilterGroup(group)}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </ScrollArea>
                <SheetFooter className="mt-4">
                    <Button variant="outline" onClick={handleResetFilters}>
                        Resetear Filtros
                    </Button>
                    <Button onClick={handleApplyFilters}>
                        Aplicar Filtros
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
} 