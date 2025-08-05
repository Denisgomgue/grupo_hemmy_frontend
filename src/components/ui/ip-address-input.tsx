import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface IPAddressInputProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    className?: string;
    autoFocus?: boolean;
}

export function IPAddressInput({
    value = '',
    onChange,
    placeholder = '192.168.1.100',
    disabled = false,
    error = false,
    className,
    autoFocus = false
}: IPAddressInputProps) {
    const [ octets, setOctets ] = useState<string[]>(() => {
        if (value) {
            const parts = value.split('.');
            return [
                parts[ 0 ] || '',
                parts[ 1 ] || '',
                parts[ 2 ] || '',
                parts[ 3 ] || ''
            ];
        }
        return [ '', '', '', '' ];
    });

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Actualizar octetos cuando cambie el value externo
    useEffect(() => {
        if (value) {
            const parts = value.split('.');
            setOctets([
                parts[ 0 ] || '',
                parts[ 1 ] || '',
                parts[ 2 ] || '',
                parts[ 3 ] || ''
            ]);
        } else {
            setOctets([ '', '', '', '' ]);
        }
    }, [ value ]);

    // Validar que un octeto sea válido (0-255)
    const isValidOctet = (octet: string): boolean => {
        if (octet === '') return true;
        const num = parseInt(octet, 10);
        return !isNaN(num) && num >= 0 && num <= 255 && octet === num.toString();
    };

    // Manejar cambio en un octeto
    const handleOctetChange = (index: number, value: string) => {
        // Solo permitir números
        if (value && !/^\d+$/.test(value)) return;

        // Limitar a 3 dígitos
        if (value.length > 3) return;

        // Si el valor es mayor a 255, no permitir
        if (value && parseInt(value, 10) > 255) return;

        const newOctets = [ ...octets ];
        newOctets[ index ] = value;
        setOctets(newOctets);

        // Construir la IP completa
        const ipAddress = newOctets.join('.');
        onChange(ipAddress);

        // Auto avanzar al siguiente campo si el octeto está completo
        if (value.length === 3 || (value && parseInt(value, 10) > 25)) {
            if (index < 3 && inputRefs.current[ index + 1 ]) {
                inputRefs.current[ index + 1 ]?.focus();
            }
        }
    };

    // Manejar teclas especiales
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;

        if (e.key === '.') {
            e.preventDefault();
            if (index < 3 && inputRefs.current[ index + 1 ]) {
                inputRefs.current[ index + 1 ]?.focus();
            }
        } else if (e.key === 'Backspace' && target.value === '' && index > 0) {
            inputRefs.current[ index - 1 ]?.focus();
        } else if (e.key === 'ArrowRight' && target.selectionStart === target.value.length && index < 3) {
            inputRefs.current[ index + 1 ]?.focus();
        } else if (e.key === 'ArrowLeft' && target.selectionStart === 0 && index > 0) {
            inputRefs.current[ index - 1 ]?.focus();
        }
    };

    // Manejar paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');

        // Verificar si es una IP válida
        const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
        if (ipRegex.test(pastedText)) {
            const parts = pastedText.split('.');
            if (parts.every(part => parseInt(part, 10) <= 255)) {
                setOctets(parts);
                onChange(pastedText);
            }
        }
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {octets.map((octet, index) => (
                <React.Fragment key={index}>
                    <Input
                        ref={(el) => (inputRefs.current[ index ] = el)}
                        type="text"
                        value={octet}
                        onChange={(e) => handleOctetChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        placeholder={placeholder.split('.')[ index ] || ''}
                        disabled={disabled}
                        autoFocus={autoFocus && index === 0}
                        className={cn(
                            "text-center w-16 font-mono",
                            error && "border-red-500 focus-visible:ring-red-500",
                            !isValidOctet(octet) && octet && "border-orange-400 focus-visible:ring-orange-400"
                        )}
                        maxLength={3}
                    />
                    {index < 3 && (
                        <span className="text-gray-400 font-mono text-lg font-bold">.</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// Helper para validar IP completa
export const isValidIPAddress = (ip: string): boolean => {
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;

    const parts = ip.split('.');
    return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
    });
};

// Helper para generar IP automática (opcional)
export const generateSuggestedIP = (baseIP: string = '192.168.1'): string => {
    const randomLastOctet = Math.floor(Math.random() * 200) + 10; // 10-209
    return `${baseIP}.${randomLastOctet}`;
}; 