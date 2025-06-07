import { AccountStatusEnum } from "@/schemas/client-schema";

export const accountStatusLabels: Record<string, string> = {
    [ AccountStatusEnum.enum.ACTIVE ]: "Activo",
    [ AccountStatusEnum.enum.SUSPENDED ]: "Suspendido",
    [ AccountStatusEnum.enum.INACTIVE ]: "Inactivo",
}

export function getAccountStatusLabel(status: string): string {
    return accountStatusLabels[ status ] || "Desconocido"
} 