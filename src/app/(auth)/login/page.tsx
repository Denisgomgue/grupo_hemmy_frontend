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
import type React from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useSpring, animated } from "@react-spring/web"
import CircuitBackground from "@/components/ui/CircuitBackground"

const TypewriterInput = ({ value, type, ...props }: { value: string; type: string } & React.InputHTMLAttributes<HTMLInputElement>) => {
    const [ displayValue, setDisplayValue ] = useState("")

    useEffect(() => {
        if (type === "text") {
            let currentIndex = 0
            const interval = setInterval(() => {
                if (currentIndex <= value.length) {
                    setDisplayValue(value.slice(0, currentIndex))
                    currentIndex++
                } else {
                    clearInterval(interval)
                }
            }, 50) // Velocidad de escritura
            return () => clearInterval(interval)
        } else {
            setDisplayValue(value)
        }
    }, [ value, type ])

    return (
        <Input
            {...props}
            type={type}
            value={type === "text" ? displayValue : value}
            className={`${props.className} transition-all duration-300`}
        />
    )
}

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

    const fadeIn: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    }

    const springProps = useSpring({
        from: { transform: 'scale(0.9)', opacity: 0 },
        to: { transform: 'scale(1)', opacity: 1 },
        config: { tension: 280, friction: 20 }
    })

    const buttonVariants: Variants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.02,
            boxShadow: "0 5px 15px rgba(7, 0, 0, 0.3)",
            transition: {
                duration: 0.2,
                ease: "easeInOut"
            }
        },
        tap: {
            scale: 0.98,
            transition: {
                duration: 0.1,
                ease: "easeInOut"
            }
        }
    }

    const inputVariants: Variants = {
        initial: { scale: 1 },
        focus: {
            scale: 1.02,
            transition: {
                duration: 0.2,
                ease: "easeInOut"
            }
        },
        blur: {
            scale: 1,
            transition: {
                duration: 0.2,
                ease: "easeInOut"
            }
        }
    }

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

    // Agregar estos estilos de animación después de las otras definiciones de variantes
    const circuitAnimation = `
    @keyframes electric-flow {
        0% {
            stroke-dashoffset: 1000;
            opacity: 0.4;
        }
        50% {
            opacity: 1;
        }
        100% {
            stroke-dashoffset: 0;
            opacity: 0.4;
        }
    }

    @keyframes node-pulse {
        0%, 100% {
            fill: rgba(255,255,255,0.2);
            r: 4;
        }
        50% {
            fill: rgba(255,255,255,0.8);
            r: 5;
        }
    }

    @keyframes chip-glow {
        0%, 100% {
            stroke: rgba(255,255,255,0.2);
            stroke-width: 1.5;
        }
        50% {
            stroke: rgba(255,255,255,0.6);
            stroke-width: 2;
        }
    }

    .circuit-path {
        stroke-dasharray: 10;
        stroke-dashoffset: 1000;
        animation: electric-flow 3s linear infinite;
    }

    .electric-flow {
        stroke-dasharray: 200;
        stroke-dashoffset: 1000;
        animation: electric-flow 2s linear infinite;
    }

    .circuit-node {
        fill: rgba(255,255,255,0.2);
        animation: node-pulse 2s ease-in-out infinite;
    }

    .chip-component {
        animation: chip-glow 3s ease-in-out infinite;
    }

    .dark .circuit-path {
        stroke: rgba(255,255,255,0.25);
    }

    .dark .electric-flow {
        opacity: 0.8;
    }

    .dark .circuit-node {
        animation: node-pulse 2s ease-in-out infinite;
    }

    .dark .chip-component {
        stroke: rgba(255,255,255,0.3);
    }
    `;

    // Agregar el estilo global después de las otras definiciones
    useEffect(() => {
        // Agregar los estilos de animación al documento
        const style = document.createElement('style');
        style.textContent = circuitAnimation;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="flex min-h-screen">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="absolute top-4 right-4 z-50 rounded-full p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:text-white text-[#ffffff] transition-all duration-300"
            >
                {darkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                )}
            </motion.button>
            <div className="min-h-screen w-full bg-gradient-to-br from-[#5E3583] via-[#4A2A6A] to-[#8E6AAF] dark:from-[#2A1B3D] dark:via-[#5E3583] dark:to-[#3D2953] flex items-center justify-center p-4 md:p-8 transition-all duration-500 relative">
                {/* Fondo de circuito animado */}
                <div className="absolute inset-0 overflow-hidden opacity-30 dark:opacity-40 pointer-events-none">
                    <CircuitBackground />
                </div>

                <AnimatePresence>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        className="relative"
                    >


                        <div className="md:hidden">
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                className="w-full max-w-[360px] h-[600px] relative bg-gradient-to-r from-[#5E3583] to-[#8E6AAF] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm"
                            >
                                <motion.form
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    onSubmit={handleSubmit}
                                    className="w-[320px] mx-auto pt-[80px] px-[30px]"
                                >
                                    <div className="flex justify-between items-center mb-12">
                                        <div>
                                            <motion.h1
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="text-4xl font-semibold text-white"
                                            >
                                                ¡Hola!
                                            </motion.h1>
                                            <motion.h2
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 }}
                                                className="text-2xl text-white/90"
                                            >
                                                {getGreeting()}
                                            </motion.h2>
                                        </div>
                                    </div>

                                    <motion.div
                                        className="space-y-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <motion.div
                                            className="mb-8 relative"
                                            whileHover="hover"
                                            whileFocus="focus"
                                            variants={inputVariants}
                                        >
                                            <label className="block text-sm font-medium text-white/90 mb-2">
                                                Correo Electrónico o Usuario
                                            </label>
                                            <Input
                                                id="email"
                                                type="text"
                                                placeholder="user@hemmy.com or user123"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="transition-all duration-300 focus:ring-2 focus:ring-[#5E3583] dark:focus:ring-[#BE9FE1] bg-white/10 border-white/20 text-white placeholder-white/50"
                                            />
                                        </motion.div>

                                        <motion.div
                                            className="relative"
                                            whileHover="hover"
                                            whileFocus="focus"
                                            variants={inputVariants}
                                        >
                                            <label className="block text-sm font-medium text-white/90 mb-2">
                                                Contraseña
                                            </label>
                                            <TypewriterInput
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="transition-all duration-300 focus:ring-2 focus:ring-[#5E3583] dark:focus:ring-[#BE9FE1] bg-white/10 border-white/20 text-white placeholder-white/50"
                                            />
                                            <motion.button
                                                type="button"
                                                // variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                className="absolute right-2 top-1/2 p-2 rounded-full hover:bg-violet-50 text-violet-700/70 dark:text-white/0 transition-colors duration-300"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                            </motion.button>
                                        </motion.div>

                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            type="submit"
                                            className="w-full bg-white text-[#5E3583] hover:bg-white/90 transition-all duration-300 py-3 px-4 rounded-lg font-medium shadow-lg"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex items-center justify-center"
                                                >
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#5E3583]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Iniciando sesión...
                                                </motion.div>
                                            ) : (
                                                "Iniciar Sesión"
                                            )}
                                        </motion.button>
                                    </motion.div>
                                </motion.form>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
                                >
                                    <img src="/logos/logo_grupo_hemmy.jpg" alt="Hemmy logo" className="h-16 w-16 mx-auto rounded-full shadow-lg" />
                                </motion.div>
                            </motion.div>
                        </div>

                        <animated.div style={springProps} className="hidden md:block">
                            <Card className="w-full border-none max-w-4xl grid md:grid-cols-2 overflow-hidden shadow-2xl backdrop-blur-sm">
                                <div className="relative bg-gradient-to-r from-[#5E3583] to-[#8E6AAF] p-8 flex flex-col text-white overflow-hidden">
                                    <motion.div
                                        className="absolute inset-0"
                                        animate={{
                                            background: [
                                                "linear-gradient(45deg, rgba(94, 53, 131, 0.9) 0%, rgba(142, 106, 175, 0.9) 100%)",
                                                "linear-gradient(45deg, rgba(142, 106, 175, 0.9) 0%, rgba(94, 53, 131, 0.9) 100%)"
                                            ]
                                        }}
                                        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                                    />

                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="relative z-10 flex flex-col items-center justify-center h-full"
                                    >
                                        <img
                                            src="/logos/grupo_hemmy.jpg"
                                            alt="Background"
                                            className="w-64 h-64 object-cover rounded-full shadow-2xl transform hover:scale-105 transition-transform duration-300"
                                        />
                                        <motion.p
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="mt-8 text-xl font-medium text-white"
                                        >
                                            Nacimos para innovar
                                        </motion.p>
                                    </motion.div>
                                </div>

                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg"
                                >
                                    <motion.div
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex justify-between items-center mb-8"
                                    >
                                        <div>
                                            <h1 className="text-2xl font-semibold text-[#5E3583] dark:text-[#BE9FE1]">¡Hola!</h1>
                                            <h2 className="text-xl text-[#5E3583] dark:text-[#BE9FE1]">{getGreeting()}</h2>
                                        </div>
                                        <img src="/logos/logo_grupo_hemmy.jpg" alt="Hemmy Logo" className="w-14 h-14 rounded-full shadow-lg" />
                                    </motion.div>

                                    <motion.form
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <motion.div
                                            className="space-y-4"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Correo Electrónico o Usuario
                                                </label>
                                                <Input
                                                    id="email"
                                                    type="text"
                                                    placeholder="user@hemmy.com or user123"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-[#5E3583] dark:focus:ring-[#BE9FE1]"
                                                />
                                            </div>

                                            <div className="relative">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Contraseña
                                                </label>
                                                <TypewriterInput
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-[#5E3583] dark:focus:ring-[#BE9FE1]"
                                                />
                                                <motion.button
                                                    type="button"
                                                    // variants={buttonVariants}
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    className="absolute right-2 top-1/2 p-2 rounded-full hover:bg-violet-50 text-violet-700/70 dark:text-white/70 transition-colors duration-300"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                                </motion.button>
                                            </div>

                                            <div className="flex justify-end">
                                                <Link
                                                    href="#"
                                                    className="text-sm text-[#5E3583] dark:text-[#BE9FE1] hover:text-[#4A2A6A] dark:hover:text-[#D0BFEA] transition-colors duration-300"
                                                >
                                                    ¿Olvidaste tu contraseña?
                                                </Link>
                                            </div>

                                            <motion.button
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                type="submit"
                                                className="w-full bg-[#5E3583] text-white hover:bg-[#4A2A6A] dark:bg-[#8E6AAF] dark:text-gray-900 dark:hover:bg-[#BE9FE1] transition-all duration-300 py-3 px-4 rounded-lg font-medium shadow-lg"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="flex items-center justify-center"
                                                    >
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Iniciando sesión...
                                                    </motion.div>
                                                ) : (
                                                    "Iniciar Sesión"
                                                )}
                                            </motion.button>
                                        </motion.div>
                                    </motion.form>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="mt-6 text-center"
                                    >
                                        <p className="text-sm text-[#5E3583] dark:text-[#BE9FE1]">
                                            ¿No tienes una cuenta?{" "}
                                            <Link
                                                href="/register"
                                                className="font-semibold hover:text-[#4A2A6A] dark:hover:text-[#D0BFEA] transition-colors duration-300"
                                            >
                                                Crear Cuenta
                                            </Link>
                                        </p>
                                    </motion.div>
                                </motion.div>
                            </Card>
                        </animated.div>
                    </motion.div>
                </AnimatePresence>
            </div>
            <style jsx global>{`
                @keyframes pulse {
                  0%, 100% { opacity: 0.5; }
                  50% { opacity: 1; }
                }
                @keyframes flow {
                  0% { stroke-dashoffset: 1000; }
                  100% { stroke-dashoffset: 0; }
                }
                @keyframes glow {
                  0%, 100% { filter: drop-shadow(0 0 2px #5E3583); }
                  50% { filter: drop-shadow(0 0 8px #7B4397); }
                }
                .circuit-path {
                  stroke-dasharray: 1000;
                  stroke-dashoffset: 1000;
                  animation: flow 20s linear infinite;
                }
                .circuit-node {
                  animation: glow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}

