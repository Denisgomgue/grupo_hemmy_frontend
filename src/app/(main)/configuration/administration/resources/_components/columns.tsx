import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Resource } from "@/hooks/use-resources-api"

export const baseColumns: ColumnDef<Resource>[] = [
    {
        accessorKey: "displayName",
        header: "Módulo",
        cell: ({ row }) => {
            const resource = row.original
            return (
                <div className="flex items-center">
                    
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {resource.displayName}
                        </div>
                        
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "routeCode",
        header: "Código de Ruta",
        cell: ({ row }) => {
            return (
                <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                    {row.getValue("routeCode")}
                </code>
            )
        },
    },
    {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive") as boolean
            return (
                <div className="flex items-center space-x-2">                    
                        {isActive ? "Activo" : "Inactivo"}
                </div>
            )
        },
    }

    
] 