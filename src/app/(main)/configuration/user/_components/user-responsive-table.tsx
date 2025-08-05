"use client";

import { User } from "@/types/users/user";
import { headers } from "./headers";
import { Card, CardContent } from "@/components/ui/card";

interface UserResponsiveTableProps {
    users: User[];
    onEdit: (user: User) => void;
    isLoading?: boolean;
}

export function UserResponsiveTable({ users, onEdit, isLoading = false }: UserResponsiveTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[ ...Array(5) ].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="h-32 bg-gray-200 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron usuarios</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {users.map((user) => {
                const header = headers.find(h => h.key === 'card');
                if (!header || !header.render) return null;

                return (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                            {header.render(user, onEdit)}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
} 