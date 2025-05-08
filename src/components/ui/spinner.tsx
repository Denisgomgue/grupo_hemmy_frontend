"use client";

import { cn } from "@/lib/utils";
import { CgSpinner } from "react-icons/cg";

interface SpinnerProps {
  className?: string,
  message?: string,
}

export const Spinner = ({
  className,
  message,
}: SpinnerProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <CgSpinner className={cn(
        "animate-spin text-primary",
        className,
      )} />
      <p className="text-sm text-primary">{message}</p>
    </div>
  )
}
