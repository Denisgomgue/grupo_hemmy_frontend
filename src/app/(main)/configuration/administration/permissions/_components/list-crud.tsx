"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import Can from "@/components/permission/can";

interface ListCrudProps {
    value: string[];
    onChange: (value: string[]) => void;
    title?: string;
    subTitle?: string;
    chipColor?: "blue" | "red";
    context?: "acciones" | "restricciones";
}

export const ListCrud: React.FC<ListCrudProps> = ({
    value,
    onChange,
    title = "Título",
    subTitle = "SubTitulo",
    chipColor = "blue",
    context = "acciones",
}) => {
    const [items, setItems] = useState<string[]>(value || []);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newItem, setNewItem] = useState<string>("");
    const [isAdding, setIsAdding] = useState(false);
    const [shouldSave, setShouldSave] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAdding || editingIndex !== null) {
            inputRef.current?.focus();
        }
    }, [isAdding, editingIndex]);

    const handleAddItem = () => {
        if (newItem.trim()) {
            setItems((prev) => [...prev, newItem.trim()]);
            onChange([...items, newItem.trim()]);
        }
        setIsAdding(false);
        setNewItem("");
        setShouldSave(false);
    };

    const handleEditItem = (index: number) => {
        setEditingIndex(index);
        setNewItem(items[index]);
        setShouldSave(false);
    };

    const handleSaveItem = (index: number, updatedValue: string) => {
        if (updatedValue.trim()) {
            const updatedItems = items.map((item, idx) =>
                idx === index ? updatedValue.trim() : item
            );
            setItems(updatedItems);
            onChange(updatedItems);
        }
        setEditingIndex(null);
        setNewItem("");
        setShouldSave(false);
    };

    const handleRemoveItem = (index: number) => {
        const updatedItems = items.filter((_, idx) => idx !== index);
        setItems(updatedItems);
        setEditingIndex(null);
        onChange(updatedItems);
    };

    const handleKeyPress = (e: React.KeyboardEvent, index?: number) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setShouldSave(true);
            if (typeof index === 'number') {
                handleSaveItem(index, newItem);
            } else {
                handleAddItem();
            }
        }
    };

    const handleBlur = () => {
        if (shouldSave) {
            if (editingIndex !== null) {
                handleSaveItem(editingIndex, newItem);
            } else if (isAdding) {
                handleAddItem();
            }
        }
        setIsAdding(false);
        setEditingIndex(null);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-white/80">{title}</h3>
                    <p className="text-xs text-gray-500 dark:text-white/60">{subTitle}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-white/70">{items.length}</span>
                    <Can
                        action={context === "acciones" ? "agregar-acciones" : "agregar-restricciones"}
                        subject="configuracion-permiso"
                    >
                        <Button
                            size="icon"
                            className="rounded-full"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus />
                        </Button>
                    </Can>
                </div>
            </div>

            {isAdding && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs ml-5 text-gray-500 dark:text-white/60">
                        Presiona &quot;Enter&quot; o haz &quot;Click&quot; afuera del input para cerrar
                    </p>
                    <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-500 dark:text-white/60 font-medium">
                            {items.length + 1}.
                        </span>
                        <Input
                            ref={inputRef}
                            value={newItem}
                            onChange={(e) => {
                                setNewItem(e.target.value);
                                setShouldSave(true);
                            }}
                            onKeyPress={handleKeyPress}
                            onBlur={handleBlur}
                            className="flex-1"
                        />
                    </div>
                </div>
            )}

            <ul className="space-y-2">
                {items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-white/60 font-medium">
                            {idx + 1}.
                        </span>
                        {editingIndex === idx ? (
                            <div className="flex-1">
                                <p className="text-xs mb-2 text-gray-500 dark:text-white/60">
                                    Presiona &quot;Enter&quot; o haz &quot;Click&quot; afuera del input para cerrar
                                </p>
                                <Input
                                    ref={inputRef}
                                    value={newItem}
                                    onChange={(e) => {
                                        setNewItem(e.target.value);
                                        setShouldSave(true);
                                    }}
                                    onKeyPress={(e) => handleKeyPress(e, idx)}
                                    onBlur={handleBlur}
                                    className="flex-1"
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-between">
                                <span
                                    className={cn(
                                        "px-3 py-1 text-sm rounded-full",
                                        chipColor === "blue"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-red-100 text-red-700"
                                    )}
                                >
                                    {item}
                                </span>
                                <div className="flex gap-1">
                                    <Can
                                        action={context === "acciones" ? "editar-acciones" : "editar-restricciones"}
                                        subject="configuracion-permiso"
                                    >
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="rounded-full shadow-md"
                                            onClick={() => handleEditItem(idx)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Can>
                                    <Can
                                        action={context === "acciones" ? "eliminar-acciones" : "eliminar-restricciones"}
                                        subject="configuracion-permiso"
                                    >
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="rounded-full shadow-md"
                                            onClick={() => handleRemoveItem(idx)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </Can>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};