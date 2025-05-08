import React, { createContext, useContext, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import api, { setAuthToken } from "@/lib/axios";
import Cookies from "js-cookie";
import { User } from "@/types/users/user";

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: any;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response.data;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const { data: user, error, isLoading, mutate } = useSWR<User>(
    Cookies.get("grupo_hemmy_auth") ? "/auth/profile" : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const setUser = (newUser: User | null) => {
    mutate(() => newUser as User | undefined, false);
  };

  const logout = async () => {
    Cookies.remove("grupo_hemmy_auth");
    setAuthToken("");
    mutate(undefined, false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        setUser,
        loading: isLoading || loading,
        setLoading,
        error,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};