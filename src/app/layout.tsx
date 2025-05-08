'use client'
import { ThemeProvider } from "@/providers/theme-provider"
import "./globals.css"
import { Nunito } from 'next/font/google'
import { Toaster } from "sonner"
import { ThemeProvider as Theme } from "@/contexts/ThemeContext"
import { AuthProvider } from "@/contexts/AuthContext"

const nunito = Nunito({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <title>GRUPO HEMMY</title>
      <body className={nunito.className}>
        <AuthProvider>
          <Theme>
            <Toaster
              expand
              richColors
              position="top-right"
              duration={3000}
            />
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </Theme>
        </AuthProvider>
      </body>
    </html>
  )
}