"use client";

import { Employee } from "@/types/employees/employee";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { User, Phone, Calendar, UserCog } from "lucide-react";

import Link from "next/link";
import { getFullName, formatDni, formatPhone, getRoleIcon, getEmployeeStatusColor, getInitials, getAvatarColor } from "@/utils/employee-utils";

interface EmployeeCardProps {
    employee: Employee;
    onEdit: (employee: Employee) => void;
    onDelete?: (employeeId: string) => void;
}

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
    if (!employee) return null;

    const fullName = getFullName(employee);
    const initials = getInitials(employee);
    const avatarColor = getAvatarColor(fullName);

    const topSectionContent = (
        <div className="flex items-center justify-between mb-4">
            <Link
                href={`/configuration/employees/${employee.id}`}
                className="flex-1 hover:bg-blue-100 rounded-lg transition-colors p-2 -m-2"
            >
                <div className="flex items-center gap-3">
                    <Avatar className={`h-9 w-9 text-sm ${avatarColor} text-white`}>
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-semibold">{fullName}</div>
                        <div className="text-xs text-muted-foreground">
                            DNI: {formatDni(employee.dni)}
                        </div>
                    </div>
                </div>
            </Link>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onEdit(employee)}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                >
                    <UserCog className="h-4 w-4 text-blue-600" />
                </button>
            </div>
        </div>
    );

    const middleSectionContent = (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Rol</div>
                <div className="flex items-center gap-1.5">
                    {employee.role ? (
                        <>
                            <span className="text-lg">{getRoleIcon(employee.role.name)}</span>
                            <Badge
                                variant="secondary"
                                className={getEmployeeStatusColor(employee)}
                            >
                                {employee.role.name}
                            </Badge>
                        </>
                    ) : (
                        <Badge variant="outline">Sin rol</Badge>
                    )}
                </div>
            </div>
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Teléfono</div>
                <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    <span className="text-xs">
                        {employee.phone ? formatPhone(employee.phone) : 'No registrado'}
                    </span>
                </div>
            </div>
        </div>
    );

    const bottomSectionContent = (
        <div className="grid grid-cols-1 gap-y-2 text-sm">
            <div>
                <div className="text-xs text-muted-foreground mb-0.5">Fecha de Registro</div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">
                        {format(new Date(employee.created_at), "dd/MM/yyyy", { locale: es })}
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