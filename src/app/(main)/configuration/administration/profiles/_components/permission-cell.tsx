"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaEye } from "react-icons/fa";

interface PermissionsCellProps {
    permissions: {
        id?: number;
        actions: string[];
        restrictions: string[];
    }[];
    allowAll: boolean;
}

export const PermissionsCell: React.FC<PermissionsCellProps> = ({ permissions, allowAll }) => {
    const [open, setOpen] = useState(false);

    if (allowAll) {
        return (
            <div className="flex items-center justify-center text-sm text-muted-foreground">
                Todos los permisos
            </div>
        );
    }

    return permissions.length > 0 ? (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center justify-center">
                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                            >
                                <FaEye />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Ver todos los permisos asignados
                        </TooltipContent>
                    </Tooltip>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
                <h2 className="text-lg font-bold mb-4">Todos los Permisos</h2>
                <div className="space-y-2">
                    {permissions.map((permission) => (
                        <div key={permission.id} className="space-y-1">
                            <div className="flex flex-wrap gap-1 ml-2">
                                {permission.actions.map((action, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                        {action}
                                    </Badge>
                                ))}
                                {permission.restrictions.map((restriction, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs bg-red-50 text-red-700 border-red-200"
                                    >
                                        {restriction}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    ) : (
        <div className="flex items-center justify-center">
            <span className="text-sm text-muted-foreground">
                Sin permisos asignados
            </span>
        </div>
    );
};