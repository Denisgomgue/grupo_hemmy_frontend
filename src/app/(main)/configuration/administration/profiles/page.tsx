"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { columns } from "./_components/columns";
import { FormProfile } from "./_components/form-profile";
import { ProfileDTO, Profile } from "@/types/profiles/profile";
import api from "@/lib/axios";
import { useProfiles } from "@/hooks/useProfile";
import { usePermissions } from "@/hooks/usePermission";
import Can from "@/components/permission/can";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { headers } from "./_components/headers";
import { ActionsCell } from "./_components/actions-cell";
import { ResponsiveTable } from "@/components/dataTable/responsive-table";

const ProfilePage: React.FC = () => {
    const { profiles, refreshProfiles } = useProfiles();
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { permissions, refreshPermissions } = usePermissions();
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        return profiles.slice(start, end)
    }, [profiles, currentPage, pageSize])

    const handlePaginationChange = (page: number, newPageSize: number) => {
        setCurrentPage(page)
        if (newPageSize !== pageSize) {
            setPageSize(newPageSize)
            setCurrentPage(1)
        }
    }

    const fetchProfiles = async () => {
        setIsLoading(true);
        try {
            await refreshProfiles();
        } catch (error) {
            console.error("Error fetching profiles:", error);
            toast.error("Error al cargar los perfiles");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPermissions = async () => {
        setLoading(true);
        await refreshProfiles();
        setLoading(false);
    };

    useEffect(() => {
        fetchPermissions();
        fetchProfiles();
        refreshPermissions();
    }, [refreshProfiles, refreshPermissions]);

    const createProfile = async (newProfile: ProfileDTO) => {
        try {
            setLoading(true);
            await api.post("/roles", newProfile);
            await refreshProfiles();
        } catch (error) {
            console.error("Error creating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = (profile: ProfileDTO) => {
        createProfile(profile);
        setDialogOpen(false);
        setCurrentProfile(null);
    };

    return (
        <Can action="ver-perfil" subject="configuracion-perfil" redirectOnFail={true}>
            <div className="container mx-auto bg-white dark:bg-slate-900 p-4 rounded-md border">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h2 className="text-xl font-bold mb-4 md:mb-0 text-center md:text-3xl md:text-left">Perfiles del sistema</h2>
                    <div className="flex md:flex-row flex-col justify-between items-center gap-2">
                        <Can action="crear-perfil" subject="configuracion-perfil">
                            <Button variant="default" onClick={() => setDialogOpen(true)}>
                                Agregar Perfil
                            </Button>
                        </Can>
                        <Button
                            variant="outline"
                            onClick={() => fetchProfiles()}
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
                    totalRecords={profiles.length}
                    pageSize={pageSize}
                    onPaginationChange={handlePaginationChange}
                    actions={(row: Profile) => <ActionsCell rowData={row} />}
                />
                {dialogOpen && (
                    <FormProfile
                        open={dialogOpen}
                        profileEdited={currentProfile}
                        onSave={handleSave}
                        onClose={() => {
                            setDialogOpen(false);
                            setCurrentProfile(null);
                        }}
                        loading={loading}
                        permissions={permissions}
                    />
                )}
            </div>
        </Can>
    );
};

export default ProfilePage;