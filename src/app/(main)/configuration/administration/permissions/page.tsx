"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GeneralTable } from "@/components/dataTable/table";
import { Permission } from "@/types/permissions/permission";
import { Button } from "@/components/ui/button";
import { FormPermission } from "./_components/form-permission";
import { columns } from "./_components/columns";
import { FaPlus } from "react-icons/fa";
import { usePermissions } from "@/hooks/usePermission";
import api from "@/lib/axios";
import Can from "@/components/permission/can";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { headers } from "./_components/headers";
import { ActionsCell } from "./_components/actions-cell";
import { ResponsiveTable } from "@/components/dataTable/responsive-table";

const PermisosPage: React.FC = () => {
    const { permissions, refreshPermissions } = usePermissions();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPermission, setCurrentPermission] = useState<Permission | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        return permissions.slice(start, end)
    }, [permissions, currentPage, pageSize])

    const handlePaginationChange = (page: number, newPageSize: number) => {
        setCurrentPage(page)
        if (newPageSize !== pageSize) {
            setPageSize(newPageSize)
            setCurrentPage(1)
        }
    }

    const fetchPermissions = async () => {
        setIsLoading(true);
        try {
            await refreshPermissions();
        } catch (error) {
            console.error("Error fetching permissions:", error);
            toast.error("Error al cargar los permisos");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, [refreshPermissions]);

    const createPermission = async (newPermission: Permission) => {
        setLoading(true)
        try {
            await api.post<Permission>("/permissions", newPermission);
            toast.success("Se creo el permiso correctamente");
            await refreshPermissions();
        } catch (error) {
            toast.error("Error al crear el permiso");
            console.error("Error creating permission:", error);
        } finally {
            setLoading(false)
        }
    };

    const handleSave = (permission: Permission) => {
        createPermission(permission);
        setDialogOpen(false);
        setCurrentPermission(null);
    };

    return (
        <Can action="ver-permiso" subject="configuracion-permiso" redirectOnFail={true}>
            <div className="container mx-auto bg-white dark:bg-slate-900 p-4 rounded-md border">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4">
                    <h2 className="text-xl font-bold">Permisos del sistema</h2>
                    <div className="flex md:flex-row flex-col justify-between items-center gap-2">
                        <Can action="crear-permiso" subject="configuracion-permiso">
                            <Button variant="default" onClick={() => setDialogOpen(true)}>
                                <FaPlus /> Agregar Permiso
                            </Button>
                        </Can>
                        <Button
                            variant="outline"
                            onClick={() => fetchPermissions()}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            Recargar Datos
                        </Button>
                    </div>
                </div>
                <ResponsiveTable
                    columns={columns}
                    headers={headers}
                    data={paginatedData}
                    isLoading={isLoading}
                    totalRecords={permissions.length}
                    pageSize={pageSize}
                    onPaginationChange={handlePaginationChange}
                    actions={(row: Permission) => <ActionsCell rowData={row} />}
                />
                {dialogOpen && (
                    <FormPermission
                        open={dialogOpen}
                        permissionEdited={currentPermission}
                        onSave={handleSave}
                        onClose={() => {
                            setDialogOpen(false);
                            setCurrentPermission(null);
                        }}
                        loading={loading}
                    />
                )}
            </div>
        </Can>
    );
};

export default PermisosPage;
