"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MapPin, X, Clock, Bike, Phone, User, Camera } from "lucide-react"
import { InteractiveMap } from "./interactive-map"

interface MotoRequest {
  id: string
  pickupAddress: string
  deliveryAddress: string
  pickupCoords: { lat: number; lng: number }
  deliveryCoords: { lat: number; lng: number }
  distance: number
  price: number
  customerName: string
  customerPhone: string
  description: string
  photos: string[]
  status: "pending" | "assigned" | "pickup" | "delivery" | "completed" | "cancelled"
  createdAt: string
  estimatedTime: string
  driverName?: string
  driverPhone?: string
}

export function MotoSection() {
  const [motoRequests, setMotoRequests] = useState<MotoRequest[]>([
    {
      id: "MOTO-001",
      pickupAddress: "Av. 16 de Julio 1234, La Paz",
      deliveryAddress: "Calle Comercio 567, La Paz",
      pickupCoords: { lat: -16.5, lng: -68.1193 },
      deliveryCoords: { lat: -16.504, lng: -68.115 },
      distance: 2.5,
      price: 15.0,
      customerName: "María González",
      customerPhone: "+591 70123456",
      description: "Entrega de documentos urgentes",
      photos: [],
      status: "assigned",
      createdAt: "2024-01-15 14:30",
      estimatedTime: "20 min",
      driverName: "Carlos Mamani",
      driverPhone: "+591 71234567",
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newRequest, setNewRequest] = useState({
    pickupAddress: "",
    deliveryAddress: "",
    pickupCoords: { lat: 0, lng: 0 },
    deliveryCoords: { lat: 0, lng: 0 },
    customerName: "",
    customerPhone: "",
    description: "",
    photos: [] as string[],
  })

  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [calculatedDistance, setCalculatedDistance] = useState(0)

  // Precios base en bolivianos
  const PRICE_CONFIG = {
    baseFare: 8.0, // Tarifa base
    pricePerKm: 3.0, // Precio por kilómetro
    minimumFare: 10.0, // Tarifa mínima
  }

  // Calcular distancia usando fórmula de Haversine
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLng = (lng2 - lng1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Calcular precio basado en distancia
  const calculatePrice = (distance: number) => {
    const price = PRICE_CONFIG.baseFare + distance * PRICE_CONFIG.pricePerKm
    return Math.max(price, PRICE_CONFIG.minimumFare)
  }

  // Simular geocodificación de direcciones
  const geocodeAddress = async (address: string) => {
    // En una aplicación real, usarías un servicio de geocodificación
    // Por ahora, simulamos con coordenadas aleatorias en La Paz
    const baseLat = -16.5
    const baseLng = -68.1193
    const randomLat = baseLat + (Math.random() - 0.5) * 0.02
    const randomLng = baseLng + (Math.random() - 0.5) * 0.02
    return { lat: randomLat, lng: randomLng }
  }

  // Manejar subida de fotos
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const remainingSlots = 3 - selectedPhotos.length

    if (files.length > remainingSlots) {
      alert(`Solo puedes subir ${remainingSlots} foto(s) más`)
      return
    }

    setSelectedPhotos([...selectedPhotos, ...files.slice(0, remainingSlots)])
  }

  // Remover foto
  const removePhoto = (index: number) => {
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index))
  }

  // Crear solicitud de moto
  const handleCreateRequest = () => {
    if (
      newRequest.pickupCoords.lat !== 0 &&
      newRequest.deliveryCoords.lat !== 0 &&
      newRequest.customerName &&
      newRequest.customerPhone
    ) {
      const request: MotoRequest = {
        id: `MOTO-${String(motoRequests.length + 1).padStart(3, "0")}`,
        ...newRequest,
        distance: calculatedDistance,
        price: calculatedPrice,
        photos: selectedPhotos.map((file) => URL.createObjectURL(file)), // En producción, subirías a un servidor
        status: "pending",
        createdAt: new Date().toLocaleString("es-BO"),
        estimatedTime: `${Math.ceil(calculatedDistance * 8 + 10)} min`, // Estimación simple
      }

      setMotoRequests([...motoRequests, request])
      setNewRequest({
        pickupAddress: "",
        deliveryAddress: "",
        pickupCoords: { lat: 0, lng: 0 },
        deliveryCoords: { lat: 0, lng: 0 },
        customerName: "",
        customerPhone: "",
        description: "",
        photos: [],
      })
      setSelectedPhotos([])
      setCalculatedPrice(0)
      setCalculatedDistance(0)
      setIsCreateDialogOpen(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "destructive" as const },
      assigned: { label: "Asignado", variant: "secondary" as const },
      pickup: { label: "Recogiendo", variant: "default" as const },
      delivery: { label: "En Entrega", variant: "default" as const },
      completed: { label: "Completado", variant: "outline" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const updateRequestStatus = (requestId: string, newStatus: MotoRequest["status"]) => {
    setMotoRequests(
      motoRequests.map((request) => (request.id === requestId ? { ...request, status: newStatus } : request)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Solicitar Moto</h1>
          <p className="text-muted-foreground">Gestiona solicitudes de delivery y mensajería</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Bike className="h-4 w-4 mr-2" />
              Nueva Solicitud
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Solicitar Servicio de Moto</DialogTitle>
              <DialogDescription>Completa los datos para solicitar un servicio de delivery</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Información del Cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer-name">Nombre Completo</Label>
                    <Input
                      id="customer-name"
                      value={newRequest.customerName}
                      onChange={(e) => setNewRequest({ ...newRequest, customerName: e.target.value })}
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-phone">Teléfono</Label>
                    <Input
                      id="customer-phone"
                      value={newRequest.customerPhone}
                      onChange={(e) => setNewRequest({ ...newRequest, customerPhone: e.target.value })}
                      placeholder="+591 70123456"
                    />
                  </div>
                </div>
              </div>

              {/* Ubicaciones */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ubicaciones</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pickup-address">Dirección de Recojo</Label>
                    <div className="flex gap-2">
                      <MapPin className="h-5 w-5 text-green-500 mt-2" />
                      <Textarea
                        id="pickup-address"
                        value={newRequest.pickupAddress}
                        onChange={(e) => setNewRequest({ ...newRequest, pickupAddress: e.target.value })}
                        placeholder="Ej: Av. 16 de Julio 1234, La Paz"
                        rows={2}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="delivery-address">Dirección de Entrega</Label>
                    <div className="flex gap-2">
                      <MapPin className="h-5 w-5 text-red-500 mt-2" />
                      <Textarea
                        id="delivery-address"
                        value={newRequest.deliveryAddress}
                        onChange={(e) => setNewRequest({ ...newRequest, deliveryAddress: e.target.value })}
                        placeholder="Ej: Calle Comercio 567, La Paz"
                        rows={2}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Mapa Interactivo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Seleccionar Ubicaciones en el Mapa</h3>
                  <InteractiveMap
                    onLocationSelect={(pickup, delivery, distance, price) => {
                      setNewRequest({
                        ...newRequest,
                        pickupCoords: pickup,
                        deliveryCoords: delivery,
                      })
                      setCalculatedDistance(Number.parseFloat(distance.toFixed(2)))
                      setCalculatedPrice(Number.parseFloat(price.toFixed(2)))
                    }}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <Label htmlFor="description">Descripción del Envío (Opcional)</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Describe qué se va a enviar, instrucciones especiales, etc."
                  rows={3}
                />
              </div>

              {/* Subida de Fotos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Fotos del Envío (Máximo 3)</Label>
                  <Badge variant="outline">{selectedPhotos.length}/3</Badge>
                </div>

                {/* Área de subida */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                    disabled={selectedPhotos.length >= 3}
                  />
                  <label
                    htmlFor="photo-upload"
                    className={`cursor-pointer ${selectedPhotos.length >= 3 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Camera className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600">
                      {selectedPhotos.length >= 3 ? "Máximo de fotos alcanzado" : "Haz clic para subir fotos"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG hasta 5MB cada una</p>
                  </label>
                </div>

                {/* Preview de fotos */}
                {selectedPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {selectedPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo) || "/placeholder.svg"}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRequest} disabled={calculatedPrice === 0}>
                Solicitar Moto - Bs. {calculatedPrice.toFixed(2)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{motoRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {motoRequests.filter((r) => ["assigned", "pickup", "delivery"].includes(r.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {motoRequests.filter((r) => r.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Bs.{" "}
              {motoRequests
                .filter((r) => r.status === "completed")
                .reduce((sum, r) => sum + r.price, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Solicitudes */}
      <div className="space-y-4">
        {motoRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {request.id}
                    {getStatusBadge(request.status)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {request.createdAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ETA: {request.estimatedTime}
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">Bs. {request.price.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">{request.distance} km</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Información del Cliente */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Cliente</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {request.customerName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {request.customerPhone}
                    </div>
                  </div>

                  {request.driverName && (
                    <div className="space-y-2 pt-2 border-t">
                      <h5 className="font-medium text-sm">Conductor Asignado</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {request.driverName}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {request.driverPhone}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ubicaciones */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Ruta</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Recojo:</p>
                        <p className="text-muted-foreground">{request.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Entrega:</p>
                        <p className="text-muted-foreground">{request.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {request.description && (
                <div className="border-t pt-3">
                  <h4 className="font-semibold text-sm mb-2">Descripción:</h4>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                </div>
              )}

              {/* Fotos */}
              {request.photos.length > 0 && (
                <div className="border-t pt-3">
                  <h4 className="font-semibold text-sm mb-2">Fotos del Envío:</h4>
                  <div className="flex gap-2">
                    {request.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo || "/placeholder.svg"}
                        alt={`Foto ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(photo, "_blank")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="border-t pt-3 flex gap-2">
                <Select
                  value={request.status}
                  onValueChange={(value: MotoRequest["status"]) => updateRequestStatus(request.id, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="assigned">Asignado</SelectItem>
                    <SelectItem value="pickup">Recogiendo</SelectItem>
                    <SelectItem value="delivery">En Entrega</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  Ver en Mapa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {motoRequests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Bike className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay solicitudes de moto</p>
            <p className="text-sm text-muted-foreground mt-2">Crea tu primera solicitud de delivery</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
