"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Profile, Access, ProfileDTO } from "@/types/profiles/profile";
import { Plus, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Permission } from "@/types/permissions/permission";
import Can from "@/components/permission/can";

interface FormProfileProps {
    open: boolean;
    profileEdited: Profile | null;
    onSave: (profileDTO: ProfileDTO) => void;
    onClose: () => void;
    loading?: boolean;
    permissions: Permission[];
}

export const FormProfile: React.FC<FormProfileProps> = ({
    open,
    profileEdited,
    onSave,
    onClose,
    loading = false,
    permissions
}) => {
    const defaultProfile: Profile = {
        id: 0,
        name: "",
        description: "",
        isPublic: false,
        allowAll: false,
        accesses: [],
    };
    const [profile, setProfile] = useState<Profile>(defaultProfile);
    const [selectedPermission, setSelectedPermission] = useState<string>("");
    const [showSelect, setShowSelect] = useState(false);

    useEffect(() => {
        if (profileEdited) {
            const accesses: Access[] = profileEdited.role_has_permissions?.map((permission) => {
                const permissionDetails = permissions.find((p) => p.id === permission.permissionId);

                return {
                    id: permission.permissionId,
                    name: permission.name,
                    routeCode: permission.routeCode,
                    actions: permissionDetails?.actions || [],
                    restrictions: permissionDetails?.restrictions || [],
                    isSubRoute: permission.isSubRoute,
                    enabled: true,
                    selectedActions: permission.actions || [],
                    selectedRestrictions: permission.restrictions || [],
                };
            }) || [];

            setProfile({
                ...profileEdited,
                accesses,
            });
        } else {
            setProfile(defaultProfile);
        }
    }, [profileEdited, permissions]);

    const transformProfileToDTO = (profile: Profile): ProfileDTO => {
        return {
            name: profile.name,
            description: profile.description,
            allowAll: profile.allowAll,
            isPublic: profile.isPublic,
            role_has_permissions: (profile.accesses || []).map((access) => ({
                name: access.name,
                routeCode: access.routeCode,
                actions: access.selectedActions,
                restrictions: access.selectedRestrictions,
                isSubRoute: access.isSubRoute,
                permissionId: access.id,
            })),
        };
    };

    const handleSave = () => {
        const dto = transformProfileToDTO(profile);
        onSave(dto);
    };

    const updateField = (key: keyof Profile, value: any) => {
        setProfile((prev) => ({ ...prev, [key]: value }));
    };

    const addAccess = () => {
        const permission = permissions.find(p => p.id.toString() === selectedPermission);
        if (permission && !profile.accesses?.some((acc) => acc.id === permission.id)) {
            const newAccess: Access = {
                id: permission.id,
                name: permission.name,
                routeCode: permission.routeCode,
                actions: permission.actions,
                restrictions: permission.restrictions,
                isSubRoute: permission.isSubRoute,
                enabled: true,
                selectedActions: [],
                selectedRestrictions: [],
            };

            setProfile((prev) => ({
                ...prev,
                accesses: [...(prev.accesses || []), newAccess],
            }));
            setSelectedPermission("");
            setShowSelect(false);
        }
    };

    const removeAccess = (id: number) => {
        setProfile((prev) => ({
            ...prev,
            accesses: prev.accesses?.filter((access) => access.id !== id),
        }));
    };

    const toggleAccessEnabled = (id: number) => {
        setProfile((prev) => ({
            ...prev,
            accesses: prev.accesses?.map((access) =>
                access.id === id
                    ? {
                        ...access,
                        enabled: !access.enabled,
                        selectedActions: !access.enabled ? [] : access.selectedActions,
                        selectedRestrictions: !access.enabled ? [] : access.selectedRestrictions,
                    }
                    : access
            ),
        }));
    };

    const toggleAction = (accessId: number, action: string) => {
        setProfile((prev) => ({
            ...prev,
            accesses: prev.accesses?.map((access) =>
                access.id === accessId && access.enabled
                    ? {
                        ...access,
                        selectedActions: access.selectedActions.includes(action)
                            ? access.selectedActions.filter((a) => a !== action)
                            : [...access.selectedActions, action],
                    }
                    : access
            ),
        }));
    };

    const toggleRestriction = (accessId: number, restriction: string) => {
        setProfile((prev) => ({
            ...prev,
            accesses: prev.accesses?.map((access) =>
                access.id === accessId && access.enabled
                    ? {
                        ...access,
                        selectedRestrictions: access.selectedRestrictions.includes(restriction)
                            ? access.selectedRestrictions.filter((r) => r !== restriction)
                            : [...access.selectedRestrictions, restriction],
                    }
                    : access
            ),
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1200px] max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>{profileEdited ? "Editar Perfil" : "Nuevo Perfil"}</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">
                                Nombre
                            </label>
                            <Input
                                id="name"
                                value={profile.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                placeholder="Ejemplo: Reclutador"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-1">
                                Descripción
                            </label>
                            <textarea
                                id="description"
                                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={profile.description}
                                onChange={(e) => updateField("description", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            {/*<div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isPublic"
                                    checked={profile.isPublic}
                                    onCheckedChange={(checked) => updateField("isPublic", checked)}
                                />
                                <label htmlFor="isPublic" className="text-sm">
                                    Marcar si este Perfil será público para Empresas
                                </label>
                            </div>*/}

                            <Can action="asignar-super-admin" subject="configuracion-perfil">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="allowAll"
                                            checked={profile.allowAll}
                                            onCheckedChange={(checked) => updateField("allowAll", checked)}
                                        />
                                        <label htmlFor="allowAll" className="text-sm">
                                            Permitir todas las vistas y acciones del sistema
                                        </label>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 ml-6">
                                        Si marcas la siguiente casilla el usuario tendrá el rol de SuperAdmin y se
                                        ignorarán los accesos seleccionados.
                                    </p>
                                </div>
                            </Can>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h3 className="text-sm font-medium">Accesos del Perfil</h3>
                                <p className="text-sm text-muted-foreground">
                                    Puedes añadir nuevos accesos para este perfil
                                </p>
                            </div>
                            <Button
                                size="icon"
                                onClick={() => setShowSelect(true)}
                                className="rounded-full"
                            >
                                <Plus />
                            </Button>
                        </div>

                        {showSelect && (
                            <div className="flex gap-2 mb-4">
                                <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un acceso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {permissions
                                            .filter((permission) => !(profile.accesses ?? []).some((access) => access.id === permission.id))
                                            .map((permission) => (
                                                <SelectItem key={permission.id} value={permission.id.toString()}>
                                                    {permission.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <Can action="agregar-accesos" subject="configuracion-perfil">
                                    <Button
                                        onClick={addAccess}
                                        disabled={!selectedPermission}
                                        variant="default"
                                        size="sm"
                                    >
                                        AÑADIR
                                    </Button>
                                </Can>
                            </div>
                        )}

                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-6">
                                {(profile.accesses ?? []).map((access) => (
                                    <div key={access.id}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={access.enabled}
                                                    onCheckedChange={() => toggleAccessEnabled(access.id)}
                                                />
                                                <span className={cn(
                                                    "font-medium",
                                                    !access.enabled && "line-through text-destructive"
                                                )}>
                                                    {access.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={cn(
                                                    "px-2 py-1",
                                                    access.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                )}>
                                                    {access.enabled ? "Habilitado" : "Inactivo"}
                                                </Badge>
                                                <Can action="quitar-accesos" subject="configuracion-perfil">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeAccess(access.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </Can>
                                            </div>
                                        </div>

                                        {access.actions.length > 0 && (
                                            <div className="ml-6 mb-4">
                                                <p className="text-sm font-medium mb-2">Acciones</p>
                                                <div className="space-y-2">
                                                    {access.actions.map((action, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-500 w-6">
                                                                {idx + 1}.
                                                            </span>
                                                            <Can action="seleccionar-acciones" subject="configuracion-perfil">
                                                                <Checkbox
                                                                    checked={access.selectedActions.includes(action)}
                                                                    onCheckedChange={() => toggleAction(access.id, action)}
                                                                    disabled={!access.enabled}
                                                                />
                                                            </Can>
                                                            <span className={cn(
                                                                "text-sm",
                                                                (!access.enabled || !access.selectedActions.includes(action)) && "line-through text-destructive"
                                                            )}>
                                                                {action}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {(access.restrictions?.length ?? 0) > 0 && (
                                            <div className="ml-6">
                                                <p className="text-sm font-medium mb-2">Restricciones</p>
                                                <div className="space-y-2">
                                                    {access.restrictions.map((restriction, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-500 w-6">
                                                                {idx + 1}.
                                                            </span>
                                                            <Can action="seleccionar-restricciones" subject="configuracion-perfil">
                                                                <Checkbox
                                                                    checked={access.selectedRestrictions.includes(restriction)}
                                                                    onCheckedChange={() => toggleRestriction(access.id, restriction)}
                                                                    disabled={!access.enabled}
                                                                />
                                                            </Can>
                                                            <span className={cn(
                                                                "text-sm",
                                                                (!access.enabled || !access.selectedRestrictions.includes(restriction)) && "line-through text-destructive"
                                                            )}>
                                                                {restriction}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        CERRAR
                    </Button>
                    <Button onClick={handleSave}>
                        GUARDAR
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};