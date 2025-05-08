'use client'
import { createContext, useContext } from 'react';
import { useAbility } from '@/contexts/AbilityContext';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CanProps = {
    action: string;
    subject: string;
    children: React.ReactNode;
    redirectOnFail?: boolean;
};

const Can = ({ action, subject, children, redirectOnFail = false }: CanProps) => {
    const ability = useAbility();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!loading) {
            setIsReady(true);
        }
    }, [loading]);

    if (!isReady || !ability) {
        return null;
    }

    if (!ability.can(action, subject)) {
      if (redirectOnFail) {
        return null;
      }
      return null;
    }

    return <>{children}</>;
};

export default Can;