"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterTabsProps {
    value: string;
    onValueChange: (value: string) => void;
    options: {
        value: string;
        label: string;
        description?: string;
    }[];
    className?: string;
}

export function FilterTabs({
    value,
    onValueChange,
    options,
    className
}: FilterTabsProps) {
    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {options.map((option) => (
                <Button
                    key={option.value}
                    variant={value === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onValueChange(option.value)}
                    className={cn(
                        "transition-all duration-200",
                        value === option.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted"
                    )}
                >
                    {option.label}
                </Button>
            ))}
        </div>
    );
} 