"use client"

import { MoreHorizontal, Pencil, Trash2, FileText } from "lucide-react"
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

interface PaymentActionsDropdownProps {
  payment: Payment
  onEdit: (payment: Payment) => void
  onDelete?: (paymentId: string) => void
  onViewDetails?: (payment: Payment) => void
}

export function PaymentActionsDropdown({ payment, onEdit, onDelete, onViewDetails }: PaymentActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onViewDetails && (
          <DropdownMenuItem onClick={() => onViewDetails(payment)}>
            <FileText className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onEdit(payment)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        {onDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(payment.id.toString())}
            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
