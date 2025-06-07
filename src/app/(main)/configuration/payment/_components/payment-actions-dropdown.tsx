"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Payment } from "@/types/payments/payment"
import { useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface PaymentActionsDropdownProps {
  payment: Payment
  onEdit: (payment: Payment) => void
  onDelete?: (paymentId: string) => void
}

export function PaymentActionsDropdown({ payment, onEdit, onDelete }: PaymentActionsDropdownProps) {
  const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState(false)
  const [ isDropdownOpen, setIsDropdownOpen ] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDropdownOpen(false)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(payment.id.toString())
    }
    setIsDeleteDialogOpen(false)
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(payment)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          {onDelete && (
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar Pago"
        description={`¿Estás seguro que deseas eliminar el pago ${payment.code || payment.id}? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="No, cancelar"
      />
    </>
  )
}
