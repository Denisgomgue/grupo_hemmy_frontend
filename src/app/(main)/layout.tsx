import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Providers from "@/components/providers"
import { ClientLayoutWrapper } from "./client-layout-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "App Principal",
    description: "Descripción de la app",
}

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <Providers>
                    <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
                </Providers>
            </body>
        </html>
    )
}