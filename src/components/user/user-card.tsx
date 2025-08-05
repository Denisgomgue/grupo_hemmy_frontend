"use client"

import { User } from "@/types/users/user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal, Edit, Trash2, Eye, Mail, Phone, User as UserIcon, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatFullName, formatDocument, getUserStatus, getRoleStatus, formatDate, getUserAvatar, getAvatarColor } from "@/utils/user-utils"

interface UserCardProps {
  user: User
  onView?: (user: User) => void
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
}

export function UserCard({ user, onView, onEdit, onDelete }: UserCardProps) {
  const fullName = formatFullName(user)
  const document = formatDocument(user)
  const status = getUserStatus(user)
  const roleStatus = getRoleStatus(user)
  const avatar = getUserAvatar(user)
  const avatarColor = getAvatarColor(user)

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className={`h-12 w-12 ${avatarColor} text-white`}>
              <AvatarFallback className="text-sm font-medium">
                {avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{fullName}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onView && (
                <DropdownMenuItem onClick={() => onView(user)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{user.email}</span>
        </div>
        
        {user.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user.phone}</span>
          </div>
        )}
        
        {document !== "Sin documento" && (
          <div className="flex items-center space-x-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{document}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Creado: {formatDate(user.created_at)}</span>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            <Badge variant={status.variant}>
              {status.label}
            </Badge>
            <Badge variant={roleStatus.variant}>
              {roleStatus.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 