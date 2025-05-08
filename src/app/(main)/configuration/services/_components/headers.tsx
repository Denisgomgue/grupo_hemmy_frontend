"use client";

import { Service, ServiceStatus } from "@/types/services/service";
import { Badge } from "@/components/ui/badge";

export const headers = [
    {
        key: "name",
        label: "Nombre",
        render: (value: string, item: Service) => <span className="font-medium">{item.name}</span>,
    },
    {
        key: "description",
        label: "Descripción",
        render: (value: string, item: Service) => <span>{item.description || 'N/A'}</span>,
    },
    {
        key: "status",
        label: "Estado",
        render: (value: ServiceStatus, item: Service) => (
            <Badge variant={item.status === ServiceStatus.ACTIVE ? "success" : "destructive"}>
                {item.status}
            </Badge>
        ),
    },
];