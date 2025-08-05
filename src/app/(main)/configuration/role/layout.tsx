import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Permisos Granular - Grupo Hemmy",
    description: "Sistema de permisos granular por módulo y componente",
};

export default function PermissionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
} 