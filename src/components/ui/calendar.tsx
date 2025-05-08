"use client"

import * as React from "react"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { ScrollArea } from "./scroll-area"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("w-full p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-between items-center px-2 pt-1",
        caption_label: "text-sm font-medium",
        caption_dropdowns: "flex items-center px-4",
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
        Dropdown: ({ value, onChange, children, ...props }) => {
          const options = React.Children.toArray(children) as React.ReactElement[];
          //@ts-ignore
          const selected = options.find((child) => child.props.value === value);

          const handleChange = (newValue: string) => {
            const fakeEvent = {
              target: { value: newValue },
            } as unknown as React.ChangeEvent<HTMLSelectElement>;

            onChange?.(fakeEvent);
          };

          return (
            <Select value={value?.toString()} onValueChange={handleChange}>
              <SelectTrigger className="h-8 w-[100px] text-sm border-none bg-transparent px-2 hover:bg-accent">
                {/**@ts-ignore */}
                <SelectValue>{selected?.props?.children}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" className="w-[120px] p-0">
                <ScrollArea className="h-60">
                  {options.map((option, i) => (
                    <SelectItem
                      //@ts-ignore
                      key={option.props.value || i}
                      //@ts-ignore
                      value={option.props.value?.toString() ?? ""}
                    >
                      {/**@ts-ignore */}
                      {option.props.children}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          );
        },
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }