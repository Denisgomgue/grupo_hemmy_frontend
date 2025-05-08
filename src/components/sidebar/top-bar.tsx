import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Maximize2, LogOut, Menu, Lock, CircleUser, PartyPopper } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { NotificationsMenu } from "./notifications"
import { ThemeSettings } from "./theme-settings"
import { useTheme } from "@/contexts/ThemeContext"
import { useRouter } from "next/navigation"

interface TopBarProps {
  onMenuToggle: () => void
  sidebarCollapsed: boolean
}

export function TopBar({ onMenuToggle, sidebarCollapsed }: TopBarProps) {
  const { user, logout } = useAuth()
  const { layoutMode } = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleLockScreen = () => {
    document.cookie = "is_locked=true; path=/; max-age=86400"
    router.push("/lock-screen")
  }

  return (
    <div
      className={
        "bg-background shadow-lg" +
        (layoutMode === "detached"
          ? sidebarCollapsed
            ? isMobile
              ? "bg-background shadow-lg mx-4 mt-4 mb-4 rounded-lg ml-2.5"
              : "bg-background shadow-lg mx-4 mt-4 mb-4 rounded-lg md:ml-[6.5rem]"
            : "bg-background shadow-lg mx-4 mt-4 mb-4 rounded-lg md:ml-[16.5rem]"
          : "")
      }
    >
      <div className="flex h-14 items-center px-4">
        <Button variant="ghost" size="icon" onClick={onMenuToggle} className="lg:hidden mr-2">
          <Menu className="h-6 w-6" />
        </Button>

        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            <Maximize2 className="h-5 w-5" />
          </Button>

          <NotificationsMenu />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center space-x-2 h-12 px-2">
                <Avatar className="h-8 w-8">
                  {user && user.name ? (
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                      alt={user.name}
                    />
                  ) : (
                    <AvatarFallback>{user ? user.email.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm font-medium">
                  {user ? `${user.name?.split(" ")[0] || ""} ${user.surname?.split(" ")[0] || ""}`.trim() : "Usuario"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="px-4 py-3 flex items-center space-x-1">
                <p className="text-sm">Bienvenido</p>
                <p className="truncate text-sm font-medium text-primary">{user?.name}</p>
                <PartyPopper className="h-4 w-4 text-muted-foreground"/>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <CircleUser className="mr-2 h-4 w-4" />
                <span>Mi cuenta</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLockScreen}>
                <Lock className="mr-2 h-4 w-4" />
                <span>Bloquear pantalla</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Finalizar la sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeSettings />
        </div>
      </div>
    </div>
  )
}

