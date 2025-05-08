import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { Profile } from "@/types/profiles/profile";

let profileList: Profile[] = [];
let listeners: Array<() => void> = [];

const notifyListeners = () => {
    listeners.forEach((listener) => listener());
};

export function useProfiles() {
    const [profiles, setProfiles] = useState<Profile[]>(profileList);

    const refreshProfiles = useCallback(async (page: number = 1, pageSize: number = 10) => {
        try {
            const response = await api.get<Profile[]>("/roles", {
                params: {
                    page,
                    pageSize
                }
            })
            profileList = response.data
            notifyListeners()
            return { data: profileList, total: profileList.length }
        } catch (error) {
            console.error("Error fetching profiles:", error);
            return { data: [], total: 0 }
        }
    }, []);

    useEffect(() => {
        const listener = () => setProfiles([...profileList]);
        listeners.push(listener);

        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    }, []);

    return { profiles, refreshProfiles };
}