"use client";

import { User } from "@/types/users/user";
import { UserCard } from "./user-card";

export const headers = [
    {
        key: 'card',
        label: 'Usuario',
        render: (user: User | undefined, onEdit: (user: User) => void) => {
            if (!user) {
                return null;
            }
            return <UserCard user={user} onEdit={onEdit} />;
        }
    }
]; 