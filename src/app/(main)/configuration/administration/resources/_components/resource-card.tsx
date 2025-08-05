import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Power, PowerOff, Calendar, Hash } from "lucide-react"
import { Resource } from "@/hooks/use-resources-api"

interface ResourceCardProps {
    resource: Resource
    onEdit: () => void
    onDelete: () => void
    onToggleActive: () => void
}

export function ResourceCard({
    resource,
    onEdit,
    onDelete,
    onToggleActive,
}: ResourceCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                {/* Header con avatar y acciones */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div>
                            <h3 className="font-semibold text-lg">{resource.displayName}</h3>

                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onToggleActive}
                                className={resource.isActive ? "text-orange-600" : "text-green-600"}
                            >
                                {resource.isActive ? (
                                    <>
                                        <PowerOff className="mr-2 h-4 w-4" />
                                        Desactivar
                                    </>
                                ) : (
                                    <>
                                        <Power className="mr-2 h-4 w-4" />
                                        Activar
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Información del módulo */}
                <div className="space-y-4">
                    {/* Código de ruta */}
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center justify-between">
                            <Hash className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-xs font-medium text-gray-500">Código de Ruta</p>
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                                    {resource.routeCode}
                                </code>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Badge variant={resource.isActive ? "default" : "secondary"} className="text-xs">
                                    {resource.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Estado y orden */}


                    {/* Descripción */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Descripción</p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                            {resource.description || "Sin descripción"}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 