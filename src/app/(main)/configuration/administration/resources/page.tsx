"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useResourcesAPI } from "@/hooks/use-resources-api"
import { MainContainer } from "@/components/layout/main-container"
import { HeaderActions } from "@/components/layout/header-actions"
import { AddButton } from "@/components/layout/add-button"
import { ReloadButton } from "@/components/layout/reload-button"
import { ResponsiveTable } from "@/components/responsive-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ColumnDef } from "@tanstack/react-table"
import { useState, useEffect, useMemo } from "react"
import { PaginatedCards } from "@/components/dataTable/paginated-cards"
import { ViewModeSwitcher } from "@/components/dataTable/view-mode-switcher"
import { TableToolbar } from "@/components/dataTable/table-toolbar"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "sonner"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Settings2 } from "lucide-react"

// Importar componentes específicos de resources
import {
    ResourceForm,
    ResourceCard,
    ResourceSummaryCards,
    ResourceFilterTabs,
    baseColumns,
    headers,
    ResourceActions
} from "./_components"
import { useResourceFilters } from '@/hooks/use-resource-filters'
import type { Resource } from '@/hooks/use-resources-api'

export default function ResourcesPage() {
    const queryClient = useQueryClient()
    const { toast: useToastToast } = useToast()
    const {
        resources,
        loadResources,
        refreshResources,
        createResource,
        updateResource,
        deleteResource,
        toggleResourceActive,
        checkRouteCodeExists,
        checkDisplayNameExists
    } = useResourcesAPI()

    const {
        searchTerm, setSearchTerm,
        filters, setFilters,
        currentPage, setCurrentPage,
        pageSize, setPageSize,
        viewMode, setViewMode,
        paginatedResources,
        totalRecords
    } = useResourceFilters(resources)

    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ selectedResource, setSelectedResource ] = useState<Resource | null>(null)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ isSubmitting, setIsSubmitting ] = useState(false)

    const handleAdd = () => {
        setSelectedResource(null)
        setIsModalOpen(true)
    }

    const handleEdit = (resource: Resource) => {
        setSelectedResource(resource)
        setIsModalOpen(true)
    }

    const handleDelete = async (resourceId: number) => {
        setIsLoading(true)
        try {
            await deleteResource(resourceId)
            useToastToast({ title: "Módulo eliminado correctamente" })
            // No necesitamos llamar a refreshResources() porque el sistema de listeners se encarga automáticamente
        } catch (error) {
            console.error('Error al eliminar módulo:', error)
            useToastToast({
                title: "Error al eliminar módulo",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleActive = async (resourceId: number) => {
        try {
            await toggleResourceActive(resourceId)
            // No necesitamos llamar a refreshResources() porque el sistema de listeners se encarga automáticamente
        } catch (error) {
            console.error('Error al cambiar estado del módulo:', error)
            useToastToast({
                title: "Error al cambiar estado del módulo",
                variant: "destructive",
            })
        }
    }

    const handleSave = async (values: any) => {
        setIsSubmitting(true)
        try {
            if (selectedResource) {
                await updateResource(selectedResource.id, values)
                useToastToast({ title: "Módulo actualizado correctamente" })
            } else {
                await createResource(values)
                useToastToast({ title: "Módulo creado correctamente" })
            }
            setIsModalOpen(false)
            setSelectedResource(null)
            // No necesitamos llamar a refreshResources() porque el sistema de listeners se encarga automáticamente
        } catch (error) {
            console.error('Error al guardar módulo:', error)
            useToastToast({
                title: `Error al ${selectedResource ? "actualizar" : "crear"} módulo`,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePaginationChange = (page: number, newPageSize: number) => {
        setCurrentPage(page)
        setPageSize(newPageSize)
    }

    const handleReload = () => {
        refreshResources()
    }

    const handleFilterChange = (filter: string) => {
        setFilters(filter)
        setCurrentPage(1)
    }

    const handleSearch = (value: string) => {
        setSearchTerm(value)
    }

    const handleSetViewMode = (mode: string) => {
        if (mode === "list" || mode === "grid") setViewMode(mode)
    }

    const resourceColumns = React.useMemo((): ColumnDef<Resource>[] => {
        const columnsBase = baseColumns

        return [
            ...columnsBase,
            {
                id: "actions",
                header: "Opciones",
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <ResourceActions
                            resource={row.original}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleActive={handleToggleActive}
                        />
                    </div>
                ),
            },
        ]
    }, [ handleDelete, handleEdit, handleToggleActive ])

    // Cargar datos iniciales
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await loadResources()
            } catch (error) {
                console.error('Error al cargar datos iniciales:', error)
            }
        }

        loadInitialData()
    }, [ loadResources ])

    return (
        <MainContainer>
            <HeaderActions title="Gestión de Módulos">
                <div className="flex items-center gap-2">
                    <ReloadButton onClick={handleReload} disabled={isLoading} />
                    <AddButton onClick={handleAdd} disabled={isLoading} />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => toast.info("Funcionalidad en desarrollo")}
                                    disabled={isLoading}
                                >
                                    <Settings2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Configuración avanzada</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </HeaderActions>

            {/* Summary Cards */}
            <ResourceSummaryCards
                summary={{
                    totalResources: resources.length,
                    activeResources: resources.filter(r => r.isActive).length,
                    inactiveResources: resources.filter(r => !r.isActive).length,
                    recentResources: resources.filter(r => {
                        const createdDate = new Date(r.created_at)
                        const oneWeekAgo = new Date()
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                        return createdDate > oneWeekAgo
                    }).length
                }}
                isLoading={isLoading}
            />

            {/* Filter Tabs */}
            <ResourceFilterTabs
                currentFilter={filters}
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
            />

            {/* Search and View Controls */}
            <div className="flex items-center justify-between mb-6">
                <TableToolbar
                    value={searchTerm}
                    onValueChange={handleSearch}
                    searchPlaceholder="Buscar por nombre, código de ruta..."
                    filters={
                        <Select defaultValue="recent">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="recent">Más Reciente</SelectItem>
                                <SelectItem value="oldest">Más Antiguo</SelectItem>
                                <SelectItem value="name-asc">Nombre A-Z</SelectItem>
                                <SelectItem value="name-desc">Nombre Z-A</SelectItem>
                                <SelectItem value="order-asc">Orden Ascendente</SelectItem>
                                <SelectItem value="order-desc">Orden Descendente</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                    actions={
                        <>
                            <Button variant="outline">Exportar</Button>
                            <Button variant="outline">Importar</Button>
                        </>
                    }
                />
                <ViewModeSwitcher viewMode={viewMode} setViewMode={handleSetViewMode} />
            </div>

            {/* Content */}
            {viewMode === "list" ? (
                <ResponsiveTable
                    headers={headers}
                    columns={resourceColumns}
                    data={paginatedResources}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        pageSize,
                        totalRecords,
                        onPaginationChange: handlePaginationChange,
                    }}
                />
            ) : (
                <PaginatedCards
                    data={paginatedResources}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    onPaginationChange={handlePaginationChange}
                    renderCard={(resource) => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            onEdit={() => handleEdit(resource)}
                            onDelete={() => handleDelete(resource.id)}
                            onToggleActive={() => handleToggleActive(resource.id)}
                        />
                    )}
                    isLoading={isLoading}
                />
            )}

            {/* Resource Form Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedResource ? "Editar" : "Crear"} Módulo</DialogTitle>
                    </DialogHeader>
                    <ResourceForm
                        resource={selectedResource}
                        onSubmit={handleSave}
                        isLoading={isSubmitting}
                        onCancel={() => setIsModalOpen(false)}
                        checkRouteCodeExists={checkRouteCodeExists}
                        checkDisplayNameExists={checkDisplayNameExists}
                    />
                </DialogContent>
            </Dialog>
        </MainContainer>
    )
} 