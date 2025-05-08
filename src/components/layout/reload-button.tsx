import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';

interface ReloadButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export function ReloadButton({ isLoading, onClick, disabled, ...props }: ReloadButtonProps) {
  return (
    <Button variant="outline" onClick={onClick} disabled={isLoading || disabled} {...props}>
      {isLoading ? 
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : 
        <RefreshCw className="mr-2 h-4 w-4" />} 
      Recargar
    </Button>
  );
} 