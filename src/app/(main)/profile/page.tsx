"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, PencilIcon, SaveIcon } from "lucide-react"
import { useState } from "react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    phone: user?.phone || "",
    email: user?.email || "",
    username: user?.username || "",
  })
  const router = useRouter()

  const handlePasswordChange = async () => {
    if (showPasswords.newPassword !== showPasswords.confirmPassword) {
      toast.warning("Las contraseñas no coinciden")
      return
    }

    try {
      if (!user) {
        toast.error("User is not logged in")
        return
      }

      const response = await api.patch(`/user/${user.id}/change-password`, {
        currentPassword: showPasswords.currentPassword,
        newPassword: showPasswords.newPassword,
      })

      if (response.status === 200) {
        toast.success("Contraseña cambiada exitosamente")
        setIsOpen(false)
        setShowPasswords({
          current: false,
          new: false,
          confirm: false,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        await logout()
      }
    } catch (error) {
      toast.error("Error al cambiar la contraseña")
      console.error("Error al cambiar la contraseña:", error)
    }
  }

  const handleEdit = async () => {
    if (isEditing) {
      try {
        if (!user) {
          toast.error("User is not logged in")
          return
        }

        const response = await api.patch(`/user/${user.id}`, editedUser)
        if (response.status === 200) {
          toast.success("Perfil actualizado exitosamente")
          router.refresh() // Refresh the page
        }
      } catch (error) {
        toast.error("Error al actualizar el perfil")
        console.error("Error al actualizar el perfil:", error)
      }
    }
    setIsEditing(!isEditing)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <Card className="max-w-md mx-auto dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Perfil de Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <h1 className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
          Por favor inicia sesión para ver tu perfil
        </h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:h-auto">
      <Card className="max-w-md mx-auto shadow-lg dark:bg-gray-800">
        <CardContent className="text-center p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Perfil de Usuario</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
            >
              {isEditing ? (
                <SaveIcon size={20} className="text-green-600 dark:text-green-400" />
              ) : (
                <PencilIcon size={20} />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-center">
            <Avatar className="h-20 w-20">
              {user && user.name ? (
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${user.name}+${user.surname}&background=random`}
                  alt={`${user.name} ${user.surname}`}
                />
              ) : (
                <AvatarFallback>{user ? user.email.charAt(0).toUpperCase() : "U"}</AvatarFallback>
              )}
            </Avatar>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            {editedUser.name} {editedUser.surname}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">@{editedUser.username || "username"}</p>

          <div className="mt-6 text-left">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Sobre mí:</h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Hola, soy {editedUser.name} {editedUser.surname}, una empresa de internet apasionada por la tecnología.
              {editedUser.phone && ` Puedes contactarme al ${editedUser.phone}.`}
              Mi correo electrónico es {editedUser.email}. Siempre estoy instando a la gente a que se conecte a la red.
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <strong className="text-gray-900 dark:text-gray-100 w-40">Nombre:</strong>
                {isEditing ? (
                  <Input
                    value={editedUser.name}
                    onChange={(e) => setEditedUser((prev) => ({ ...prev, name: e.target.value }))}
                    className="flex-grow"
                  />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">{editedUser.name}</span>
                )}
              </div>
              <div className="flex items-center mt-2">
                <strong className="text-gray-900 dark:text-gray-100 w-40">Apellido:</strong>
                {isEditing ? (
                  <Input
                    value={editedUser.surname}
                    onChange={(e) => setEditedUser((prev) => ({ ...prev, surname: e.target.value }))}
                    className="flex-grow"
                  />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">{editedUser.surname}</span>
                )}
              </div>
              <div className="flex items-center">
                <strong className="text-gray-900 dark:text-gray-100 w-40">Celular:</strong>
                {isEditing ? (
                  <Input
                    value={editedUser.phone}
                    onChange={(e) => setEditedUser((prev) => ({ ...prev, phone: e.target.value }))}
                    className="flex-grow"
                  />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {editedUser.phone !== null ? `(+51) ${editedUser.phone}` : "N/A"}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <strong className="text-gray-900 dark:text-gray-100 w-40">Correo Electrónico:</strong>
                {isEditing ? (
                  <Input
                    value={editedUser.email}
                    onChange={(e) => setEditedUser((prev) => ({ ...prev, email: e.target.value }))}
                    className="flex-grow"
                  />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">{editedUser.email}</span>
                )}
              </div>
              <div className="flex items-center">
                <strong className="text-gray-900 dark:text-gray-100 w-40">Username:</strong>
                {isEditing ? (
                  <Input
                    value={editedUser.username}
                    onChange={(e) => setEditedUser((prev) => ({ ...prev, username: e.target.value }))}
                    className="flex-grow"
                  />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">@{editedUser.username}</span>
                )}
              </div>
              <div className="flex items-center">
                <strong className="text-gray-900 dark:text-gray-100 w-40">Perfil:</strong>
                <span className="text-sm text-gray-600 dark:text-gray-400">{user.role?.name}</span>
              </div>
            </div>
          </div>
          {!isEditing && (
            <div className="flex justify-end mt-4">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm bg-red-700 text-white hover:bg-red-600">
                    Cambiar Contraseña
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-gray-100 dark:bg-black">
                  <DialogHeader>
                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 ">
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">Contraseña Actual</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPasswords.current ? "text" : "password"}
                          value={showPasswords.currentPassword}
                          onChange={(e) =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.current ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">Contraseña Nueva</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPasswords.new ? "text" : "password"}
                          value={showPasswords.newPassword}
                          onChange={(e) =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.new ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirmar Contraseña Nueva</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={showPasswords.confirmPassword}
                          onChange={(e) =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.confirm ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handlePasswordChange}>Guardar Cambios</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}