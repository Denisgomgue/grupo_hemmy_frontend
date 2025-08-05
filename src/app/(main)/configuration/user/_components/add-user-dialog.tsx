"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User } from "@/types/users/user"
import { UserForm } from "./user-form"

interface AddUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: any) => void
    user?: User | null
    isLoading?: boolean
    mode?: "add" | "edit"
}

export function AddUserDialog({ open, onOpenChange, onSubmit, user, isLoading = false, mode = "add" }: AddUserDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{mode === "edit" ? "Editar Usuario" : "Agregar Usuario"}</DialogTitle>
                </DialogHeader>
                <UserForm user={user} onSubmit={onSubmit} isLoading={isLoading} onCancel={() => onOpenChange(false)} isEdit={mode === "edit"} />
            </DialogContent>
        </Dialog>
    )
} 