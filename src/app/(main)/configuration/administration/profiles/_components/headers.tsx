"use client";

import { Badge } from "@/components/ui/badge";
import { Profile } from "@/types/profiles/profile";
import { PermissionsCell } from "./permission-cell";

export const headers = [
    {
        key: "name",
        label: "Perfil",
        render: (value: string, item: Profile) => (
            <div className="font-medium">{item.name}</div>
        ),
    },
    {
        key: "description",
        label: "Descripción",
        render: (value: string, item: Profile) => (
            <div className="text-sm text-muted-foreground">
                {item.description || "Sin descripción"}
            </div>
        ),
    },
    {
        key: "allowAll",
        label: "SuperAdmin",
        render: (value: string, item: Profile) => (
            <div className="flex items-center justify-center">
                {item.allowAll ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-[#28C76F]/20 dark:text-green-600 font-normal">
                        Habilitado
                    </Badge>
                ) : (
                    <div className="text-sm text-muted-foreground">
                        false
                    </div>
                )}
            </div>
        ),
    },
    {
        key: "role_has_permissions",
        label: "Permisos",
        render: (value: string, item: Profile) => (
            <PermissionsCell
                permissions={item.role_has_permissions || []}
                allowAll={item.allowAll}
            />
        ),
    },
];