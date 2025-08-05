import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ClientSearchSelect, PlanSearchSelect, SectorSearchSelect, SearchSelectInput } from './index';
import { SearchSelectOption } from '@/components/ui/search-select-input';

export function SearchSelectExample() {
    const [ selectedClient, setSelectedClient ] = useState<number>();
    const [ selectedPlan, setSelectedPlan ] = useState<number>();
    const [ selectedSector, setSelectedSector ] = useState<number>();
    const [ selectedCustom, setSelectedCustom ] = useState<string>();

    // Ejemplo de opciones personalizadas
    const customOptions: SearchSelectOption[] = [
        { value: 'option1', label: 'Opción 1', description: 'Descripción de la opción 1' },
        { value: 'option2', label: 'Opción 2', description: 'Descripción de la opción 2' },
        { value: 'option3', label: 'Opción 3', description: 'Descripción de la opción 3' },
    ];

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Componentes de Búsqueda y Selección</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Búsqueda de Clientes */}
                    <div className="space-y-2">
                        <Label htmlFor="client-search">Cliente</Label>
                        <ClientSearchSelect
                            value={selectedClient}
                            onChange={setSelectedClient}
                            placeholder="Buscar cliente por nombre o DNI..."
                            onClientSelect={(client) => {
                                console.log('Cliente seleccionado:', client);
                            }}
                        />
                    </div>

                    {/* Búsqueda de Planes */}
                    <div className="space-y-2">
                        <Label htmlFor="plan-search">Plan</Label>
                        <PlanSearchSelect
                            value={selectedPlan}
                            onChange={setSelectedPlan}
                            placeholder="Buscar plan por nombre..."
                            onPlanSelect={(plan) => {
                                console.log('Plan seleccionado:', plan);
                            }}
                        />
                    </div>

                    {/* Búsqueda de Sectores */}
                    <div className="space-y-2">
                        <Label htmlFor="sector-search">Sector</Label>
                        <SectorSearchSelect
                            value={selectedSector}
                            onChange={setSelectedSector}
                            placeholder="Buscar sector por nombre..."
                            onSectorSelect={(sector) => {
                                console.log('Sector seleccionado:', sector);
                            }}
                        />
                    </div>

                    {/* Búsqueda Personalizada */}
                    <div className="space-y-2">
                        <Label htmlFor="custom-search">Búsqueda Personalizada</Label>
                        <SearchSelectInput
                            value={selectedCustom}
                            onChange={setSelectedCustom}
                            options={customOptions}
                            placeholder="Seleccionar una opción..."
                            onSearch={(query) => {
                                console.log('Búsqueda:', query);
                            }}
                        />
                    </div>

                    {/* Mostrar valores seleccionados */}
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">Valores Seleccionados:</h3>
                        <div className="space-y-1 text-sm">
                            <p>Cliente ID: {selectedClient || 'No seleccionado'}</p>
                            <p>Plan ID: {selectedPlan || 'No seleccionado'}</p>
                            <p>Sector ID: {selectedSector || 'No seleccionado'}</p>
                            <p>Opción Personalizada: {selectedCustom || 'No seleccionado'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 