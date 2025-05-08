"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import "swiper/css"
import "swiper/css/effect-fade"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "sonner"
import api, { setAuthToken } from "@/lib/axios"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { sha256 } from "js-sha256"
import type React from "react" // Added import for React

export default function LoginForm() {
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ isLoading, setIsLoading ] = useState(false)
    const [ showPassword, setShowPassword ] = useState(false)
    const router = useRouter()
    const { setUser } = useAuth()

    const [ darkMode, setDarkMode ] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            const savedTheme = localStorage.getItem("theme")
            return savedTheme === "dark"
        }
        return false
    })

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode
        setDarkMode(newDarkMode)
        if (newDarkMode) {
            document.documentElement.classList.add("dark")
            localStorage.setItem("theme", "dark")
        } else {
            document.documentElement.classList.remove("dark")
            localStorage.setItem("theme", "light")
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Buenos días"
        if (hour < 18) return "Buenas tardes"
        return "Buenas noches"
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const loginResponse = await api.post("/auth/login", { email, password })
            const token = loginResponse.data.access_token

            setAuthToken(token)

            const profileResponse = await api.get("/auth/profile")
            const userProfile = profileResponse.data

            // Store login data in localStorage
            localStorage.setItem("userProfile", JSON.stringify(userProfile))
            localStorage.setItem("passwordHash", sha256(password))

            toast.success("Inicio de sesión exitoso")

            setUser(userProfile)
            window.location.href = "/"
        } catch (error: any) {
            console.error("Login error:", error)

            if (error.response) {
                if (error.response.status === 401) {
                    toast.error("Credenciales incorrectas. Por favor, intente de nuevo.")
                } else {
                    toast.error(`Error del servidor: ${error.response.data.message || "Ocurrió un error desconocido"}`)
                }
            } else if (error.request) {
                toast.error("No se pudo conectar con el servidor. Por favor, verifique su conexión a internet.")
            } else {
                toast.error("Ocurrió un error al intentar iniciar sesión. Por favor, intente de nuevo más tarde.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }, [ darkMode ])

    return (
        <div className="flex min-h-screen">
            <div className="min-h-screen w-full bg-gradient-to-r bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 md:p-8">
                <div className="hidden md:flex absolute top-4 -right-24 w-[160px] text-center text-white">
                    <button
                        onClick={toggleDarkMode}
                        className="mr-4 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-white dark:text-[#ffff] text-[#5E3583] dark:hover:text-[#5E3583]"
                    >
                        {darkMode ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                aria-hidden="true"
                                role="img"
                                className="v-icon notranslate v-theme--dark iconify iconify--mdi"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                style={{ fontSize: "24px", height: "24px", width: "24px" }}
                            >
                                <path
                                    fill="currentColor"
                                    d="M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0-7l2.39 3.42C13.65 5.15 12.84 5 12 5c-.84 0-1.65.15-2.39.42L12 2M3.34 7l4.16-.35A7.2 7.2 0 0 0 5.94 8.5c-.44.74-.69 1.5-.83 2.29L3.34 7m.02 10l1.76-3.77a7.131 7.131 0 0 0 2.38 4.14L3.36 17M20.65 7l-1.77 3.79a7.023 7.023 0 0 0-2.38-4.15l4.15.36m-.01 10l-4.14.36c.59-.51 1.12-1.14 1.54-1.86c.42-.73.69-1.5.83-2.29L20.64 17M12 22l-2.41-3.44c.74.27 1.55.44 2.41.44c.82 0 1.63-.17 2.37-.44L12 22Z"
                                ></path>
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                aria-hidden="true"
                                role="img"
                                className="v-icon notranslate v-theme--light iconify iconify--mdi"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                style={{ fontSize: "24px", height: "24px", width: "24px" }}
                            >
                                <path
                                    fill="currentColor"
                                    d="m17.75 4.09l-2.53 1.94l.91 3.06l-2.63-1.81l-2.63 1.81l.91-3.06l-2.53-1.94L12.44 4l1.06-3l1.06 3l3.19.09m3.5 6.91l-1.64 1.25l.59 1.98l-1.7-1.17l-1.7 1.17l.59-1.98L15.75 11l2.06-.05L18.5 9l.69 1.95l2.06.05m-2.28 4.95c.83-.08 1.72 1.1 1.19 1.85c-.32.45-.66.87-1.08 1.27C15.17 23 8.84 23 4.94 19.07c-3.91-3.9-3.91-10.24 0-14.14c.4-.4.82-.76 1.27-1.08c.75-.53 1.93.36 1.85 1.19c-.27 2.86.69 5.83 2.89 8.02a9.96 9.96 0 0 0 8.02 2.89m-1.64 2.02a12.08 12.08 0 0 1-7.8-3.47c-2.17-2.19-3.33-5-3.49-7.82c-2.81 3.14-2.7 7.96.31 10.98c3.02 3.01 7.84 3.12 10.98.31Z"
                                ></path>
                            </svg>
                        )}
                    </button>
                </div>
                <div className="md:hidden w-full max-w-sm">
                    <div className="w-full max-w-[360px] h-[600px] relative bg-gradient-to-r from-[#5E3583] to-[#8E6AAF] rounded-3xl overflow-hidden">
                        <div className="absolute top-4 right-4 z-50">
                            <button
                                onClick={toggleDarkMode}
                                className="absolute top-4 right-4 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-white text-black dark:hover:text-[#5E3583]"
                            >
                                {darkMode ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                        aria-hidden="true"
                                        role="img"
                                        className="v-icon notranslate v-theme--dark iconify iconify--mdi"
                                        width="1em"
                                        height="1em"
                                        viewBox="0 0 24 24"
                                        style={{ fontSize: "24px", height: "24px", width: "24px" }}
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0-7l2.39 3.42C13.65 5.15 12.84 5 12 5c-.84 0-1.65.15-2.39.42L12 2M3.34 7l4.16-.35A7.2 7.2 0 0 0 5.94 8.5c-.44.74-.69 1.5-.83 2.29L3.34 7m.02 10l1.76-3.77a7.131 7.131 0 0 0 2.38 4.14L3.36 17M20.65 7l-1.77 3.79a7.023 7.023 0 0 0-2.38-4.15l4.15.36m-.01 10l-4.14.36c.59-.51 1.12-1.14 1.54-1.86c.42-.73.69-1.5.83-2.29L20.64 17M12 22l-2.41-3.44c.74.27 1.55.44 2.41.44c.82 0 1.63-.17 2.37-.44L12 22Z"
                                        ></path>
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                        aria-hidden="true"
                                        role="img"
                                        className="v-icon notranslate v-theme--light iconify iconify--mdi"
                                        width="1em"
                                        height="1em"
                                        viewBox="0 0 24 24"
                                        style={{ fontSize: "24px", height: "24px", width: "24px" }}
                                    >
                                        <path
                                            fill="currentColor"
                                            d="m17.75 4.09l-2.53 1.94l.91 3.06l-2.63-1.81l-2.63 1.81l.91-3.06l-2.53-1.94L12.44 4l1.06-3l1.06 3l3.19.09m3.5 6.91l-1.64 1.25l.59 1.98l-1.7-1.17l-1.7 1.17l.59-1.98L15.75 11l2.06-.05L18.5 9l.69 1.95l2.06.05m-2.28 4.95c.83-.08 1.72 1.1 1.19 1.85c-.32.45-.66.87-1.08 1.27C15.17 23 8.84 23 4.94 19.07c-3.91-3.9-3.91-10.24 0-14.14c.4-.4.82-.76 1.27-1.08c.75-.53 1.93.36 1.85 1.19c-.27 2.86.69 5.83 2.89 8.02a9.96 9.96 0 0 0 8.02 2.89m-1.64 2.02a12.08 12.08 0 0 1-7.8-3.47c-2.17-2.19-3.33-5-3.49-7.82c-2.81 3.14-2.7 7.96.31 10.98c3.02 3.01 7.84 3.12 10.98.31Z"
                                        ></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div className="absolute inset-0 z-0">
                            <div className="absolute z-50 h-[520px] w-[520px] bg-white -top-[50px] right-[120px] rotate-45 rounded-[0_72px_0_0]" />

                            <div className="absolute z-50 h-[520px] w-[520px] bg-white dark:bg-gray-800 -top-[50px] right-[120px] rotate-45 rounded-[0_72px_0_0]" />
                            <div className="absolute h-[220px] w-[220px] bg-[#5E3583] -top-[172px] right-0 rotate-45 rounded-[32px]" />
                            <div className="absolute h-[540px] w-[190px] bg-gradient-to-b from-[#5E3583] to-[#8E6AAF] -top-[24px] right-0 rotate-45 rounded-[32px]" />
                            <div className="absolute h-[400px] w-[200px] bg-[#5E3583] top-[420px] right-[50px] rotate-45 rounded-[60px]" />
                        </div>
                        <div className="relative z-10 h-full">
                            <form onSubmit={handleSubmit} className="w-[320px] mx-auto pt-[80px] px-[30px]">
                                <div className="flex justify-between items-center mb-12">
                                    <div>
                                        <h1 className="text-4xl font-semibold text-[#5E3583] dark:text-[#BE9FE1]">Hola!</h1>
                                        <h2 className="text-2xl text-[#5E3583] dark:text-[#BE9FE1]">{getGreeting()}</h2>
                                    </div>
                                </div>
                                <div className="mb-8 relative">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Correo Electrónico o Usuario
                                    </label>
                                    <Input
                                        id="email"
                                        type="text"
                                        placeholder="user@hemmy.com or user123"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Contraseña
                                </label>
                                <div className="mb-8 relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-[#5E3583] text-white hover:bg-[#4A2A6A] dark:bg-[#8E6AAF] dark:text-gray-900 dark:hover:bg-[#BE9FE1]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                                </Button>
                            </form>

                            <div className="absolute bottom-0 right-0 h-[140px] w-[160px] text-center text-white">
                                <div className="absolute bottom-12 right-11">
                                    <div className="flex justify-center items-center bg-white rounded-full w-16 h-16 shadow-lg">
                                        <img src="/logos/logo_grupo_hemmy.jpg" alt="Hemmy logo" className="h-12 w-12 object-contain" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="hidden md:grid w-full border-none max-w-4xl md:grid-cols-2 overflow-hidden shadow-lg">
                    <div className="relative bg-gradient-to-r from-[#5E3583] dark:from-[#8E6AAF] dark:to-[#5E3583] to-[#8E6AAF] p-8 flex flex-col text-white">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute inset-0 bg-[#2A143E] opacity-80" />
                            <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-[#BE9FE1]" />
                            <div className="absolute inset-0 opacity-75">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                                        style={{
                                            top: `${Math.random() * 100}%`,
                                            left: `${Math.random() * 100}%`,
                                            animationDelay: `${Math.random() * 2}s`,
                                        }}
                                    />
                                ))}
                            </div>
                            <div
                                className="absolute w-20 h-0.5 bg-[#BE9FE1] rotate-45 animate-shooting-star"
                                style={{ top: "20%", left: "60%" }}
                            />
                            <div
                                className="absolute w-16 h-0.5 bg-[#BE9FE1] rotate-45 animate-shooting-star"
                                style={{ top: "40%", left: "70%" }}
                            />
                        </div>

                        <div className="flex justify-center items-center">
                            <img src="/logos/grupo_hemmy.jpg" alt="Background" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative mt-auto space-y-2">
    
                            <p className="text-xs text-[#D0BFEA]">
                                Nacimos para innovar
                            </p>
                        </div>
                    </div>

                    <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-2xl font-semibold text-[#5E3583] dark:text-[#BE9FE1]">Hola!</h1>
                                <h2 className="text-xl text-[#5E3583] dark:text-[#BE9FE1]">{getGreeting()}</h2>
                            </div>
                            <img src="/logos/logo_grupo_hemmy.jpg" alt="Hemmy Logo" className="w-14 h-14" />
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium text-[#5E3583] dark:text-[#BE9FE1] text-center">
                                    Inicie sesión en su cuenta
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Correo Electrónico o Usuario
                                        </label>
                                        <Input
                                            id="email"
                                            type="text"
                                            placeholder="user@hemmy.com or user123"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="mt-1 w-full dark:bg-gray-700 dark:text-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Contraseña
                                        </label>
                                        <div className="mb-8 relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="mt-1 w-full dark:bg-gray-700 dark:text-gray-300"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <Link href="#" className="text-sm text-[#5E3583] dark:text-[#BE9FE1] hover:text-[#4A2A6A] dark:hover:text-[#D0BFEA]">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-[#5E3583] text-white hover:bg-[#4A2A6A] dark:bg-[#8E6AAF] dark:text-gray-900 dark:hover:bg-[#BE9FE1]"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                                    </Button>
                                </form>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-[#5E3583] dark:text-[#BE9FE1]">
                                    ¿No tienes una cuenta?{" "}
                                    <Link href="/register" className="text-[#5E3583] font-semibold hover:text-[#4A2A6A] dark:text-[#BE9FE1] dark:hover:text-[#D0BFEA]">
                                        Crear Cuenta
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

