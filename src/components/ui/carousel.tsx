"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CarouselProps {
    children: React.ReactNode[];
    autoPlay?: boolean;
    interval?: number;
    showDots?: boolean;
    showArrows?: boolean;
    className?: string;
}

export function Carousel({
    children,
    autoPlay = true,
    interval = 5000,
    showDots = true,
    showArrows = true,
    className
}: CarouselProps) {
    const [ currentIndex, setCurrentIndex ] = useState(0);

    useEffect(() => {
        if (!autoPlay) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % children.length);
        }, interval);

        return () => clearInterval(timer);
    }, [ autoPlay, interval, children.length ]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + children.length) % children.length);
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % children.length);
    };

    return (
        <div className={cn("relative overflow-hidden", className)}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-full"
                >
                    {children[ currentIndex ]}
                </motion.div>
            </AnimatePresence>

            {/* Flechas de navegación */}
            {showArrows && children.length > 1 && (
                <>
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                        onClick={goToPrevious}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                        onClick={goToNext}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </>
            )}

            {/* Indicadores de puntos */}
            {showDots && children.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {children.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                index === currentIndex
                                    ? "bg-primary scale-125"
                                    : "bg-muted hover:bg-muted-foreground"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 