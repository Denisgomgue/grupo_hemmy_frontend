import { PermissionForm as PermissionFormSchema } from "@/schemas/permission-schema"
import { CreatePermissionData, UpdatePermissionData } from "@/types/permissions/permission"

interface PermissionFormProps {
    initialData?: CreatePermissionData | UpdatePermissionData
    onSubmit: (data: any) => void
    isLoading?: boolean
}

export function PermissionForm({ initialData, onSubmit, isLoading = false }: PermissionFormProps) {
    return (
        <PermissionFormSchema
            initialData={initialData}
            onSubmit={onSubmit}
            isLoading={isLoading}
        />
    )
} 