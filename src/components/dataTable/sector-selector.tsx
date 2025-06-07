import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

interface Sector {
    id: string;
    name: string;
}

interface SectorSelectorProps {
    sectors: Sector[];
    selectedSectors: string[];
    onSectorChange: (sectors: string[]) => void;
}

export function SectorSelector({ sectors, selectedSectors, onSectorChange }: SectorSelectorProps) {
    const [ open, setOpen ] = useState(false);

    const toggleSector = (sectorId: string) => {
        const newSelection = selectedSectors.includes(sectorId)
            ? selectedSectors.filter(id => id !== sectorId)
            : [ ...selectedSectors, sectorId ];
        onSectorChange(newSelection);
    };

    return (
        <div className="flex flex-col gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="justify-between"
                    >
                        Seleccionar Sectores
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder="Buscar sector..." />
                        <CommandEmpty>No se encontraron sectores.</CommandEmpty>
                        <CommandGroup>
                            {sectors.map((sector) => (
                                <CommandItem
                                    key={sector.id}
                                    onSelect={() => toggleSector(sector.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedSectors.includes(sector.id)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {sector.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
            <div className="flex flex-wrap gap-2">
                {selectedSectors.map((sectorId) => {
                    const sector = sectors.find(s => s.id === sectorId);
                    return sector ? (
                        <Badge
                            key={sector.id}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => toggleSector(sector.id)}
                        >
                            {sector.name}
                        </Badge>
                    ) : null;
                })}
            </div>
        </div>
    );
} 