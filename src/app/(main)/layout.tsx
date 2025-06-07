import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Providers from "@/components/providers"
import { ClientLayoutWrapper } from "./client-layout-wrapper"

const inter = Inter({ subsets: [ "latin" ] })

export const metadata: Metadata = {
    title: "Grupo Hemmy",
    description: "Pagina aministrativa de Grupo Hemmy",
}

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Providers>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </Providers>
    )
}