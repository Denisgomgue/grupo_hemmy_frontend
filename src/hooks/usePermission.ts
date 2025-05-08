import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { Permission } from "@/types/permissions/permission";

let permissionList: Permission[] = [];
let listeners: Array<() => void> = [];

const notifyListeners = () => {
    listeners.forEach((listener) => listener());
};

export function usePermissions() {
    const [permissions, setPermissions] = useState<Permission[]>(permissionList);

    const refreshPermissions = useCallback(async (page: number = 1, pageSize: number = 10) => {
        try {
            const response = await api.get<Permission[]>("/permissions", {
                params: {
                    page,
                    pageSize
                }
            })
            permissionList = response.data
            notifyListeners()
            return { data: permissionList, total: permissionList.length }
        } catch (error) {
            console.error("Error fetching permissions:", error);
            return { data: [], total: 0 }
        }
    }, []);

    useEffect(() => {
        const listener = () => setPermissions([...permissionList]);
        listeners.push(listener);

        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    }, []);

    return { permissions, refreshPermissions };
}