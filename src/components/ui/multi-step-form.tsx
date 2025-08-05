import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Step {
    label: string;
    icon: React.ReactNode;
}

interface MultiStepFormProps {
    steps: Step[];
    currentStep: number;
    onStepChange: (step: number) => void;
    onNext: () => void;
    onBack: () => void;
    onSubmit?: () => void;
    onUpdate?: () => void; // Nueva prop para actualizar
    isNextDisabled?: boolean;
    isBackDisabled?: boolean;
    isSubmitting?: boolean;
    isUpdating?: boolean; // Nueva prop para estado de actualización
    showUpdateButton?: boolean; // Nueva prop para mostrar botón de actualizar
    children: React.ReactNode;
}

export function MultiStepForm({
    steps,
    currentStep,
    onStepChange,
    onNext,
    onBack,
    onSubmit,
    onUpdate,
    isNextDisabled = false,
    isBackDisabled = false,
    isSubmitting = false,
    isUpdating = false,
    showUpdateButton = false,
    children,
}: MultiStepFormProps) {
    const isLastStep = currentStep === steps.length - 1;

    const handleNextOrSubmit = () => {
        if (isLastStep && onSubmit) {
            onSubmit();
        } else {
            onNext();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Barra de pasos para móvil - solo números */}
            <div className="block sm:hidden flex-shrink-0">
                <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                    <div className="flex items-center space-x-2">
                        {steps.map((step, index) => (
                            <button
                                key={index}
                                onClick={() => onStepChange(index)}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${index === currentStep
                                    ? "bg-blue-600 text-white"
                                    : index < currentStep
                                        ? "bg-green-600 text-white"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground ">
                        {currentStep + 1} de {steps.length}
                    </div>
                </div>
            </div>

            {/* Barra de pasos para tablet - iconos y texto horizontal */}
            <div className="hidden sm:block lg:hidden flex-shrink-0">
                <div className="px-4 py-2 bg-muted/50 border-b">
                    <div className="flex items-center justify-between space-x-2">
                        {steps.map((step, index) => (
                            <button
                                key={index}
                                onClick={() => onStepChange(index)}
                                className={`flex items-center space-x-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${index === currentStep
                                    ? "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                                    : index < currentStep
                                        ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                                        : "text-muted-foreground hover:bg-muted/50"
                                    }`}
                            >
                                <div
                                    className={`${index === currentStep
                                        ? "text-blue-600 dark:text-blue-400"
                                        : index < currentStep
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-muted-foreground"
                                        }`}
                                >
                                    {step.icon}
                                </div>
                                <span className="hidden md:block">{step.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Layout principal */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Sidebar para desktop */}
                <div className="hidden lg:block w-56 border-r flex-shrink-0">
                    <div className="p-4 h-full overflow-y-auto flex flex-col justify-around align-content-center">
                        <nav className="space-y-3 ">
                            {steps.map((step, index) => (
                                <button
                                    key={index}
                                    onClick={() => onStepChange(index)}
                                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${index === currentStep
                                        ? "bg-blue-200 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                                        : index < currentStep
                                            ? "bg-violet-50 text-blue-700 hover:bg-blue-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                                            : "text-muted-foreground hover:bg-muted/50"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <div
                                            className={`mr-3 ${index === currentStep
                                                ? "text-blue-600 dark:text-blue-400"
                                                : index < currentStep
                                                    ? "text-blue-600 dark:text-green-400"
                                                    : "text-muted-foreground"
                                                }`}
                                        >
                                            {step.icon}
                                        </div>
                                        <span className="font-medium">{step.label}</span>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Título del paso actual para móvil y tablet */}
                    <div className="block lg:hidden px-4 py-2 border-b flex-shrink-0">
                        <h2 className="text-sm font-medium text-foreground">
                            {steps[ currentStep ].label}
                        </h2>
                    </div>

                    {/* Contenido del paso actual */}
                    <div className="flex-1 p-4 overflow-y-auto min-h-0">
                        {children}
                    </div>

                    {/* Botones de navegación */}
                    <div className="flex justify-between items-center px-4 py-3 border-t flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onBack}
                            disabled={isBackDisabled}
                            className="flex items-center gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:block">Atrás</span>
                        </Button>

                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                {currentStep + 1} de {steps.length}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Botón de Actualizar */}
                            {showUpdateButton && onUpdate && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={onUpdate}
                                    disabled={isUpdating || isSubmitting}
                                    className="flex items-center gap-1"
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                            <span className="hidden sm:block text-xs">Actualizando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="hidden sm:block text-xs">Actualizar</span>
                                            <span className="sm:hidden text-xs">Act.</span>
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* Botón de Siguiente/Finalizar */}
                        <Button
                            size="sm"
                            onClick={handleNextOrSubmit}
                                disabled={isNextDisabled || isSubmitting || isUpdating}
                            className="flex items-center gap-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    <span className="hidden sm:block text-xs">Guardando...</span>
                                </>
                            ) : isLastStep ? (
                                <>
                                    <span className="text-xs">Finalizar</span>
                                </>
                            ) : (
                                <>
                                    <span className="hidden sm:block text-xs">Siguiente</span>
                                    <span className="sm:hidden text-xs">Sig.</span>
                                    <ChevronRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 