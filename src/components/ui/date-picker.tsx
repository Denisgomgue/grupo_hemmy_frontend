"use client";

import { es } from "date-fns/locale";
import { format } from "date-fns";
import { useState, forwardRef, useImperativeHandle } from "react";
import { CalendarIcon } from 'lucide-react';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  placeholder?: string;
  onSelectedChange?: (date?: Date) => void;
  disabled?: boolean;
  className?: string;
  initialValue?: Date;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export const DatePicker = forwardRef<{ setValue: (date?: Date) => void }, DatePickerProps>(({
  placeholder = "Selecciona una fecha",
  onSelectedChange,
  disabled,
  className,
  initialValue,
  isOpen,
  setIsOpen,
}, ref) => {
  const [value, setValue] = useState<Date | undefined>(initialValue);

  useImperativeHandle(ref, () => ({
    setValue: (date?: Date) => {
      setValue(date);
      onSelectedChange?.(date);
    }
  }));

  const onSelect = (date?: Date) => {
    setValue(date);
    onSelectedChange?.(date);
    setIsOpen?.(false);
  };

  return (
    <Popover modal={true} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          disabled={disabled}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP", { locale: es }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-lg shadow-lg z-50"
        align="center"
        side="bottom"
        sideOffset={4}
      >
        <div className="relative pointer-events-auto">
          <Calendar
            initialFocus
            mode="single"
            captionLayout="dropdown-buttons"
            fromYear={1900}
            toYear={2100}
            disabled={disabled}
            selected={value}
            onSelect={onSelect}
            defaultMonth={value}
            locale={es}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
});

DatePicker.displayName = "DatePicker";