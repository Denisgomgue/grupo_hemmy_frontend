"use client"

import * as React from "react"
import { DialogContent, DialogContentProps } from "./dialog"
import { cn } from "@/lib/utils"

interface ModalContentProps extends DialogContentProps {
    maxHeight?: string
    showScrollbar?: boolean
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"
    children?: React.ReactNode
    onInteractOutside?: (e: any) => void
}

const ModalContent = React.forwardRef<
    React.ElementRef<typeof DialogContent>,
    ModalContentProps
>(({
    className,
    children,
    maxHeight = "90vh",
    showScrollbar = true,
    size = "lg",
    ...props
}, ref) => {
    const sizeClasses = {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
        "3xl": "sm:max-w-3xl",
        "4xl": "sm:max-w-4xl",
        "5xl": "sm:max-w-5xl",
        "6xl": "sm:max-w-6xl",
        "7xl": "sm:max-w-7xl"
    }

    return (
        <DialogContent
            ref={ref}
            className={cn(
                "flex flex-col",
                sizeClasses[ size ],
                `max-h-[${maxHeight}]`,
                className
            )}
            {...props}
        >
            {children}
        </DialogContent>
    )
})

ModalContent.displayName = "ModalContent"

interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
    showScrollbar?: boolean
    padding?: "none" | "sm" | "md" | "lg"
}

const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
    ({ className, showScrollbar = true, padding = "md", children, ...props }, ref) => {
        const paddingClasses = {
            none: "",
            sm: "p-2",
            md: "p-4",
            lg: "p-6"
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "flex-1 overflow-y-auto",
                    paddingClasses[ padding ],
                    showScrollbar ? "pr-2" : "scrollbar-hide",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

ModalBody.displayName = "ModalBody"

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    padding?: "none" | "sm" | "md" | "lg"
    border?: boolean
}

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
    ({ className, padding = "md", border = false, children, ...props }, ref) => {
        const paddingClasses = {
            none: "",
            sm: "p-2",
            md: "p-4",
            lg: "p-6"
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "flex-shrink-0",
                    paddingClasses[ padding ],
                    border && "border-b",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

ModalHeader.displayName = "ModalHeader"

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    padding?: "none" | "sm" | "md" | "lg"
    border?: boolean
}

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
    ({ className, padding = "md", border = false, children, ...props }, ref) => {
        const paddingClasses = {
            none: "",
            sm: "p-2",
            md: "p-4",
            lg: "p-6"
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "flex-shrink-0",
                    paddingClasses[ padding ],
                    border && "border-t",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

ModalFooter.displayName = "ModalFooter"

export { ModalContent, ModalBody, ModalHeader, ModalFooter } 