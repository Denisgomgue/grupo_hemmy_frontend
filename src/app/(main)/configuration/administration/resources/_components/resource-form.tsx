"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Resource, CreateResourceData } from '@/hooks/use-resources-api'

interface ResourceFormProps {
    resource?: Resource | null
    onSubmit: (values: CreateResourceData) => Promise<void>
    isLoading: boolean
    onCancel: () => void
    checkRouteCodeExists: (routeCode: string) => boolean
    checkDisplayNameExists: (displayName: string) => boolean
}

export function ResourceForm({
    resource,
    onSubmit,
    isLoading,
    onCancel,
    checkRouteCodeExists,
    checkDisplayNameExists
}: ResourceFormProps) {
    const [ formData, setFormData ] = useState<CreateResourceData>({
        routeCode: '',
        displayName: '',
        description: '',
        isActive: true,
        orderIndex: 0
    })

    const isEditMode = !!resource

    // Cargar datos del recurso si es modo edición
    useEffect(() => {
        if (resource) {
            setFormData({
                routeCode: resource.routeCode,
                displayName: resource.displayName,
                description: resource.description || '',
                isActive: resource.isActive,
                orderIndex: resource.orderIndex || 0
            })
        } else {
            // Resetear formulario si es modo creación
            setFormData({
                routeCode: '',
                displayName: '',
                description: '',
                isActive: true,
                orderIndex: 0
            })
        }
    }, [ resource ])

    const handleInputChange = (field: keyof CreateResourceData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [ field ]: value
        }))
    }

    const validateForm = (): boolean => {
        // Validar campos requeridos
        if (!formData.displayName.trim()) {
            toast.error('El nombre del módulo es requerido')
            return false
        }

        if (!formData.routeCode.trim()) {
            toast.error('El código de ruta es requerido')
            return false
        }

        // Validar formato del routeCode (solo letras minúsculas, números y guiones)
        if (!/^[a-z0-9-]+$/.test(formData.routeCode.trim())) {
            toast.error('El código de ruta solo puede contener letras minúsculas, números y guiones')
            return false
        }

        // Validar unicidad del routeCode (solo en modo creación)
        if (!isEditMode && checkRouteCodeExists(formData.routeCode.trim())) {
            toast.error('Ya existe un módulo con ese código de ruta')
            return false
        }

        // Validar unicidad del displayName (solo en modo creación)
        if (!isEditMode && checkDisplayNameExists(formData.displayName.trim())) {
            toast.error('Ya existe un módulo con ese nombre')
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        const cleanData = {
            routeCode: formData.routeCode.trim(),
            displayName: formData.displayName.trim(),
            description: formData.description?.trim() || undefined,
            isActive: formData.isActive,
            orderIndex: formData.orderIndex
        }

        await onSubmit(cleanData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="displayName">Nombre del Módulo *</Label>
                    <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        placeholder="Ej: Gestión de Usuarios"
                        disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">
                        Nombre que aparecerá en la interfaz
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="routeCode">Código de Ruta *</Label>
                    <Input
                        id="routeCode"
                        value={formData.routeCode}
                        onChange={(e) => handleInputChange('routeCode', e.target.value)}
                        placeholder="Ej: user-management"
                        disabled={isLoading || isEditMode} // No permitir editar en modo edición
                    />
                    <p className="text-xs text-gray-500">
                        {isEditMode
                            ? 'El código de ruta no se puede modificar una vez creado'
                            : 'Identificador único del módulo (solo letras minúsculas, números y guiones)'
                        }
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descripción opcional del módulo"
                    disabled={isLoading}
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="orderIndex">Orden de Aparición</Label>
                    <Input
                        id="orderIndex"
                        type="number"
                        min="0"
                        value={formData.orderIndex}
                        onChange={(e) => handleInputChange('orderIndex', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">
                        Número menor = aparece primero en la lista
                    </p>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                    <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                        disabled={isLoading}
                    />
                    <Label htmlFor="isActive">Módulo Activo</Label>
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading || !formData.displayName.trim() || !formData.routeCode.trim()}
                >
                    {isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar Módulo' : 'Crear Módulo')}
                </Button>
            </div>
        </form>
    )
} 