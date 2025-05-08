"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface ThemeContextType {
    layoutMode: string
    setLayoutMode: (mode: string) => void
    colorScheme: string
    setColorScheme: (scheme: string) => void
    sidebarColor: string
    setSidebarColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [layoutMode, setLayoutMode] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("layoutMode") || "default"
        }
        return "default"
    })
    const [colorScheme, setColorScheme] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") || "light"
        }
        return "light"
    })
    const [sidebarColor, setSidebarColor] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("sidebarColor") || "light"
        }
        return "light"
    })

    // Sync layoutMode with localStorage and DOM
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("layoutMode", layoutMode)
            document.documentElement.setAttribute("data-layout", layoutMode)
        }
    }, [layoutMode])

    // Sync colorScheme with localStorage and DOM
    useEffect(() => {
        const root = document.documentElement
        if (colorScheme === "dark") {
            root.classList.add("dark")
            localStorage.setItem("theme", "dark")
        } else {
            root.classList.remove("dark")
            localStorage.setItem("theme", "light")
        }
    }, [colorScheme])

    // Sync sidebarColor with localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("sidebarColor", sidebarColor)
        }
    }, [sidebarColor])

    return (
        <ThemeContext.Provider
            value={{
                layoutMode,
                setLayoutMode,
                colorScheme,
                setColorScheme,
                sidebarColor,
                setSidebarColor,
            }}
        >
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
