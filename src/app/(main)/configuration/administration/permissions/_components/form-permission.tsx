"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Permission } from "@/types/permissions/permission";
import { ListCrud } from "./list-crud";

interface FormPermissionProps {
    open: boolean;
    permissionEdited: Permission | null;
    onSave: (permission: Permission) => void;
    onClose: () => void;
    loading?: boolean;
}

export const FormPermission: React.FC<FormPermissionProps> = ({
    open,
    permissionEdited,
    onSave,
    onClose,
    loading = false,
}) => {
    const defaultPermission: Permission = {
        id: 0,
        name: "",
        routeCode: "",
        actions: [],
        restrictions: [],
        isSubRoute: false
    };

    const [permission, setPermission] = useState<Permission>(defaultPermission);

    useEffect(() => {
        if (permissionEdited) {
            setPermission(permissionEdited);
        } else {
            setPermission(defaultPermission);
        }
    }, [permissionEdited]);

    const handleSave = () => {
        onSave(permission);
    };

    const updateField = (key: keyof Permission, value: any) => {
        setPermission((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-w-full max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>{permissionEdited ? "Editar Permiso" : "Nuevo Permiso"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium">
                            Nombre
                        </label>
                        <Input
                            id="name"
                            value={permission.name}
                            onChange={(e) => updateField("name", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="routeCode" className="block text-sm font-medium">
                            Código Ruta Fronted
                        </label>
                        <Input
                            id="routeCode"
                            value={permission.routeCode}
                            placeholder="Ejemplo: candidatos-busqueda"
                            onChange={(e) => updateField("routeCode", e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isSubRoute"
                            checked={permission.isSubRoute}
                            onCheckedChange={(checked) => updateField("isSubRoute", checked as boolean)}
                        />
                        <label htmlFor="isSubRoute" className="text-sm">
                            Marcar si es una sub ruta
                        </label>
                    </div>

                    <div>
                        <ListCrud
                            value={permission.actions}
                            onChange={(updatedActions) =>
                                setPermission((prev) => ({ ...prev, actions: updatedActions }))
                            }
                            title="Acciones del Permiso"
                            subTitle="(No se considerarán para el guardado las acciones que no tengan contenido)"
                            chipColor="blue"
                            context="acciones"
                        />
                    </div>

                    <div>
                        <ListCrud
                            value={permission.restrictions}
                            onChange={(updatedRestrictions) =>
                                setPermission((prev) => ({ ...prev, restrictions: updatedRestrictions }))
                            }
                            title="Restricciones del Permiso"
                            subTitle="(No se considerarán para el guardado las restricciones que no tengan contenido)"
                            chipColor="red"
                            context="restricciones"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};