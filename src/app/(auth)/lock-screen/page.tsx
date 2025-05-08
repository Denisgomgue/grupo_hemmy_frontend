"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import ParticlesComponent from "@/components/Particles/Particles"
import { sha256 } from "js-sha256"
import "./css/glow-effect.css"

export default function LockScreenPage() {
  const { user, logout } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile")
    if (!storedUser) {
      router.push("/login")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const savedPasswordHash = localStorage.getItem("passwordHash")

    if (sha256(password) === savedPasswordHash) {
      setErrorMessage("")
      document.cookie = "is_locked=false; path=/; max-age=86400"
      window.location.href = ("/")
    } else {
      setErrorMessage("La contraseña es incorrecta.")
    }
  }

  const removeCookies = () => {
    document.cookie = "is_locked=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  const handleLogout = () => {
    removeCookies()
    localStorage.removeItem("userProfile")
    localStorage.removeItem("passwordHash")
    logout()
    router.push("/login")
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParticlesComponent />

      <Card className="relative z-10 w-full max-w-lg mx-4 shadow-lg bg-white dark:bg-gray-950 backdrop-blur-md glow-border">
        <CardContent className="pt-8 px-8">
          <div className="flex flex-col items-center mb-8">
            <Avatar className="w-32 h-32 mb-4">
              {user && user.name ? (
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} />
              ) : (
                <AvatarFallback>{user ? user.email.charAt(0).toUpperCase() : "U"}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex justify-center items-center text-center">
              <h1 className="text-xl font-semibold mb-2">
                ¡Hola de nuevo,{" "}
                <span className="text-2xl font-bold text-[#52c3bd]">
                  {user ? `${user.name || ""} ${user.surname || ""}`.trim() : "Usuario"}
                </span>
                !
              </h1>
            </div>
            <p className="text-gray-500 text-center dark:text-gray-200">Ingresa tu contraseña para desbloquear.</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{errorMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-base font-medium text-gray-700 dark:text-gray-200">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="pr-10 border dark:border-gray-500 dark:placeholder:text-gray-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#49afaa] hover:bg-[#74cfca] text-white">
              Desbloquear
            </Button>
          </form>

          <div className="mt-6 flex justify-between">
            <Button onClick={handleLogout} variant="outline" className="w-[48%]">
              Ir al Inicio de Sesión
            </Button>
            <Button onClick={handleLogout} variant="outline" className="w-[48%]">
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>

      <footer className="absolute bottom-4 z-10 text-center text-gray-700 dark:text-white text-sm w-full">
        2025 © Grupo Hemmy
      </footer>
    </div>
  )
}

