import { Button } from "@/components/ui/button"
import { Edit, Trash2, Power, PowerOff } from "lucide-react"
import { Resource } from "@/hooks/use-resources-api"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface ResourceActionsProps {
    resource: Resource
    onEdit: (resource: Resource) => void
    onDelete: (id: number) => void
    onToggleActive: (id: number) => void
}

export function ResourceActions({
    resource,
    onEdit,
    onDelete,
    onToggleActive,
}: ResourceActionsProps) {
    return (
        <TooltipProvider>
            <div className="flex items-center gap-1">
                {/* Botón Editar */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => onEdit(resource)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar módulo</p>
                    </TooltipContent>
                </Tooltip>

                {/* Botón Activar/Desactivar */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${
                                resource.isActive 
                                    ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
                                    : "text-green-600 hover:text-green-700 hover:bg-green-50"
                            }`}
                            onClick={() => onToggleActive(resource.id)}
                        >
                            {resource.isActive ? (
                                <PowerOff className="h-4 w-4" />
                            ) : (
                                <Power className="h-4 w-4" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{resource.isActive ? "Desactivar" : "Activar"} módulo</p>
                    </TooltipContent>
                </Tooltip>

                {/* Botón Eliminar */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onDelete(resource.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar módulo</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    )
} 