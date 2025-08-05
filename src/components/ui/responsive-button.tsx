"use client";

import { Button } from "@/components/ui/button";
import { useDeviceType } from "@/hooks/use-mobile";
import { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResponsiveButtonProps extends ButtonProps {
    mobileFullWidth?: boolean;
    tabletFullWidth?: boolean;
    className?: string;
}

export function ResponsiveButton({
    children,
    mobileFullWidth = true,
    tabletFullWidth = true,
    className,
    ...props
}: ResponsiveButtonProps) {
    const deviceType = useDeviceType();

    const getResponsiveClasses = () => {
        if (deviceType === 'mobile' && mobileFullWidth) {
            return 'w-full';
        }
        if (deviceType === 'tablet' && tabletFullWidth) {
            return 'w-full';
        }
        return 'w-auto';
    };

    return (
        <Button
            className={cn(getResponsiveClasses(), className)}
            {...props}
        >
            {children}
        </Button>
    );
} 