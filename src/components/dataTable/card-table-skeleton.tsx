"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function CardTableSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                    {[1, 2, 3, 4].map((headerIndex) => (
                        <div key={headerIndex} className="mb-2">
                            <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    ))}
                    <div className="flex items-center justify-center mt-4">
                        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            ))}

            <div className="flex flex-col gap-4 p-4 border-t md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-2 justify-between md:justify-start">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Display:</span>
                            <Select disabled>
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[5, 10, 20, 50].map((size) => (
                                        <SelectItem key={size} value={`${size}`}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Page</span>
                            <span className="text-sm font-medium">-</span>
                            <span className="text-sm text-muted-foreground">of</span>
                            <span className="text-sm font-medium">-</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-1 w-full md:w-auto">
                    <Button variant="ghost" size="icon" disabled>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" disabled className="min-w-[32px] px-3.5 rounded-full">
                        -
                    </Button>
                    <Button variant="ghost" size="icon" disabled>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

