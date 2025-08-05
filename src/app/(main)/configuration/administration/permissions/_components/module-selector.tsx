"use client";

import { Button } from "@/components/ui/button"
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"

interface Module {
    id: string
    name: string
}

interface ModuleSelectorProps {
    modules: Module[]
    selectedModule: string
    onModuleChange: (moduleId: string) => void
    onAddModule: () => void
    onEditModule: (moduleId: string) => void
    onDeleteModule: (moduleId: string) => void
    isLoading?: boolean
}

export function ModuleSelector({
    modules,
    selectedModule,
    onModuleChange,
    onAddModule,
    onEditModule,
    onDeleteModule,
    isLoading = false
}: ModuleSelectorProps) {
    const [ openModuleMenu, setOpenModuleMenu ] = useState<string | null>(null)

    // Efecto para cerrar menús al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('.menu-container')) {
                setOpenModuleMenu(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const toggleModuleMenu = (moduleId: string) => {
        setOpenModuleMenu(openModuleMenu === moduleId ? null : moduleId)
    }

    const selectedModuleData = modules.find(m => m.id === selectedModule)

    return (
        <div className="p-6 pb-0 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Módulo: {selectedModuleData?.name || 'Seleccionar módulo'}
                </h2>
                {selectedModuleData && (
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleModuleMenu(selectedModule)}
                            className="p-2 h-8 w-8"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                        {openModuleMenu === selectedModule && (
                            <div className="menu-container absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEditModule(selectedModule)}
                                    className="w-full justify-start px-3 py-2 text-sm hover:bg-gray-50"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDeleteModule(selectedModule)}
                                    className="w-full justify-start px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="relative">
                <div className="flex gap-1 bg-gray-50 rounded-lg p-1 overflow-x-auto">
                    <div className="flex gap-1 min-w-max">
                        {modules.map((module) => (
                            <Button
                                key={module.id}
                                variant="ghost"
                                onClick={() => onModuleChange(module.id)}
                                disabled={isLoading}
                                className={`
                                    px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap
                                    ${selectedModule === module.id
                                        ? "bg-white text-purple-600 shadow-sm border border-purple-200"
                                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                                    }
                                `}
                            >
                                {module.name}
                            </Button>
                        ))}
                        <Button
                            variant="ghost"
                            onClick={onAddModule}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-dashed border-purple-300 hover:border-purple-400 flex-shrink-0"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar Módulo
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
} 