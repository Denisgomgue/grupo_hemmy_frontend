export interface Permission {
    id: number;
    name: string;
    routeCode: string;
    actions: string[];
    restrictions: string[];
    isSubRoute: boolean;
    createdAt?: string;
    updatedAt?: string;
}
