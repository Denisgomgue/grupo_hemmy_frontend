"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, CreditCard, Ticket, MapPin, User as UserIcon } from "lucide-react"
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
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { PaymentForm } from "@/app/(main)/configuration/payment/_components/payment-form"
import { getAccountStatusLabel } from "@/utils/account-status-labels"
import { getClientPaymentStatusLabel } from "@/utils/client-payment-status-labels"
import { PaymentDetailModal } from "@/components/payment/payment-detail-modal"

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [ client, setClient ] = useState<Client | null>(null)
  const [ payments, setPayments ] = useState<Payment[]>([])
  const [ isLoading, setIsLoading ] = useState(true)
  const [ isPaymentsLoading, setIsPaymentsLoading ] = useState(true)
  const [ isPaymentModalOpen, setIsPaymentModalOpen ] = useState(false)
  const [ selectedPayment, setSelectedPayment ] = useState<Payment | null>(null)
  const [ isPaymentDetailModalOpen, setIsPaymentDetailModalOpen ] = useState(false)

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

  // Handler para abrir el modal de pago
  const handleOpenPaymentModal = () => setIsPaymentModalOpen(true)
  const handleClosePaymentModal = () => setIsPaymentModalOpen(false)

  // Handler para registrar el pago (puedes agregar lógica de recarga de pagos aquí)
  const handlePaymentSubmit = async (data: any) => {
    try {
      await api.post('/payments', data)
      setIsPaymentModalOpen(false)
      await fetchClientPayments()
      await fetchClientData()
      toast({
        title: "Pago registrado",
        description: "El pago se guardó correctamente.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el pago.",
        variant: "destructive",
      })
    }
  }

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsPaymentDetailModalOpen(true)
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
    return getPaymentStatusLabel(state)
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-muted-foreground" /> Información Personal
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="h-16 w-16 text-2xl">
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">
                  {client.name} {client.lastName}
                </h3>
                <p className="text-muted-foreground">{client.dni}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{client.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(client.status)}>
                    {getAccountStatusLabel(client.status)}
                  </Badge>
                  <Badge variant={getPaymentStatusVariant(client.paymentStatus)}>
                    {getClientPaymentStatusLabel(client.paymentStatus)}
                  </Badge>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Dirección</p>
                <p className="font-medium">{client.address || "Sin dirección registrada"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sector</p>
                <p className="font-medium">{client.sector?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Renta</p>
                <p className="font-medium">{client.advancePayment ? "Adelantada" : "Pendiente"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Information Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" /> Información del Servicio
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Servicio</p>
                <p className="font-medium flex items-center gap-2">{client.plan?.service?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Velocidad</p>
                <p className="font-medium">{client.plan?.speed || "N/A"} Mbps</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Instalación</p>
                <p className="font-medium">
                  {client.installationDate
                    ? format(new Date(client.installationDate), "dd/MM/yyyy", { locale: es })
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximo Pago</p>
                <p className="font-medium">
                  {client.paymentDate ? format(new Date(client.paymentDate), "dd/MM/yyyy", { locale: es }) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium">{client.plan?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precio Mensual</p>
                <p className="font-medium">S/ {client.plan?.price || "0.00"}</p>
              </div>
            </div>

            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" onClick={handleOpenPaymentModal}>
                  <CreditCard className="mr-2 h-4 w-4" /> Registrar Pago
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Registrar Pago</DialogTitle>
                <PaymentForm
                  onSubmit={handlePaymentSubmit}
                  onCancel={handleClosePaymentModal}
                  isLoading={false}
                  payment={{
                    client: { id: client.id },
                    amount: client.plan?.price || 0,
                  } as any}
                />
              </DialogContent>
            </Dialog>
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
                      <TableCell className="font-medium">PAG-{payment.id.toString().padStart(4, '0')}</TableCell>
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
                      <TableCell>{getPaymentTypeText(payment.paymentType)}</TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStateVariant(payment.state)}>
                          {getPaymentStateText(payment.state)}
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
      </Tabs>

      <PaymentDetailModal
        payment={selectedPayment}
        isOpen={isPaymentDetailModalOpen}
        onClose={() => setIsPaymentDetailModalOpen(false)}
      />
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
