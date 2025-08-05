import { Permission } from "@/types/permissions/permission"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  getPermissionName, 
  getPermissionRouteCode, 
  getPermissionActions, 
  getPermissionRestrictions, 
  isPermissionSubRoute, 
  getPermissionStatus, 
  getPermissionStatusBadge, 
  getPermissionIcon, 
  getPermissionAvatarColor, 
  getPermissionInitials, 
  getPermissionRolesCount, 
  formatPermissionDate,
  getFormattedRouteCode,
  getActionDescription,
  getRestrictionDescription,
} from "@/utils/permission-utils"
import { Eye, Edit, Trash2, Shield, Route, Calendar } from "lucide-react"

interface PermissionCardProps {
  permission: Permission
  onView: (permission: Permission) => void
  onEdit: (permission: Permission) => void
  onDelete: (permissionId: string) => void
}

export function PermissionCard({ permission, onView, onEdit, onDelete }: PermissionCardProps) {
  const actions = getPermissionActions(permission)
  const restrictions = getPermissionRestrictions(permission)
  const rolesCount = getPermissionRolesCount(permission)
  const isSubRoute = isPermissionSubRoute(permission)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className={`h-10 w-10 ${getPermissionAvatarColor(getPermissionName(permission))}`}>
              <AvatarFallback className="text-white">
                {getPermissionInitials(permission)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{getPermissionName(permission)}</CardTitle>
              <CardDescription className="font-mono text-sm">
                {getPermissionRouteCode(permission)}
              </CardDescription>
            </div>
          </div>
          <Badge variant={getPermissionStatusBadge(permission) as any}>
            {getPermissionStatus(permission)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tipo de ruta */}
        <div className="flex items-center space-x-2">
          <Route className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Tipo:</span>
          <Badge variant={isSubRoute ? "secondary" : "default"}>
            {isSubRoute ? "Subruta" : "Principal"}
          </Badge>
        </div>

        {/* Acciones */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Acciones ({actions.length})</span>
          </div>
          {actions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {actions.slice(0, 4).map((action) => (
                <Badge key={action} variant="secondary" className="text-xs">
                  {action}
                </Badge>
              ))}
              {actions.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{actions.length - 4}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Sin acciones definidas</span>
          )}
        </div>

        {/* Restricciones */}
        {restrictions && restrictions.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Restricciones ({restrictions.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {restrictions.slice(0, 3).map((restriction) => (
                <Badge key={restriction} variant="outline" className="text-xs">
                  {restriction}
                </Badge>
              ))}
              {restrictions.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{restrictions.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Roles asignados */}
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Roles asignados:</span>
          <Badge variant="outline" className="text-xs">
            {rolesCount} {rolesCount === 1 ? 'rol' : 'roles'}
          </Badge>
        </div>

        {/* Fecha de creación */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Creado: {formatPermissionDate(permission.created_at)}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(permission)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(permission)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(permission.id.toString())}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 