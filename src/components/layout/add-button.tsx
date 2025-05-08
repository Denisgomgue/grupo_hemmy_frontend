import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';

interface AddButtonProps extends ButtonProps {
  text?: string;
}

export function AddButton({ text = "Agregar", onClick, disabled, ...props }: AddButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} {...props}>
      <PlusCircle className="mr-2 h-4 w-4" /> {text}
    </Button>
  );
} 