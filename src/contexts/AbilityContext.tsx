"use client";

import { AppAbility } from "@/lib/abilities";
import { createContext, useContext } from "react";

export const AbilityContext = createContext<AppAbility | null>(null);

export const useAbility = (): AppAbility => {
    const ability = useContext(AbilityContext);
    if (!ability) {
        throw new Error("useAbility debe ser usado dentro de AbilityContext.Provider");
    }
    return ability;
};
