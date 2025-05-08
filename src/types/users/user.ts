export type User = {
    isActive: any;
    id: number;
    name: string;
    surname: string;
    username: string;
    email: string;
    documentType: string;
    documentNumber: string;
    phone: string;
    role: Role;
}

export type Role = {
    id: number;
    name: string;
    description: string;
}