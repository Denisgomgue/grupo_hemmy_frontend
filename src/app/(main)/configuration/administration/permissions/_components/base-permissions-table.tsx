"use client";

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Plus, MoreVertical, Edit, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"

interface Role {
    id: number
    name: string
}

interface ModuleConfig {
    id: string
    name: string
    basePermissions: string[]
}

interface BasePermissionsTableProps {
    roles: Role[]
    moduleConfig: ModuleConfig | undefined
    selectedModule: string
    getPermissionStatus: (roleName: string, module: string, permission: string) => boolean
    handlePermissionChange: (roleName: string, module: string, permission: string, granted: boolean) => void
    isRoleAllowAll: (roleName: string) => boolean
    onAddRole: () => void
    onEditRole: (roleName: string) => void
    onDeleteRole: (roleName: string) => void
    onAddBasePermission: () => void
    isLoading?: boolean
}

export function BasePermissionsTable({
    roles,
    moduleConfig,
    selectedModule,
    getPermissionStatus,
    handlePermissionChange,
    isRoleAllowAll,
    onAddRole,
    onEditRole,
    onDeleteRole,
    onAddBasePermission,
    isLoading = false
}: BasePermissionsTableProps) {
    const [ openRoleMenu, setOpenRoleMenu ] = useState<string | null>(null)

    // Efecto para cerrar menús al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('.menu-container')) {
                setOpenRoleMenu(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const toggleRoleMenu = (roleName: string) => {
        setOpenRoleMenu(openRoleMenu === roleName ? null : roleName)
    }

    if (!moduleConfig) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">Selecciona un módulo para ver los permisos</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <div className="min-w-max">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left p-4 font-semibold text-gray-700">Rol</th>
                            {moduleConfig.basePermissions.map(permission => (
                                <th key={permission} className="text-center p-4 font-semibold text-gray-700">
                                    <div className="flex flex-col items-center gap-1">
                                        <span>{permission}</span>
                                    </div>
                                </th>
                            ))}
                            <th className="text-center p-4 font-semibold text-gray-700">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onAddBasePermission}
                                    className="text-violet-400 hover:text-violet-500 hover:bg-violet-50 border border-dashed border-violet-300 hover:border-violet-400 transition-all duration-200 text-xs opacity-70"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Nuevo Permiso
                                </Button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map(role => (
                            <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 group">
                                <td className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-purple-600" />
                                            <span className="font-medium text-gray-900">{role.name}</span>
                                            {isRoleAllowAll(role.name) && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Super Admin
                                                </span>
                                            )}
                                        </div>
                                        {!isRoleAllowAll(role.name) && (
                                            <div className="relative">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleRoleMenu(role.name)}
                                                    className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreVertical className="h-3 w-3" />
                                                </Button>
                                                {openRoleMenu === role.name && (
                                                    <div className="menu-container absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[100px]">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onEditRole(role.name)}
                                                            className="w-full justify-start px-2 py-1 text-xs hover:bg-gray-50"
                                                        >
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onDeleteRole(role.name)}
                                                            className="w-full justify-start px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-1" />
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                {moduleConfig.basePermissions.map(permission => (
                                    <td key={permission} className="text-center p-4">
                                        <Checkbox
                                            checked={getPermissionStatus(role.name, selectedModule, permission)}
                                            onCheckedChange={(checked) =>
                                                handlePermissionChange(role.name, selectedModule, permission, checked as boolean)
                                            }
                                            disabled={isRoleAllowAll(role.name) || isLoading}
                                            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </td>
                                ))}
                                <td className="text-center p-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onAddBasePermission}
                                        className="text-violet-400 hover:text-violet-500 hover:bg-violet-50 border border-dashed border-violet-300 hover:border-violet-400 transition-all duration-200 text-xs opacity-70"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {/* Fila para agregar nuevo rol */}
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                            <td className="p-4">
                                <Button
                                    variant="ghost"
                                    onClick={onAddRole}
                                    disabled={isLoading}
                                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-dashed border-purple-300 hover:border-purple-400 transition-all duration-200"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Rol
                                </Button>
                            </td>
                            {moduleConfig.basePermissions.map(permission => (
                                <td key={permission} className="text-center p-4">
                                    <div className="w-4 h-4"></div>
                                </td>
                            ))}
                            <td className="text-center p-4">
                                <div className="w-4 h-4"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
} 