"use client";

import { Button } from "@/components/ui/button";
import { X, Download, Upload, Receipt, CreditCard } from "lucide-react";
import { PermissionGuard } from "@/components/permissions/permission-guard";

interface VoidPaymentButtonProps {
    onVoid: () => void;
    disabled?: boolean;
}

export function VoidPaymentButton({ onVoid, disabled }: VoidPaymentButtonProps) {
    return (
        <PermissionGuard permission="VOID_PAYMENT" module="payments">
            <Button
                variant="outline"
                size="sm"
                onClick={onVoid}
                disabled={disabled}
                className="text-red-600 border-red-200 hover:bg-red-50"
            >
                <X className="h-4 w-4 mr-2" />
                Anular Pago
            </Button>
        </PermissionGuard>
    );
}

interface BulkImportButtonProps {
    onImport: () => void;
}

export function BulkImportButton({ onImport }: BulkImportButtonProps) {
    return (
        <PermissionGuard permission="BULK_IMPORT" module="payments">
            <Button
                variant="outline"
                size="sm"
                onClick={onImport}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
                <Upload className="h-4 w-4 mr-2" />
                Importar Pagos
            </Button>
        </PermissionGuard>
    );
}

interface GenerateReceiptButtonProps {
    onGenerate: () => void;
    disabled?: boolean;
}

export function GenerateReceiptButton({ onGenerate, disabled }: GenerateReceiptButtonProps) {
    return (
        <PermissionGuard permission="GENERATE_RECEIPT" module="payments">
            <Button
                variant="outline"
                size="sm"
                onClick={onGenerate}
                disabled={disabled}
                className="text-green-600 border-green-200 hover:bg-green-50"
            >
                <Receipt className="h-4 w-4 mr-2" />
                Generar Recibo
            </Button>
        </PermissionGuard>
    );
}

interface AdvancePaymentButtonProps {
    onAdvance: () => void;
}

export function AdvancePaymentButton({ onAdvance }: AdvancePaymentButtonProps) {
    return (
        <PermissionGuard permission="ADVANCE_PAYMENT" module="payments">
            <Button
                variant="outline"
                size="sm"
                onClick={onAdvance}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
                <CreditCard className="h-4 w-4 mr-2" />
                Pago Anticipado
            </Button>
        </PermissionGuard>
    );
}

// Componente que agrupa todas las acciones
export function PaymentActions() {
    const handleVoid = () => {
        console.log('Anular pago');
    };

    const handleImport = () => {
        console.log('Importar pagos');
    };

    const handleGenerateReceipt = () => {
        console.log('Generar recibo');
    };

    const handleAdvance = () => {
        console.log('Pago anticipado');
    };

    return (
        <div className="flex gap-2">
            <VoidPaymentButton onVoid={handleVoid} />
            <BulkImportButton onImport={handleImport} />
            <GenerateReceiptButton onGenerate={handleGenerateReceipt} />
            <AdvancePaymentButton onAdvance={handleAdvance} />
        </div>
    );
} 