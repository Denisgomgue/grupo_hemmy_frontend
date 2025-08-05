"use client";

import { Role } from "@/types/roles/role";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Shield, Users, Settings, Eye, EyeOff, Calendar, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import {
    getRoleName,
    getRoleDescription,
    getRoleStatus,
    getRoleStatusColor,
    getRoleStatusBadge,
    getRoleIcon,
    getRoleInitials,
    getRoleAvatarColor,
    getRolePermissionsCount,
    getRoleEmployeesCount,
    formatRoleDate
} from "@/utils/role-utils";

interface RoleCardProps {
    role: Role;
    onEdit: (role: Role) => void;
    onDelete?: (roleId: string) => void;
}

export function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
    if (!role) return null;

    const roleName = getRoleName(role);
    const initials = getRoleInitials(role);
    const avatarColor = getRoleAvatarColor(roleName);

    const topSectionContent = (
        <div className="flex items-center justify-between mb-4">
            <Link
                href={`/configuration/role/${role.id}`}
                className="flex-1 hover:bg-purple-100 rounded-lg transition-colors p-2 -m-2"
            >
                <div className="flex items-center gap-3">
                    <Avatar className={`h-9 w-9 text-sm ${avatarColor} text-white`}>
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-semibold">{roleName}</div>
                        <div className="text-xs text-muted-foreground">
                            {getRoleDescription(role)}
                        </div>
                    </div>
                </div>
            </Link>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onEdit(role)}
                    className="p-1 hover:bg-purple-100 rounded transition-colors"
                >
                    <SettingsIcon className="h-4 w-4 text-purple-600" />
                </button>
            </div>
        </div>
    );

    const middleSectionContent = (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Estado</div>
                <div className="flex items-center gap-1.5">
                    <span className="text-lg">{getRoleIcon(role.name)}</span>
                    <Badge
                        variant={getRoleStatusBadge(role) as any}
                        className={getRoleStatusColor(role)}
                    >
                        {getRoleStatus(role)}
                    </Badge>
                </div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Visibilidad</div>
                <div className="flex items-center gap-1.5">
                    {role.isPublic ? (
                        <Eye className="h-3 w-3 text-green-600" />
                    ) : (
                        <EyeOff className="h-3 w-3 text-gray-600" />
                    )}
                    <span className="text-xs">
                        {role.isPublic ? "Público" : "Privado"}
                    </span>
                </div>
            </div>
        </div>
    );

    const bottomSectionContent = (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Permisos</div>
                <div className="flex items-center gap-1.5">
                    <Settings className="h-3 w-3" />
                    <span className="text-xs">
                        {getRolePermissionsCount(role)} permisos
                    </span>
                </div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Empleados</div>
                <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">
                        {getRoleEmployeesCount(role)} empleados
                    </span>
                </div>
            </div>
            <div className="col-span-2">
                <div className="text-xs text-muted-foreground mb-0.5">Fecha de Creación</div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">
                        {formatRoleDate(role.created_at)}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-card text-card-foreground">
            {topSectionContent}
            {middleSectionContent}
            {bottomSectionContent && (
                <div className="border-t pt-3 mt-4">
                    {bottomSectionContent}
                </div>
            )}
        </div>
    );
} 