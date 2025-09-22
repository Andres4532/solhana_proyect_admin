"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Clock, Pause, Play, Save, Bell } from "lucide-react"

export function SettingsSection() {
  const [businessInfo, setBusinessInfo] = useState({
    name: "Mi Restaurante",
    address: "Av. Reforma 123, Col. Centro, CDMX",
    phone: "+52 555 123 4567",
    email: "contacto@mirestaurante.com",
    description: "Restaurante especializado en comida rápida y saludable",
  })

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: "09:00", close: "22:00", closed: false },
    tuesday: { open: "09:00", close: "22:00", closed: false },
    wednesday: { open: "09:00", close: "22:00", closed: false },
    thursday: { open: "09:00", close: "22:00", closed: false },
    friday: { open: "09:00", close: "23:00", closed: false },
    saturday: { open: "10:00", close: "23:00", closed: false },
    sunday: { open: "10:00", close: "21:00", closed: false },
  })

  const [pauseSettings, setPauseSettings] = useState({
    isPaused: false,
    pauseDuration: 30,
    pauseReason: "",
    resumeTime: "",
  })

  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderUpdates: true,
    lowStock: true,
    dailyReports: false,
  })

  const dayNames = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  }

  const pauseDurations = [
    { value: 5, label: "5 minutos" },
    { value: 10, label: "10 minutos" },
    { value: 15, label: "15 minutos" },
    { value: 30, label: "30 minutos" },
    { value: 60, label: "1 hora" },
    { value: 120, label: "2 horas" },
  ]

  const handlePauseBusiness = () => {
    const resumeTime = new Date()
    resumeTime.setMinutes(resumeTime.getMinutes() + pauseSettings.pauseDuration)

    setPauseSettings({
      ...pauseSettings,
      isPaused: true,
      resumeTime: resumeTime.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })
  }

  const handleResumeBusiness = () => {
    setPauseSettings({
      ...pauseSettings,
      isPaused: false,
      resumeTime: "",
    })
  }

  const updateOperatingHours = (day: string, field: string, value: any) => {
    setOperatingHours({
      ...operatingHours,
      [day]: {
        ...operatingHours[day as keyof typeof operatingHours],
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de tu negocio</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Información del Negocio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Información del Negocio
            </CardTitle>
            <CardDescription>Actualiza los datos básicos de tu restaurante</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="business-name">Nombre del Negocio</Label>
              <Input
                id="business-name"
                value={businessInfo.name}
                onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="business-address">Dirección</Label>
              <Textarea
                id="business-address"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business-phone">Teléfono</Label>
                <Input
                  id="business-phone"
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="business-email">Email</Label>
                <Input
                  id="business-email"
                  type="email"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="business-description">Descripción</Label>
              <Textarea
                id="business-description"
                value={businessInfo.description}
                onChange={(e) => setBusinessInfo({ ...businessInfo, description: e.target.value })}
                rows={3}
              />
            </div>
            <Button className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Guardar Información
            </Button>
          </CardContent>
        </Card>

        {/* Control de Pausa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {pauseSettings.isPaused ? (
                <Pause className="h-5 w-5 text-red-500" />
              ) : (
                <Play className="h-5 w-5 text-green-500" />
              )}
              Control de Pausa
            </CardTitle>
            <CardDescription>Pausa temporalmente tu negocio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Estado del Negocio</h4>
                <p className="text-sm text-muted-foreground">
                  {pauseSettings.isPaused
                    ? `Pausado hasta las ${pauseSettings.resumeTime}`
                    : "Activo y recibiendo pedidos"}
                </p>
              </div>
              <Badge variant={pauseSettings.isPaused ? "destructive" : "default"}>
                {pauseSettings.isPaused ? "Pausado" : "Activo"}
              </Badge>
            </div>

            {!pauseSettings.isPaused ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pause-duration">Duración de la Pausa</Label>
                  <Select
                    value={pauseSettings.pauseDuration.toString()}
                    onValueChange={(value) =>
                      setPauseSettings({
                        ...pauseSettings,
                        pauseDuration: Number.parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pauseDurations.map((duration) => (
                        <SelectItem key={duration.value} value={duration.value.toString()}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pause-reason">Motivo (Opcional)</Label>
                  <Input
                    id="pause-reason"
                    value={pauseSettings.pauseReason}
                    onChange={(e) =>
                      setPauseSettings({
                        ...pauseSettings,
                        pauseReason: e.target.value,
                      })
                    }
                    placeholder="Ej: Descanso del personal"
                  />
                </div>
                <Button variant="destructive" className="w-full" onClick={handlePauseBusiness}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar Negocio
                </Button>
              </div>
            ) : (
              <Button variant="default" className="w-full" onClick={handleResumeBusiness}>
                <Play className="h-4 w-4 mr-2" />
                Reanudar Negocio
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Horarios de Operación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios de Operación
          </CardTitle>
          <CardDescription>Configura los horarios de atención de tu negocio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(operatingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-24">
                  <Label className="font-medium">{dayNames[day as keyof typeof dayNames]}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!hours.closed}
                    onCheckedChange={(checked) => updateOperatingHours(day, "closed", !checked)}
                  />
                  <span className="text-sm text-muted-foreground">{hours.closed ? "Cerrado" : "Abierto"}</span>
                </div>
                {!hours.closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Abre:</Label>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateOperatingHours(day, "open", e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Cierra:</Label>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateOperatingHours(day, "close", e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <Button className="w-full mt-4">
            <Save className="h-4 w-4 mr-2" />
            Guardar Horarios
          </Button>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>Configura qué notificaciones deseas recibir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Nuevos Pedidos</Label>
              <p className="text-sm text-muted-foreground">Recibe notificaciones cuando lleguen nuevos pedidos</p>
            </div>
            <Switch
              checked={notifications.newOrders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, newOrders: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Actualizaciones de Pedidos</Label>
              <p className="text-sm text-muted-foreground">Notificaciones sobre cambios en el estado de pedidos</p>
            </div>
            <Switch
              checked={notifications.orderUpdates}
              onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Stock Bajo</Label>
              <p className="text-sm text-muted-foreground">Alertas cuando los productos estén por agotarse</p>
            </div>
            <Switch
              checked={notifications.lowStock}
              onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Reportes Diarios</Label>
              <p className="text-sm text-muted-foreground">Resumen diario de ventas y estadísticas</p>
            </div>
            <Switch
              checked={notifications.dailyReports}
              onCheckedChange={(checked) => setNotifications({ ...notifications, dailyReports: checked })}
            />
          </div>
          <Button className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Guardar Preferencias
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
