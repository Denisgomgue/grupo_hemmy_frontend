"use client";

import { Client } from "@/types/clients/client";
import { ClientCard } from "./client-card";

export const headers = [
    {
        key: 'card',
        label: 'Cliente',
        render: (client: Client | undefined, onEdit: (client: Client) => void) => {
            if (!client) {
                return null;
            }
            return <ClientCard client={client} onEdit={onEdit} />;
        }
    }
];