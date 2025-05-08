import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { User } from "@/types/users/user";

let userList: User[] = [];
let listeners: Array<() => void> = [];

const notifyListeners = () => {
    listeners.forEach((listener) => listener());
};

export function useUsers() {
    const [users, setUsers] = useState<User[]>(userList);

    const refreshUsers = useCallback(async (page: number = 1, pageSize: number = 10) => {
        try {
            const response = await api.get<User[]>('/user', {
                params: {
                    page,
                    pageSize
                }
            })
            userList = response.data
            notifyListeners()
            return { data: userList, total: userList.length }
        } catch (error) {
            console.error("Error fetching users:", error);
            return { data: [], total: 0 }
        }
    }, []);

    useEffect(() => {
        const listener = () => setUsers([...userList]);
        listeners.push(listener);

        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    }, []);

    return { users, refreshUsers };
}