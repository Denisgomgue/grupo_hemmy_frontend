"use client"

import * as React from "react"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { ScrollArea } from "./scroll-area"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  variant?: "default" | "birthdate" | "future" | "wide-range" | "payment-date"
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  variant = "default",
  ...props
}: CalendarProps) {
  // Crear locale personalizado con meses capitalizados
  const customLocale = React.useMemo(() => {
    const capitalize = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return {
      ...es,
      localize: {
        ...es.localize,
        month: (n: any) => {
          const monthName = es.localize?.month(n) || '';
          return capitalize(monthName);
        },
      },
    };
  }, []);

  // Configuración según la variante
  const getVariantConfig = () => {
    const currentYear = new Date().getFullYear();

    switch (variant) {
      case "birthdate":
        return {
          fromYear: 1925,                      // Desde 1995
          toYear: 2008,                        // Hasta 2008
          defaultMonth: new Date(2008, 0),     // Empezar en el año 2000
        };
      case "future":
        return {
          fromYear: currentYear,       // Solo año actual
          toYear: currentYear,         // Solo año actual
          defaultMonth: new Date(),    // Mes actual
        };
      case "wide-range":
        return {
          fromYear: 1900,
          toYear: currentYear + 50,
          defaultMonth: new Date(), // Mes actual
        };
        // solo el año actual y desde el mes actual a 2 meses
      case "payment-date":
        return {
          fromYear: currentYear,
          toYear: currentYear,
          defaultMonth: new Date(), // Mes actual
          fromMonth: new Date().getMonth(),
          toMonth: new Date().getMonth() + 1,
        };
      default:
        return {
          fromYear: currentYear - 10,
          toYear: currentYear + 10,
          defaultMonth: new Date(), // Mes actual
        };
    }
  };

  const config = getVariantConfig();

  // Aplicar estilos personalizados al dropdown
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .rdp select {
        border: none !important;
        outline: none !important;
        background: #49008d09 !important;
        cursor: pointer !important;
        width: 100% !important;
        appearance: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        background-image: none !important;
        
      }
      .rdp select::-ms-expand {
        display: none !important;
      }
      .rdp select:focus {
        ring: 1px solid hsl(var(--primary)) !important;
      }
      .rdp select option {
        background: hsl(var(--background)) !important;
        color: hsl(var(--foreground)) !important;
        padding: 8px !important;
        // border: 20px solid #8b5cf6 !important;
        // margin: 2px !important;
        
      }
      .rdp select option:hover {
        background: hsl(var(--accent)) !important;
        border-color: #7c3aed !important;
      }
      .rdp select option:checked {
        background: #8b5cf6 !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <DayPicker
      locale={customLocale}
      showOutsideDays={showOutsideDays}
      captionLayout="dropdown-buttons"
      fromYear={config.fromYear}
      toYear={config.toYear}
      defaultMonth={config.defaultMonth}
      className={cn("w-full p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center items-center px-2 pt-1 relative",
        caption_label: "hidden", // Oculta el texto que aparece debajo de los dropdowns
        caption_dropdowns: "flex justify-between gap-2",
        dropdown: "h-8 text-sm bg-background px-2 hover:bg-accent focus:ring-1 transition-colors rounded-md cursor-pointer",
        dropdown_icon: "hidden",
        dropdown_month: "w-[120px] cursor-pointer",
        dropdown_year: "w-[80px] cursor-pointer",
        vhidden: "hidden", // Oculta los labels "Month:" y "Year:"
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full justify-between",
        head_cell: "w-12 flex items-center justify-center text-muted-foreground font-medium text-sm",
        row: "grid grid-cols-7 gap-1",
        cell: "w-12 h-12 flex items-center justify-center relative",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "w-full h-full flex items-center justify-center rounded-full relative z-20 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }