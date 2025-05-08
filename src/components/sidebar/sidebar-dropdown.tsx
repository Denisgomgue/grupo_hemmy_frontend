"use client"

import type * as React from "react"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface DropdownItem {
    href: string
    icon: React.ElementType
    title: string
    isActive?: boolean
}

interface SidebarDropdownProps {
    trigger: React.ReactNode
    items: DropdownItem[]
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function SidebarDropdown({ trigger, items, open, onOpenChange }: SidebarDropdownProps) {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent
                side="right"
                sideOffset={20}
                className="w-64 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-md z-50"
                align="start"
                forceMount
            >
                <div className="flex flex-col space-y-1">
                    {items.map((item, index) => {
                        if (!item || !item.title) return null
                        const Icon = item.icon

                        return (
                            <TooltipProvider key={`${item.title}-${index}`}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            asChild
                                            className={cn(
                                                "w-full justify-start hover:bg-[#5E3583]",
                                                item.isActive && "bg-[#5E3583] text-accent-foreground",
                                            )}
                                        >
                                            <Link href={item.href} className="flex items-center w-full px-2 py-1.5">
                                                {Icon && <Icon className="mr-2 h-4 w-4 shrink-0" />}
                                                <span className="flex-1 truncate">{item.title}</span>
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={10}>
                                        {item.title}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}