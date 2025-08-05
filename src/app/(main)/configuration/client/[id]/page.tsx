"use client"

import { type ElementRef, type ComponentPropsWithoutRef, useEffect, useState, useRef, forwardRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, CreditCard, Ticket, MapPin, User as UserIcon, Phone, MessageSquare, Image, X, ZoomIn, ZoomOut, RotateCw, Download, Hand, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios"
import { type Client, AccountStatus, PaymentStatus as ClientPaymentStatus } from "@/types/clients/client"
import { type Payment, PaymentStatus, PaymentType } from "@/types/payments/payment"
import { getPaymentStatusLabel } from "@/utils/payment-status-labels"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { PaymentForm } from "@/app/(main)/configuration/payment/_components/payment-form"
import { getAccountStatusLabel } from "@/utils/account-status-labels"
import { getClientPaymentStatusLabel } from "@/utils/client-payment-status-labels"
import { PaymentDetailModal } from "@/components/payment/payment-detail-modal"
import { ClientImageFill } from "@/components/ui/client-image"
import { cn, transformPaymentDataForBackend, validatePaymentData, formatDateForDisplay, calculateNextPaymentDateForDisplay } from "@/lib/utils"
import { ComputerDesktopIcon } from "@heroicons/react/24/outline"

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const { toast } = useToast()
  const [ client, setClient ] = useState<Client | null>(null)
  const [ payments, setPayments ] = useState<Payment[]>([])
  const [ isLoading, setIsLoading ] = useState(true)
  const [ isPaymentsLoading, setIsPaymentsLoading ] = useState(true)
  const [ isPaymentModalOpen, setIsPaymentModalOpen ] = useState(false)
  const [ selectedPayment, setSelectedPayment ] = useState<Payment | null>(null)
  const [ isPaymentDetailModalOpen, setIsPaymentDetailModalOpen ] = useState(false)
  const [ isImageModalOpen, setIsImageModalOpen ] = useState(false)
  const [ imageZoom, setImageZoom ] = useState(1)
  const [ imageRotation, setImageRotation ] = useState(0)
  const [ isDragging, setIsDragging ] = useState(false)
  const [ dragPosition, setDragPosition ] = useState({ x: 0, y: 0 })
  const [ isPanning, setIsPanning ] = useState(false)
  const dragRef = useRef({ startX: 0, startY: 0 })

  const fetchClientPayments = async () => {
    if (!id) return
    try {
      setIsPaymentsLoading(true)
      const response = await api.get(`/payments?client=${id}`)
      setPayments(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error("Error fetching client payments:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos del cliente",
        variant: "destructive",
      })
      setPayments([])
    } finally {
      setIsPaymentsLoading(false)
    }
  }

  const fetchClientData = async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const response = await api.get(`/client/${id}`)
      setClient(response.data)
    } catch (error) {
      console.error("Error fetching client data:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del cliente",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClientData()
    fetchClientPayments()
  }, [ id, toast ])

  const handleBack = () => {
    router.back()
  }

  const handleEdit = () => {
    // Navigate to edit page or open edit modal
    router.push(`/configuration/client?edit=${id}`)
  }

  const handleRegisterPayment = () => {
    // Navigate to payment form with client pre-selected
    router.push(`/configuration/payment?client=${id}`)
  }

  // Handler para abrir el modal de pago (siempre para nuevo pago)
  const handleOpenPaymentModal = () => {
    setSelectedPayment(null); // Asegurar que no hay pago seleccionado
    setIsPaymentModalOpen(true);
  }

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
  };

  // Handler para registrar un nuevo pago
  const handlePaymentSubmit = async (data: any) => {
    try {
      // Transformar y validar datos del pago
      const paymentData = transformPaymentDataForBackend(data);

      // Validar que el cliente sea correcto
      if (!validatePaymentData(paymentData)) {
        toast({
          title: "Error",
          description: "Datos de cliente inválidos. Por favor, verifique la información.",
          variant: "destructive",
        });
        return;
      }



      // Siempre crear un nuevo pago (no actualizar)
      await api.post('/payments', paymentData);

      toast({
        title: "Pago registrado",
        description: "El pago se guardó correctamente.",
        variant: "default",
      });

      setIsPaymentModalOpen(false);
      setSelectedPayment(null);

      // Recargar los pagos
      await fetchClientPayments();
      // Recargar los datos del cliente para actualizar su estado
      await fetchClientData();

    } catch (error: any) {
      console.error('Error al registrar el pago:', error);

      // 🎯 MEJORA: Extraer mensaje específico del backend
      let errorMessage = "No se pudo registrar el pago. Por favor, intente nuevamente.";

      if (error.response?.data?.message) {
        // Mensaje específico del backend (ej: validación de un pago por mes)
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 500) {
        // Error interno del servidor
        errorMessage = "Error interno del servidor. Por favor, contacte al administrador.";
      } else if (error.response?.status === 400) {
        // Error de validación
        errorMessage = "Datos inválidos. Por favor, verifique la información.";
      } else if (error.response?.status === 404) {
        // Recurso no encontrado
        errorMessage = "Cliente o recurso no encontrado.";
      }

      toast({
        title: "Error al Registrar Pago",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentDetailModalOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentDetailModal = () => {
    setIsPaymentDetailModalOpen(false);
  };



  const handleDeletePayment = async (paymentId: string) => {
    try {
      await api.delete(`/payments/${paymentId}`);
      setIsPaymentDetailModalOpen(false);
      setSelectedPayment(null);

      // Recargar datos del cliente y pagos
      await Promise.all([
        fetchClientData(),
        fetchClientPayments()
      ]);

      toast({
        title: "Pago eliminado",
        description: "El pago se eliminó correctamente.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el pago.",
        variant: "destructive",
      });
    }
  };

  interface PaymentActionsDropdownProps {
    payment: Payment
    onEdit: (payment: Payment) => void
    onDelete?: (paymentId: string) => void
  }

  const getStatusVariant = (status: AccountStatus): "accountSuccess" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case AccountStatus.ACTIVE:
        return "accountSuccess"
      case AccountStatus.SUSPENDED:
        return "secondary"
      case AccountStatus.INACTIVE:
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPaymentStatusVariant = (status: ClientPaymentStatus | string): "success" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case ClientPaymentStatus.PAID:
        return "success"
      case ClientPaymentStatus.EXPIRING:
        return "secondary"
      case ClientPaymentStatus.EXPIRED:
        return "destructive"
      case ClientPaymentStatus.SUSPENDED:
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPaymentStateVariant = (state: PaymentStatus): "success" | "secondary" | "destructive" | "outline" => {
    switch (state) {
      case PaymentStatus.PAYMENT_DAILY:
        return "success"
      case PaymentStatus.PENDING:
        return "secondary"
      case PaymentStatus.LATE_PAYMENT:
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPaymentStateText = (state: PaymentStatus): string => {
    switch (state) {
      case PaymentStatus.PAYMENT_DAILY:
        return "Pagado"
      case PaymentStatus.PENDING:
        return "Pendiente"
      case PaymentStatus.LATE_PAYMENT:
        return "Pago Tardío"
      default:
        return "Desconocido"
    }
  }

  const getPaymentTypeText = (type: PaymentType): string => {
    switch (type) {
      case PaymentType.CASH:
        return "Efectivo"
      case PaymentType.TRANSFER:
        return "Transferencia"
      case PaymentType.YAPE:
        return "Yape"
      case PaymentType.PLIN:
        return "Plin"
      case PaymentType.OTHER:
        return "Otro"
      default:
        return "Desconocido"
    }
  }

  const handleImageModalClose = () => {
    setIsImageModalOpen(false)
    setImageZoom(1)
    setImageRotation(0)
    setDragPosition({ x: 0, y: 0 })
  }

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setImageRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = () => {
    if (mainInstallation?.referenceImage && client) {
      const link = document.createElement('a')
      link.href = typeof mainInstallation.referenceImage === 'string' ? mainInstallation.referenceImage : URL.createObjectURL(mainInstallation.referenceImage)
      link.download = `imagen_referencia_${client.name}_${client.lastName}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePanStart = () => {
    setIsPanning(!isPanning)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPanning) return
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX - dragPosition.x,
      startY: e.clientY - dragPosition.y
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isPanning) return
    setDragPosition({
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetImageControls = () => {
    setImageZoom(1)
    setImageRotation(0)
    setDragPosition({ x: 0, y: 0 })
  }

  // Función para generar el enlace de WhatsApp


  const getWhatsAppLink = (phone: string) => {
    // Limpiamos el número de teléfono de cualquier carácter no numérico
    const cleanPhone = phone?.replace(/\D/g, '');
    // Si el número no empieza con el código de país, agregamos +51 (Perú)
    const fullPhone = cleanPhone?.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    return `https://wa.me/${fullPhone}`;
  };

  // Función para manejar la llamada telefónica
  const handlePhoneCall = () => {
    if (client?.phone) {
      window.location.href = `tel:${client.phone}`;
    }
  };

  if (isLoading) {
    return <ClientDetailSkeleton />
  }

  if (!client) {
    return (
      <div className="container mx-auto p-4">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold">Cliente no encontrado</h2>
          <p className="text-muted-foreground mt-2">El cliente solicitado no existe o ha sido eliminado.</p>
        </div>
      </div>
    )
  }

  const initial = client.name ? client.name[ 0 ].toUpperCase() : "?"

  // Extraer datos de la primera instalación (asumiendo que cada cliente tiene una instalación principal)
  const mainInstallation = client.installations?.[ 0 ]
  const paymentConfig = mainInstallation?.paymentConfig

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <h1 className="text-2xl font-bold">Detalle del Cliente</h1>
        <div className="w-[100px]"></div> {/* Spacer for alignment */}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Personal Information Card */}
        <Card className="overflow-hidden border-none shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-gray-50/50">
            <CardTitle className="text-xl flex items-center gap-2 text-gray-700">
              <UserIcon className="h-5 w-5 text-purple-800" /> Información Personal
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleEdit} className="hover:bg-purple-100 hover:text-purple-600">
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {/* Información Personal Header */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 text-2xl ring-2 ring-purple-200 ring-offset-2">
                  <AvatarFallback className="bg-purple-200 text-purple-900">{initial}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {client.name} {client.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-500 font-medium">{client.dni}</span>
                    <Badge variant={getStatusVariant(client.status)} className="font-medium text-xs px-2 py-0.5">
                      {getAccountStatusLabel(client.status)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-purple-100 hover:text-purple-600 transition-colors"
                  onClick={handlePhoneCall}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <a
                  href={getWhatsAppLink(client?.phone || '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:no-underline"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Grid de información principal */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="col-span-2 space-y-1">
                <p className="text-sm font-medium text-gray-500">Dirección</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <p className="font-medium text-gray-700">{client.address || "Sin dirección registrada"}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <p className="font-medium text-gray-700">{client.phone || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Sector</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <p className="font-medium text-gray-700">{mainInstallation?.sector?.name || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Grid de estados */}
            <div className="grid grid-cols-2 gap-6 mb-6 pb-4 border-b">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Estado de Pago</p>
                <Badge
                  variant={getPaymentStatusVariant(paymentConfig?.paymentStatus || 'EXPIRING')}
                  className="font-medium px-3 py-1 text-xs"
                >
                  {getClientPaymentStatusLabel(paymentConfig?.paymentStatus || ClientPaymentStatus.EXPIRING)}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Renta</p>
                <Badge
                  variant={paymentConfig?.advancePayment ? "outline" : "secondary"}
                  className="font-medium px-3 py-1 text-xs"
                >
                  {paymentConfig?.advancePayment ? "Adelantada" : "Sin adelanto"}
                </Badge>
              </div>
            </div>

            {/* Botón de imagen de referencia */}
            <Button
              variant="outline"
              className="w-full border-2 border-purple-800/30 text-purple-800 hover:bg-purple-100 hover:text-purple-700 hover:border-purple-800 transition-colors duration-200 font-medium"
              onClick={() => setIsImageModalOpen(true)}
            >
              <Image className="mr-2 h-4 w-4" />
              Ver Imagen de Referencia
            </Button>
          </CardContent>
        </Card>

        {/* Service Information Card */}
        <Card className="overflow-hidden border-none shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-gray-50/50">
            <CardTitle className="text-xl flex items-center gap-2 text-gray-700">
              <CreditCard className="h-5 w-5 text-purple-800" /> Información del Servicio
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleEdit} className="hover:bg-purple-100 hover:text-purple-600">
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {/* Grid de información principal del servicio */}
            <div className="grid grid-cols-2 gap-6 mb-6 pb-4 border-b">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Plan Actual</p>
                <p className="font-medium text-gray-700">{mainInstallation?.plan?.name || "N/A"} - S/ {mainInstallation?.plan?.price || "0.00"} /mes</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Tipo de Servicio</p>
                <p className="font-medium text-gray-700">{mainInstallation?.plan?.service?.name || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Velocidad</p>
                <p className="font-medium text-gray-700">{mainInstallation?.plan?.speed || "N/A"} Mbps</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Dirección IP</p>
                <p className="font-medium text-gray-700 font-mono">{mainInstallation?.ipAddress || "N/A"}</p>
              </div>
            </div>

            {/* Grid de fechas */}
            <div className="grid grid-cols-2 gap-6 mb-6 pb-4 border-b">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Fecha de Instalación</p>
                <p className="font-medium text-gray-700">
                  {formatDateForDisplay(mainInstallation?.installationDate)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Próximo Pago</p>
                <p className="font-medium text-gray-700">
                  {calculateNextPaymentDateForDisplay(paymentConfig?.initialPaymentDate, payments.length)}
                </p>
              </div>
            </div>

            {/* Grid de información técnica */}
            <div className="grid grid-cols-2 gap-6 mb-6 pb-4 border-b">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Referencia de Ubicación</p>
                <p className="font-medium text-gray-700">{mainInstallation?.reference || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Descripción</p>
                <p className="font-medium text-gray-700">{client.description || "N/A"}</p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2">
              <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full text-white font-medium"
                    onClick={handleOpenPaymentModal}
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Registrar Pago
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Registrar Nuevo Pago</DialogTitle>
                    <DialogDescription>
                      Complete los datos del pago para {client.name} {client.lastName}
                    </DialogDescription>
                  </DialogHeader>
                  <PaymentForm
                    onSubmit={handlePaymentSubmit}
                    onCancel={handleClosePaymentModal}
                    isLoading={false}
                    hideClientSelection={true} // Ocultar selección de cliente ya que está pre-seleccionado
                    preselectedClient={{
                      ...client,
                      plan: mainInstallation?.plan ? {
                        id: mainInstallation.plan.id,
                        name: mainInstallation.plan.name,
                        price: Number(mainInstallation.plan.price),
                        speed: mainInstallation.plan.speed,
                        description: mainInstallation.plan.description,
                        service: mainInstallation.plan.service,
                        created_at: mainInstallation.plan.created_at,
                        updated_at: mainInstallation.plan.updated_at
                      } : undefined
                    }}
                    payment={null} // Siempre null para nuevo pago
                  />
                </DialogContent>
              </Dialog>


            </div>

          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Historial de Pagos
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" /> Tickets de Soporte
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Ubicación
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <ComputerDesktopIcon className="h-4 w-4" /> Equipos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="border rounded-md p-4">
          <h3 className="text-xl font-semibold mb-2">Historial de Pagos</h3>
          <p className="text-muted-foreground mb-4">Registro de todos los pagos realizados por el cliente.</p>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha Pago</TableHead>
                  <TableHead>Fecha Vencimiento</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Referencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPaymentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <div className="flex justify-center">
                        <Skeleton className="h-6 w-6 rounded-full animate-spin" />
                      </div>
                      <p className="text-muted-foreground mt-2">Cargando pagos...</p>
                    </TableCell>
                  </TableRow>
                ) : payments.length > 0 ? (
                  payments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handlePaymentClick(payment)}
                    >
                      <TableCell className="font-medium">{payment.code || "-"}</TableCell>
                      <TableCell>
                        {payment.paymentDate
                          ? format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: es })
                          : "Pendiente"}
                      </TableCell>
                      <TableCell>
                        {payment.dueDate
                          ? format(new Date(payment.dueDate), "dd/MM/yyyy", { locale: es })
                          : "N/A"}
                      </TableCell>
                      <TableCell>S/ {Number(payment.amount).toFixed(2)}</TableCell>
                      <TableCell>{getPaymentTypeText(payment.paymentType || PaymentType.TRANSFER)}</TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStateVariant(payment.status)}>
                          {getPaymentStateText(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.reference || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No hay pagos registrados para este cliente.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="border rounded-md p-6">
          <h3 className="text-xl font-semibold mb-2">Tickets de Soporte</h3>
          <p className="text-muted-foreground">Esta funcionalidad estará disponible próximamente.</p>
        </TabsContent>

        <TabsContent value="location" className="border rounded-md p-6">
          <h3 className="text-xl font-semibold mb-2">Ubicación</h3>
          <p className="text-muted-foreground">Esta funcionalidad estará disponible próximamente.</p>
        </TabsContent>

        <TabsContent value="equipment" className="border rounded-md p-6">
          <h3 className="text-xl font-semibold mb-2">Equipos</h3>
          <p className="text-muted-foreground">Esta funcionalidad estará disponible próximamente.</p>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalles de Pago */}
      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          isOpen={isPaymentDetailModalOpen}
          onClose={handleClosePaymentDetailModal}
          onEdit={handleEditPayment}
        // onDelete={handleDeletePayment}
        />
      )}

      {/* Modal del visor de imagen */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent
          className="w-full max-w-6xl h-[90vh] p-0 overflow-hidden [&>button]:hidden"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <DialogHeader className="flex flex-row items-center justify-between p-6 border-b">
            <DialogTitle className="text-xl font-semibold">Imagen de Referencia</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={imageZoom <= 0.5}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {Math.round(imageZoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={imageZoom >= 3}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="h-8 w-8 p-0"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePanStart}
                className={`h-8 w-8 p-0 ${isPanning ? 'bg-purple-100 border-purple-600 text-purple-600' : ''}`}
              >
                <Hand className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetImageControls}
                className="h-8 px-3 text-xs"
              >
                Reset
              </Button>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImageModalClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="flex-1 h-[calc(90vh-80px)] overflow-hidden bg-gray-100">
            <div
              className="flex items-center justify-center w-full h-full"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              style={{ cursor: isPanning ? 'grab' : 'default' }}
            >
              <div
                className="relative rounded-lg overflow-hidden w-full"
                style={{
                  height: "100%",
                  // maxHeight: "calc(90vh - 120px)",
                  transform: `translate(${dragPosition.x}px, ${dragPosition.y}px) scale(${imageZoom}) rotate(${imageRotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease-in-out'
                }}
              >
                <div className="relative w-full h-full">
                  <ClientImageFill
                    imagePath={mainInstallation?.referenceImage}
                    alt="Imagen de Referencia del Cliente"
                    className="w-full h-full object-contain"
                    fallbackText={typeof mainInstallation?.referenceImage === 'string' && mainInstallation?.referenceImage ? '' : 'Sin imagen'}
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Visualizador de imagen de referencia del cliente con controles de zoom y rotación
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ClientDetailSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-8 w-48" />
        <div className="w-[100px]"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4 mb-6">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[ ...Array(6) ].map((_, i) => (
                <div key={i} className={i >= 4 ? "col-span-2" : ""}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[ ...Array(6) ].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
