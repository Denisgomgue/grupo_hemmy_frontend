"use client";

import { Sector } from "@/types/sectors/sector";

export const headers = [
    {
        key: "name",
        label: "Nombre Sector",
        render: (value: string, item: Sector) => <span className="font-medium">{item.name}</span>,
    },
    {
        key: "description",
        label: "Descripción",
        render: (value: string, item: Sector) => <span>{item.description}</span>,
    },
];