"use client"
import type React from "react"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Send, UsersRound, Home, PhoneOutgoing, FileUser, Users, House, ChevronLeft, ChevronRight, X, Globe, Building2, MapPinHouse, UserRoundSearch, MailSearch, UserPen, Store, BookUser, LaptopMinimalCheck, ReceiptText, FileDiff, ArrowRightLeft, Luggage, BaggageClaim, HandCoins, Receipt, CircleDollarSign, SearchCheck, BookOpen, CreditCard, Wallet, Briefcase, PieChart, FileText, RefreshCcw, Wifi, ClipboardList, User } from "lucide-react"
import { GrUserSettings } from "react-icons/gr"
import { ImProfile } from "react-icons/im"
import Can from "../permission/can"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { SidebarMenuItem } from "./sidebar-menu-item"
import { FaCogs } from "react-icons/fa"
import { useAbility } from "@/contexts/AbilityContext"
import { MdOutlineWarehouse } from "react-icons/md";
import { AiOutlineBlock } from "react-icons/ai";
import { BsBox2, BsBoxes, BsDatabaseAdd } from "react-icons/bs";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
  onCreateBoard?: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobile: boolean
}

export function Sidebar({
  className,
  onClose,
  onCreateBoard,
  isCollapsed,
  onToggleCollapse,
  isMobile,
}: SidebarProps) {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const { layoutMode, sidebarColor, colorScheme } = useTheme()
  const isDetached = layoutMode === "detached"

  const getSidebarColorClass = () => {
    if (sidebarColor.startsWith("#")) {
      return `bg-[${sidebarColor}] text-white`
    }

    switch (sidebarColor) {
      case "light":
        return "bg-background text-gray-900 dark:bg-gray-900 dark:text-gray-100"
      case "dark":
        return "bg-gray-800 text-gray-100 dark:bg-gray-900 dark:text-gray-200"
      case "hemmy":
        return "bg-[#5E3583] text-white"
      default:
        return "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100"
    }
  }


  useEffect(() => {
    if (isMobile && isCollapsed) {
      onToggleCollapse()
    }
  }, [ isMobile, isCollapsed, onToggleCollapse ])

  const ability = useAbility();

  const canViewConfiguration = ability.can('manage', 'Configuration');
  const canViewPeople = ability.can('read', 'People');
  const canViewEnterprise = ability.can('read', 'Enterprise');
  const canViewEmployee = ability.can('read', 'Employee');
  const canViewCustomer = ability.can('read', 'Customer');
  const canViewInventory = ability.can('read', 'Inventory');
  const canViewEntity = ability.can('read', 'Entity');

  const hasAdminItems = [
    canViewConfiguration,
    canViewPeople,
    canViewEnterprise,
    canViewEmployee,
    canViewCustomer,
    canViewInventory,
    canViewEntity
  ].some(Boolean);

  const configPaths = [
    "/configuration/plans",
    "/configuration/services",
    "/configuration/sectors",
    // Agrega aquí más rutas hijas si las tienes
  ];

  const clientPaths = [
    "/configuration/client",
    "/configuration/payment",
    // Agrega aquí más rutas hijas si las tienes
  ];

  // Ejemplo para otros menús padres:
  const inventoryPaths = [
    // "/inventory/items",
    // "/inventory/categories",
    // ...
  ];
  const entityPaths = [
    // "/entity/list",
    // "/entity/details",
    // ...
  ];

  return (
    <div className={cn(
      "flex flex-col h-full transition-colors duration-300",
      isDetached && "rounded-lg",
      getSidebarColorClass(),
      className
    )}>
      <div className={cn("flex flex-col items-center", isCollapsed ? "p-2" : "px-3 py-2")}>
        <Link href="/" className={cn("flex items-center", isCollapsed ? "pb-4" : "py-2 -ml-6")}>
          {!isCollapsed && (
            <>
              {sidebarColor === "hemmy" ? (
                <img src="/logos/hm_logo.png" alt="Logo Hemmy" className="w-32" />
              ) : (
                <>
                  {colorScheme === "dark" ? (
                    <img src="/logos/logo_hemmy_white.jpg" alt="Logo Hemmy" className="w-32" />
                  ) : (
                    // <h1 className="text-2xl font-bold text-[#5E3583]">Grupo Hemmy &copy;</h1>
                    <img src="/logos/hm_logo.png" alt="Logo Hemmy" className="w-32" />
                  )}
                </>
              )}
            </>
          )}
          {isCollapsed && (
            <>
              {sidebarColor === "hemmy" ? (
                <img src="/logos/hm_logo.png" alt="" className="w-[2.20rem]" />
              ) : colorScheme === "dark" ? (
                <img src="/logos/hm_logo.png" alt="" className="w-[2.20rem]" />
              ) : (
                <img src="/logos/hm_logo.png" alt="" className="w-[2.20rem]" />
              )}
            </>
          )}
        </Link>
        {!isMobile && isCollapsed && (
          <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="w-10 h-10">
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {!isMobile && !isCollapsed && (
          <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="absolute right-2 top-6">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-4">
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          <div className="px-3 py-2">
            {!isCollapsed && (
              <h2 className="mb-2 px-2 text-xs font-bold tracking-tight uppercase">Home</h2>
            )}
            <div className={cn("space-y-1", isCollapsed && "flex flex-col items-center")}>
              <SidebarMenuItem
                key="inicio"
                href="/"
                icon={Home}
                title="Inicio"
                isCollapsed={isCollapsed}
                isActive={pathname === "/"}
              />
              {!isCollapsed && hasAdminItems && (
                <h2 className="mb-2 px-2 text-xs font-bold tracking-tight uppercase">Administración</h2>
              )}

              <Can action="read" subject="Customer">
                <SidebarMenuItem
                  key="administration"
                  icon={User}
                  title="Clientes"
                  isCollapsed={isCollapsed}
                  isActive={clientPaths.includes(pathname)}
                >
                  <Can action="read" subject="Client">
                    <SidebarMenuItem
                      key="client"
                      href="/configuration/client"
                      icon={UserRoundSearch}
                      title="Clientes"
                      isCollapsed={isCollapsed}
                      isActive={pathname === "/configuration/client"}
                    />
                  </Can>
                  <Can action="read" subject="Payment">
                    <SidebarMenuItem
                      key="payments"
                      href="/configuration/payment"
                      icon={CreditCard}
                      title="Pagos"
                      isCollapsed={isCollapsed}
                      isActive={pathname === "/configuration/payment"}
                    />
                  </Can>
                </SidebarMenuItem>
              </Can>
              <Can action="read" subject="Configuration">
                <SidebarMenuItem
                  key="configurartion"
                  icon={Wallet}
                  title="Configuración"
                  isCollapsed={isCollapsed}
                  isActive={configPaths.includes(pathname)}
                >
                  <Can action="read" subject="Plan">
                    <SidebarMenuItem
                      key="plans"
                      href="/configuration/plans"
                      icon={ClipboardList}
                      title="Planes"
                      isCollapsed={isCollapsed}
                      isActive={pathname === "/configuration/plans"}
                    />
                  </Can>
                  <Can action="read" subject="Service">
                    <SidebarMenuItem
                      key="services"
                      href="/configuration/services"
                      icon={Wifi}
                      title="Servicios"
                      isCollapsed={isCollapsed}
                      isActive={pathname === "/configuration/services"}
                    />
                  </Can>
                  <Can action="read" subject="Sector">
                    <SidebarMenuItem
                      key="sectors"
                      href="/configuration/sectors"
                      icon={MapPinHouse}
                      title="Sectores"
                      isCollapsed={isCollapsed}
                      isActive={pathname === "/configuration/sectors"}
                    />
                  </Can>
                </SidebarMenuItem>
              </Can>
            </div>
          </div>
        </div>
      </div >
    </div >
  )
}
console.log("Sidebar")
export default Sidebar;