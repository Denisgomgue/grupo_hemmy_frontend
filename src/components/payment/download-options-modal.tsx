"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, FileImage, FileText, Check } from "lucide-react"
import { useState } from "react"

interface DownloadOptionsModalProps {
    isOpen: boolean
    onClose: () => void
    onDownload: (format: 'image' | 'pdf') => void
    isLoading?: boolean
}

export function DownloadOptionsModal({
    isOpen,
    onClose,
    onDownload,
    isLoading = false
}: DownloadOptionsModalProps) {
    const [ selectedFormat, setSelectedFormat ] = useState<'image' | 'pdf' | null>(null)

    const handleDownload = () => {
        if (selectedFormat) {
            onDownload(selectedFormat)
            onClose()
            setSelectedFormat(null)
        }
    }

    const handleClose = () => {
        setSelectedFormat(null)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#5E3583] flex items-center">
                        <Download className="w-5 h-5 mr-2" />
                        Descargar Comprobante
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-sm">
                        Selecciona el formato en el que deseas descargar el comprobante de pago:
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                        {/* Opción Imagen */}
                        <Card
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedFormat === 'image'
                                ? 'ring-2 ring-[#5E3583] bg-purple-50'
                                : 'hover:bg-gray-50'
                                }`}
                            onClick={() => setSelectedFormat('image')}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${selectedFormat === 'image'
                                            ? 'bg-[#5E3583] text-white'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            <FileImage className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Imagen PNG</h3>
                                            <p className="text-sm text-gray-500">
                                                Alta calidad, perfecta para compartir
                                            </p>
                                        </div>
                                    </div>
                                    {selectedFormat === 'image' && (
                                        <Check className="w-5 h-5 text-[#5E3583]" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Opción PDF */}
                        <Card
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedFormat === 'pdf'
                                ? 'ring-2 ring-[#5E3583] bg-purple-50'
                                : 'hover:bg-gray-50'
                                }`}
                            onClick={() => setSelectedFormat('pdf')}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${selectedFormat === 'pdf'
                                            ? 'bg-[#5E3583] text-white'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Documento PDF</h3>
                                            <p className="text-sm text-gray-500">
                                                Formato profesional, ideal para archivar
                                            </p>
                                        </div>
                                    </div>
                                    {selectedFormat === 'pdf' && (
                                        <Check className="w-5 h-5 text-[#5E3583]" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDownload}
                            disabled={!selectedFormat || isLoading}
                            className="bg-[#5E3583] hover:bg-[#4A2968] text-white"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Descargando...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 