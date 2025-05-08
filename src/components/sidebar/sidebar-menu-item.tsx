"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SidebarDropdown } from "./sidebar-dropdown"
import { useAbility } from "@/contexts/AbilityContext"
import Can from "../permission/can"

interface SidebarMenuItemProps {
    icon: React.ElementType
    title: string
    href?: string
    isCollapsed?: boolean
    children?: React.ReactNode
    isActive?: boolean
}

interface DropdownItem {
    href: string
    icon: React.ElementType
    title: string
    isActive?: boolean
}
interface CanProps {
    action: string
    subject: string
    children: React.ReactElement<SidebarMenuItemProps>
}

export function SidebarMenuItem({ icon: Icon, title, href, isCollapsed, children, isActive }: SidebarMenuItemProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const hasChildren = React.Children.count(children) > 0
    const ability = useAbility()

    const MenuContent = () => (
        <>
            <Icon className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-2")} />
            {!isCollapsed && (
                <>
                    <span className="flex-1 truncate text-left">{title}</span>
                    {hasChildren && (
                        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
                    )}
                </>
            )}
        </>
    )

    const MenuButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>((props, ref) => {
        const content = <MenuContent />

        if (href && !hasChildren) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                ref={ref}
                                variant="ghost"
                                className={cn(
                                    "w-full",
                                    isCollapsed ? "justify-center px-2" : "justify-start text-left",
                                    isActive && "bg-accent text-accent-foreground",
                                )}
                                asChild
                                {...props}
                            >
                                <Link href={href}>{content}</Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                            {title}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        }

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            ref={ref}
                            variant="ghost"
                            className={cn(
                                "w-full",
                                isCollapsed ? "justify-center px-2" : "justify-start text-left",
                                isActive && "bg-accent text-accent-foreground",
                            )}
                            {...props}
                        >
                            {content}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                        {title}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    })
    MenuButton.displayName = "MenuButton"

    const getValidMenuItems = (children: React.ReactNode): DropdownItem[] => {
        return React.Children.toArray(children)
            .filter(React.isValidElement)
            .reduce<DropdownItem[]>((acc, child) => {
                if (React.isValidElement(child)) {
                    // Comprobar si el hijo es un componente Can
                    if (child.type === Can) {
                        const canProps = child.props as CanProps;
                        const { action, subject, children: canChildren } = canProps;
                        // Comprobar permiso usando ability
                        if (ability.can(action, subject)) {
                            // Asegurarse de que el hijo dentro de Can sea un SidebarMenuItem válido
                            if (React.isValidElement(canChildren) && canChildren.type === SidebarMenuItem) {
                                const menuItemProps = canChildren.props as SidebarMenuItemProps;
                                if (menuItemProps.icon && menuItemProps.title) {
                                    acc.push({
                                        href: menuItemProps.href || '#',
                                        icon: menuItemProps.icon,
                                        title: menuItemProps.title,
                                        isActive: menuItemProps.isActive,
                                    });
                                }
                            }
                        }
                    } else if (child.type === SidebarMenuItem) { // Si no es Can, comprobar si es un SidebarMenuItem directamente
                        const menuItemProps = child.props as SidebarMenuItemProps;
                        if (menuItemProps.icon && menuItemProps.title) {
                            acc.push({
                                href: menuItemProps.href || '#',
                                icon: menuItemProps.icon,
                                title: menuItemProps.title,
                                isActive: menuItemProps.isActive,
                            });
                        }
                    }
                }
                return acc;
            }, []);
    };

    if (isCollapsed && hasChildren) {
        const validItems = getValidMenuItems(children);
        
        if (validItems.length === 0) {
            return null;
        }

        return (
            <TooltipProvider>
                <Tooltip>
                    <SidebarDropdown
                        trigger={
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={cn("w-full justify-center px-2", isActive && "bg-accent text-accent-foreground")}
                                >
                                    <Icon className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                        }
                        items={validItems}
                    />
                    <TooltipContent side="right" sideOffset={20}>
                        {title}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    if (hasChildren) {
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <MenuButton />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 pt-1">
                    <div className="flex flex-col space-y-1">{children}</div>
                </CollapsibleContent>
            </Collapsible>
        )
    }

    return <MenuButton />
}