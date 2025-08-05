"use client";

import { Button } from "@/components/ui/button"
import { Resource } from "@/types/resources"

interface ModuleNavigationProps {
    modules: Resource[]
    selectedModule: string
    onModuleChange: (moduleId: string) => void
    isLoading?: boolean
}

export function ModuleNavigation({
    modules,
    selectedModule,
    onModuleChange,
    isLoading = false
}: ModuleNavigationProps) {
    const selectedModuleData = modules.find(m => m.routeCode === selectedModule)

    return (
        <div className="p-6 pb-0 border-b border-gray-100">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Recurso: {selectedModuleData?.displayName || 'Seleccionar recurso'}
                </h2>
                {selectedModuleData?.description && (
                    <p className="text-sm text-gray-600 mt-1">
                        {selectedModuleData.description}
                    </p>
                )}
            </div>

            <div className="relative">
                <div className="flex gap-1 bg-gray-50 rounded-lg p-1 overflow-x-auto">
                    <div className="flex gap-1 min-w-max">
                        {modules
                            .filter(module => module.isActive) // Solo recursos activos
                            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)) // Ordenar por orderIndex
                            .map((module) => (
                                <Button
                                    key={module.id}
                                    variant="ghost"
                                    onClick={() => onModuleChange(module.routeCode)}
                                    disabled={isLoading}
                                    className={`
                                        px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap
                                        ${selectedModule === module.routeCode
                                            ? "bg-white text-purple-600 shadow-sm border border-purple-200"
                                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                                        }
                                    `}
                                >
                                    {module.displayName}
                                </Button>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    )
} 