"use client"

import { useState, useRef, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ImageIcon, X, Upload } from "lucide-react"
import Image from "next/image"

interface FileUploadProps {
    value?: File | null
    onChange: (file: File | null) => void
    onProgress?: (progress: number) => void
    accept?: string
    maxSize?: number // en bytes
    existingImageUrl?: string | null
}

export function FileUpload(props: FileUploadProps) {
    const {
        value,
        onChange,
        onProgress,
        accept = "image/*",
        maxSize = 5 * 1024 * 1024, // 5MB por defecto
        existingImageUrl
    } = props;

    const [ preview, setPreview ] = useState<string | null>(null)
    const [ progress, setProgress ] = useState(0)
    const [ isDragging, setIsDragging ] = useState(false)
    const [ error, setError ] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (existingImageUrl && !value) {
            setPreview(existingImageUrl)
        } else if (!value) {
            setPreview(null)
        }
    }, [ existingImageUrl, value ])

    const handleFileChange = (file: File | null) => {
        setError(null)

        if (!file) {
            if (existingImageUrl) {
                setPreview(existingImageUrl)
            } else {
                setPreview(null)
            }
            onChange(null)
            setProgress(0)
            return
        }

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten imágenes')
            return
        }

        // Validar tamaño
        if (file.size > maxSize) {
            setError(`El archivo no debe superar ${maxSize / 1024 / 1024}MB`)
            return
        }

        // Crear preview
        const reader = new FileReader()
        reader.onloadstart = () => {
            setProgress(0)
            onProgress?.(0)
        }

        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const progressValue = (event.loaded / event.total) * 100
                setProgress(progressValue)
                onProgress?.(progressValue)
            }
        }

        reader.onload = () => {
            setPreview(reader.result as string)
            setProgress(100)
            onProgress?.(100)
        }

        reader.readAsDataURL(file)
        onChange(file)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[ 0 ]
        handleFileChange(file)
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        setPreview(null)
        setProgress(0)
        onChange(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="w-full">
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative
                    border-2 border-dashed rounded-lg
                    p-6
                    flex flex-col items-center justify-center
                    cursor-pointer
                    transition-colors
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
                    ${error ? 'border-red-500' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={(e) => handleFileChange(e.target.files?.[ 0 ] || null)}
                    className="hidden"
                />

                {preview ? (
                    <div className="relative w-full max-w-xs mx-auto">
                        <Image
                            src={preview}
                            alt="Preview"
                            width={300}
                            height={200}
                            className="rounded-lg object-cover"
                        />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="text-center">
                        {isDragging ? (
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        ) : (
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <span className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80">
                                Selecciona un archivo
                            </span>
                            <p className="pl-1">o arrastra y suelta</p>
                        </div>
                        <p className="text-xs text-gray-500">
                            PNG, JPG, GIF hasta {maxSize / 1024 / 1024}MB
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
            )}

            {progress > 0 && progress < 100 && (
                <div className="mt-4">
                    <Progress value={progress} className="h-2" />
                    <p className="mt-2 text-sm text-gray-500 text-center">{Math.round(progress)}%</p>
                </div>
            )}
        </div>
    )
} 