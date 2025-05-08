"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const [position, setPosition] = React.useState<{ x: number | null; y: number | null }>({ x: null, y: null })
  const [isDragging, setIsDragging] = React.useState(false)
  const dragRef = React.useRef<{ x: number; y: number } | null>(null)
  const dialogRef = React.useRef<HTMLDivElement>(null)

  const centerDialog = React.useCallback(() => {
    if (dialogRef.current) {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const dialogRect = dialogRef.current.getBoundingClientRect()

      const centerX = (viewportWidth - dialogRect.width) / 2
      const centerY = (viewportHeight - dialogRect.height) / 2

      setPosition({ x: centerX, y: centerY })
    }
  }, [])

  React.useEffect(() => {
    centerDialog()
    window.addEventListener("resize", centerDialog)

    return () => {
      window.removeEventListener("resize", centerDialog)
    }
  }, [centerDialog])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".dialog-handle")) {
      setIsDragging(true)
      if (position.x !== null && position.y !== null) {
        dragRef.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        }
      }
    }
  }

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (isDragging && dragRef.current && dialogRef.current) {
        const dialogRect = dialogRef.current.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let newX = e.clientX - dragRef.current.x
        let newY = e.clientY - dragRef.current.y

        newX = Math.max(0, Math.min(newX, viewportWidth - dialogRect.width))

        newY = Math.max(0, Math.min(newY, viewportHeight - dialogRect.height))

        setPosition({ x: newX, y: newY })
      }
    },
    [isDragging],
  )

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false)
    dragRef.current = null
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <DialogPortal>
      <DialogOverlay className={cn(isDragging && "pointer-events-none")} />
      <DialogPrimitive.Content
        ref={(node) => {
          if (typeof ref === "function") {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
          dialogRef.current = node
        }}
        onMouseDown={handleMouseDown}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          centerDialog()
        }}
        style={{
          transform:
            position.x !== null && position.y !== null
              ? `translate3d(${position.x}px, ${position.y}px, 0)`
              : "translate3d(-50%, -50%, 0)",
          transition: isDragging ? "none" : "transform 0.2s ease-in-out",
          margin: 0,
          position: "fixed",
          top: position.y === null ? "50%" : 0,
          left: position.x === null ? "50%" : 0,
        }}
        className={cn(
          "z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          isDragging && "cursor-grabbing",
          className,
        )}
        {...props}
      >
        <div className="dialog-handle cursor-grab active:cursor-grabbing absolute top-0 left-0 right-0 h-6" />
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={centerDialog}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}