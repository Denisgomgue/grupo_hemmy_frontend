import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, MapPin } from "lucide-react";

interface UbicacionStepProps {
    values: { reference?: string; referenceImage?: File | string | null };
    onChange: (field: string, value: any) => void;
    isEditMode?: boolean; // Nueva prop para modo edición
}

export default function UbicacionStep({ values, onChange, isEditMode = false }: UbicacionStepProps) {
    const [ dragActive, setDragActive ] = useState(false);
    const [ imagePreview, setImagePreview ] = useState<string | null>(null);

    // Cargar imagen existente en modo edición
    useEffect(() => {
        if (isEditMode && values.referenceImage && typeof values.referenceImage === 'string') {
            // Si es una URL de imagen existente, mostrarla como preview
            setImagePreview(values.referenceImage);
        }
    }, [ isEditMode, values.referenceImage ]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[ 0 ]) {
            handleFile(e.dataTransfer.files[ 0 ]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[ 0 ]) {
            handleFile(e.target.files[ 0 ]);
        }
    };

    const handleFile = (file: File) => {
        if (file.type.startsWith("image/")) {
            onChange("referenceImage", file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            alert("Por favor seleccione un archivo de imagen válido");
        }
    };

    const removeImage = () => {
        onChange("referenceImage", null);
        setImagePreview(null);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Ubicación y Referencia</h3>

            </div>

            {/* Referencia de Ubicación */}
            <div className="space-y-2">
                <Label htmlFor="reference" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Referencia de Ubicación
                </Label>
                <Textarea
                    id="reference"
                    placeholder="Ej: Casa color azul, al lado de la farmacia, segunda cuadra..."
                    value={values.reference || ""}
                    onChange={(e) => onChange("reference", e.target.value)}
                    rows={4}
                    className="w-full resize-none"
                />

            </div>

            {/* Imagen de Referencia */}
            <div className="space-y-4">
                {!imagePreview ? (
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${dragActive
                            ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
                            : "border-border hover:border-muted-foreground"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileInput}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-4">
                            <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-foreground">
                                    Subir imagen de referencia
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Arrastra y suelta una imagen aquí, o haz clic para seleccionar
                                </p>
                                <p className="text-xs text-muted-foreground opacity-75">
                                    PNG, JPG, JPEG hasta 10MB
                                </p>
                            </div>
                            <Button type="button" variant="outline" size="sm" className="mt-4">
                                <Upload className="h-4 w-4 mr-2" />
                                Seleccionar Archivo
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative bg-muted/50 rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-shrink-0">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full sm:w-32 h-32 object-cover rounded-lg border border-border"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {typeof values.referenceImage === 'string' ? 'Imagen de referencia' : values.referenceImage?.name || 'Imagen de referencia'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {typeof values.referenceImage === 'string' ? 'Imagen existente' :
                                                    values.referenceImage?.size ?
                                                    `${(values.referenceImage.size / 1024 / 1024).toFixed(2)} MB` :
                                                    'Tamaño desconocido'
                                                }
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeImage}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                                            className="w-full sm:w-auto"
                                        >
                                            Cambiar Imagen
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </div>
                )}
            </div>


        </div>
    );
} 