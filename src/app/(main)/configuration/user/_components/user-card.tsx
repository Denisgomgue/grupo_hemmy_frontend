"use client";

import { User } from "@/types/users/user";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { User as UserIcon, Mail, Shield, Phone, MapPin, Calendar, CheckCircle, XCircle } from "lucide-react";
import { UserActionsDropdown } from "./user-actions-dropdown";
import { InfoCardShell } from "./info-card-shell";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

// --- Helpers ---

const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
        return <Badge variant="default" className="bg-green-500">Activo</Badge>
    } else {
        return <Badge variant="destructive">Inactivo</Badge>
    }
}

const getRoleBadge = (role?: any) => {
    if (role) {
        return <Badge variant="outline" className="bg-purple-100 text-purple-700">{role.name}</Badge>
    } else {
        return <Badge variant="secondary">Sin rol</Badge>
    }
}

const getVerificationBadge = (emailVerified?: boolean) => {
    if (emailVerified) {
        return <Badge variant="default" className="bg-blue-500">Verificado</Badge>
    } else {
        return <Badge variant="outline">Pendiente</Badge>
    }
}

// Función para generar color basado en el nombre
const getAvatarColor = (name: string): string => {
    const colors = [
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-yellow-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-red-500",
        "bg-teal-500"
    ];

    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[ seed % colors.length ];
};

// --- Definición del Componente Card ---

interface UserCardProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete?: (userId: string) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
    if (!user) return null;

    const fullName = `${user.name || ''} ${user.surname || ''}`.trim() || user.username;
    const initial = fullName ? fullName[ 0 ].toUpperCase() : "?";
    const avatarColor = getAvatarColor(fullName);

    const topSectionContent = (
        <div className="flex items-center justify-between mb-4">
            <Link
                href={`/configuration/user/${user.id}`}
                className="flex-1 hover:bg-purple-100 rounded-lg transition-colors p-2 -m-2"
            >
                <div className="flex items-center gap-3">
                    <Avatar className={`h-9 w-9 text-sm ${avatarColor} text-black`}>
                        <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-semibold">{fullName}</div>
                        <div className="text-xs text-muted-foreground">
                            <UserIcon className="inline h-3 w-3 mr-1" />
                            {user.username}
                        </div>
                    </div>
                </div>
            </Link>
            <UserActionsDropdown user={user} onEdit={onEdit} onDelete={onDelete} />
        </div>
    );

    const middleSectionContent = (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Estado</div>
                <div className="flex items-center gap-1.5">
                    {getStatusBadge(user.isActive)}
                </div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Rol</div>
                <div className="flex items-center gap-1.5">
                    {getRoleBadge(user.role)}
                </div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                <div className="flex items-center gap-1.5 font-medium">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{user.email}</span>
                </div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Verificación</div>
                <div className="flex items-center gap-1.5">
                    {getVerificationBadge(user.emailVerified)}
                </div>
            </div>
        </div>
    );

    const bottomSectionContent = (
        <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Teléfono</div>
                <div className="flex items-center gap-1.5 font-medium">
                    <Phone className="h-3 w-3" />
                    <span>{user.phone || 'N/A'}</span>
                </div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Fecha Creación</div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">
                        {user.created_at
                            ? format(new Date(user.created_at), "dd/MM/yyyy", { locale: es })
                            : 'N/A'
                        }
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <CardContent>
            <InfoCardShell
                topSection={topSectionContent}
                middleSection={middleSectionContent}
                bottomSection={bottomSectionContent}
            />
        </CardContent>
    );
} 