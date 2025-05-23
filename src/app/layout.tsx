'use client'
import { ThemeProvider } from "@/providers/theme-provider"
import "./globals.css"
import { Nunito } from 'next/font/google'
import { Toaster } from "sonner"
import { ThemeProvider as Theme } from "@/contexts/ThemeContext"
import { AuthProvider } from "@/contexts/AuthContext"

const nunito = Nunito({ subsets: [ "latin" ] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>GRUPO HEMMY</title>
      </head>
      <body className={nunito.className}>
        <Theme>
          <AuthProvider>
            <Toaster richColors position="top-right" />
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </AuthProvider>
        </Theme>
      </body>
    </html>
  )
}