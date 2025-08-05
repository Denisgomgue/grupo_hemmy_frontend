export interface Resource {
    id: number;
    routeCode: string;
    displayName: string;
    description?: string;
    isActive: boolean;
    orderIndex?: number;
    created_at: string;
    updated_at: string;
}

export interface CreateResourceData {
    routeCode: string;
    displayName: string;
    description?: string;
    isActive?: boolean;
    orderIndex?: number;
}

export interface UpdateResourceData extends Partial<CreateResourceData> { } 