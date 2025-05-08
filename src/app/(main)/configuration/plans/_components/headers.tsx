"use client";

import { Plan } from "@/types/plans/plan";

export const headers = [
    {
        key: "name",
        label: "Nombre Plan",
        render: (value: string, item: Plan) => <span className="font-medium">{item.name}</span>,
    },
    {
        key: "service",
        label: "Servicio",
        render: (value: any, item: Plan) => <span className="font-medium">{item.service?.name || 'N/A'}</span>,
    },
    {
        key: "speed",
        label: "Velocidad (Mbps)",
        render: (value: number, item: Plan) => <span>{item.speed}</span>,
    },
    {
        key: "price",
        label: "Precio",
        render: (value: number, item: Plan) => <span>{item.price?.toFixed(2) ?? '0.00'}</span>,
    },
    {
        key: "description",
        label: "Descripción",
        render: (value: string, item: Plan) => <span>{item.description || 'N/A'}</span>,
    },
];