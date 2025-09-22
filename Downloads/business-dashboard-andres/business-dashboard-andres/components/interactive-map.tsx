"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, RotateCcw, Calculator } from "lucide-react"

interface Coordinates {
  lat: number
  lng: number
}

interface InteractiveMapProps {
  onLocationSelect: (pickup: Coordinates, delivery: Coordinates, distance: number, price: number) => void
}

export function InteractiveMap({ onLocationSelect }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [pickupCoords, setPickupCoords] = useState<Coordinates>({ lat: 0, lng: 0 })
  const [deliveryCoords, setDeliveryCoords] = useState<Coordinates>({ lat: 0, lng: 0 })
  const [isSelectingPickup, setIsSelectingPickup] = useState(false)
  const [isSelectingDelivery, setIsSelectingDelivery] = useState(false)
  const [mapCenter] = useState<Coordinates>({ lat: -16.5, lng: -68.1193 }) // La Paz, Bolivia
  const [distance, setDistance] = useState(0)
  const [price, setPrice] = useState(0)

  // Configuración de precios en bolivianos
  const PRICE_CONFIG = {
    baseFare: 8.0, // Tarifa base en Bs
    pricePerKm: 3.0, // Precio por kilómetro en Bs
    minimumFare: 10.0, // Tarifa mínima en Bs
  }

  // Calcular distancia usando fórmula de Haversine
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
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
  const calculatePrice = (distanceKm: number): number => {
    const calculatedPrice = PRICE_CONFIG.baseFare + distanceKm * PRICE_CONFIG.pricePerKm
    return Math.max(calculatedPrice, PRICE_CONFIG.minimumFare)
  }

  // Convertir coordenadas de pixel a lat/lng
  const pixelToCoords = (x: number, y: number, rect: DOMRect): Coordinates => {
    // Simulamos un área de aproximadamente 20km x 20km centrada en La Paz
    const mapWidth = rect.width
    const mapHeight = rect.height

    // Convertir pixel a coordenadas relativas (-1 a 1)
    const relativeX = (x - mapWidth / 2) / (mapWidth / 2)
    const relativeY = (y - mapHeight / 2) / (mapHeight / 2)

    // Convertir a coordenadas geográficas (aproximadamente 0.1 grados = ~11km)
    const lat = mapCenter.lat - relativeY * 0.05 // Invertido porque Y aumenta hacia abajo
    const lng = mapCenter.lng + relativeX * 0.05

    return { lat, lng }
  }

  // Convertir lat/lng a coordenadas de pixel
  const coordsToPixel = (coords: Coordinates, rect: DOMRect) => {
    const relativeX = (coords.lng - mapCenter.lng) / 0.05
    const relativeY = -(coords.lat - mapCenter.lat) / 0.05 // Invertido

    const x = rect.width / 2 + relativeX * (rect.width / 2)
    const y = rect.height / 2 + relativeY * (rect.height / 2)

    return { x, y }
  }

  // Manejar click en el mapa
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const coords = pixelToCoords(x, y, rect)

    if (isSelectingPickup) {
      setPickupCoords(coords)
      setIsSelectingPickup(false)
    } else if (isSelectingDelivery) {
      setDeliveryCoords(coords)
      setIsSelectingDelivery(false)
    }
  }

  // Calcular distancia y precio cuando cambien las coordenadas
  useEffect(() => {
    if (pickupCoords.lat !== 0 && deliveryCoords.lat !== 0) {
      const dist = calculateDistance(pickupCoords.lat, pickupCoords.lng, deliveryCoords.lat, deliveryCoords.lng)
      const calculatedPrice = calculatePrice(dist)

      setDistance(dist)
      setPrice(calculatedPrice)

      // Notificar al componente padre
      onLocationSelect(pickupCoords, deliveryCoords, dist, calculatedPrice)
    }
  }, [pickupCoords, deliveryCoords, onLocationSelect])

  const resetMap = () => {
    setPickupCoords({ lat: 0, lng: 0 })
    setDeliveryCoords({ lat: 0, lng: 0 })
    setDistance(0)
    setPrice(0)
    setIsSelectingPickup(false)
    setIsSelectingDelivery(false)
  }

  const startSelectingPickup = () => {
    setIsSelectingPickup(true)
    setIsSelectingDelivery(false)
  }

  const startSelectingDelivery = () => {
    setIsSelectingDelivery(true)
    setIsSelectingPickup(false)
  }

  return (
    <div className="space-y-4">
      {/* Controles del Mapa */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isSelectingPickup ? "default" : "outline"}
          size="sm"
          onClick={startSelectingPickup}
          className={isSelectingPickup ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <MapPin className="h-4 w-4 mr-2 text-green-500" />
          {isSelectingPickup ? "Seleccionando Origen..." : "Seleccionar Origen"}
        </Button>

        <Button
          variant={isSelectingDelivery ? "default" : "outline"}
          size="sm"
          onClick={startSelectingDelivery}
          className={isSelectingDelivery ? "bg-red-600 hover:bg-red-700" : ""}
        >
          <MapPin className="h-4 w-4 mr-2 text-red-500" />
          {isSelectingDelivery ? "Seleccionando Destino..." : "Seleccionar Destino"}
        </Button>

        <Button variant="outline" size="sm" onClick={() => console.log("Centrar en Bolivia")}>
          <Navigation className="h-4 w-4 mr-2" />
          Centrar
        </Button>

        <Button variant="outline" size="sm" onClick={resetMap}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      </div>

      {/* Instrucciones */}
      <div className="text-sm">
        {isSelectingPickup && (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <MapPin className="h-4 w-4" />
            Haz clic en el mapa para seleccionar el punto de ORIGEN
          </div>
        )}
        {isSelectingDelivery && (
          <div className="flex items-center gap-2 text-red-600 font-medium">
            <MapPin className="h-4 w-4" />
            Haz clic en el mapa para seleccionar el punto de DESTINO
          </div>
        )}
        {!isSelectingPickup && !isSelectingDelivery && (
          <div className="text-muted-foreground">
            Selecciona "Origen" o "Destino" y luego haz clic en el mapa para marcar la ubicación
          </div>
        )}
      </div>

      {/* Mapa Interactivo */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={mapRef}
            className={`h-96 w-full relative overflow-hidden rounded-lg bg-gradient-to-br from-green-50 to-blue-50 ${
              isSelectingPickup || isSelectingDelivery ? "cursor-crosshair" : "cursor-default"
            } border-2 ${
              isSelectingPickup ? "border-green-400" : isSelectingDelivery ? "border-red-400" : "border-gray-200"
            }`}
            onClick={handleMapClick}
          >
            {/* Fondo del mapa con calles simuladas */}
            <div className="absolute inset-0">
              {/* Fondo base */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-100 to-yellow-100 opacity-30"></div>

              {/* Grid de calles */}
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                  <pattern id="streets" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#64748b" strokeWidth="1" />
                    <path d="M 30 0 L 30 60 M 0 30 L 60 30" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#streets)" />
              </svg>

              {/* Elementos del mapa (edificios, parques) */}
              <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-gray-300 rounded opacity-40"></div>
              <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-green-300 rounded-full opacity-40"></div>
              <div className="absolute bottom-1/4 left-1/3 w-10 h-6 bg-blue-300 rounded opacity-40"></div>
              <div className="absolute bottom-1/3 right-1/4 w-4 h-8 bg-gray-400 rounded opacity-40"></div>
            </div>

            {/* Marcador de Origen */}
            {pickupCoords.lat !== 0 && mapRef.current && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-full z-20"
                style={{
                  left: `${coordsToPixel(pickupCoords, mapRef.current.getBoundingClientRect()).x}px`,
                  top: `${coordsToPixel(pickupCoords, mapRef.current.getBoundingClientRect()).y}px`,
                }}
              >
                <div className="bg-green-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="bg-white text-xs p-2 rounded shadow-lg mt-1 whitespace-nowrap border">
                  <div className="font-semibold text-green-600">ORIGEN</div>
                  <div className="text-gray-600">{pickupCoords.lat.toFixed(6)}</div>
                  <div className="text-gray-600">{pickupCoords.lng.toFixed(6)}</div>
                </div>
              </div>
            )}

            {/* Marcador de Destino */}
            {deliveryCoords.lat !== 0 && mapRef.current && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-full z-20"
                style={{
                  left: `${coordsToPixel(deliveryCoords, mapRef.current.getBoundingClientRect()).x}px`,
                  top: `${coordsToPixel(deliveryCoords, mapRef.current.getBoundingClientRect()).y}px`,
                }}
              >
                <div className="bg-red-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="bg-white text-xs p-2 rounded shadow-lg mt-1 whitespace-nowrap border">
                  <div className="font-semibold text-red-600">DESTINO</div>
                  <div className="text-gray-600">{deliveryCoords.lat.toFixed(6)}</div>
                  <div className="text-gray-600">{deliveryCoords.lng.toFixed(6)}</div>
                </div>
              </div>
            )}

            {/* Línea de ruta */}
            {pickupCoords.lat !== 0 && deliveryCoords.lat !== 0 && mapRef.current && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <line
                  x1={coordsToPixel(pickupCoords, mapRef.current.getBoundingClientRect()).x}
                  y1={coordsToPixel(pickupCoords, mapRef.current.getBoundingClientRect()).y}
                  x2={coordsToPixel(deliveryCoords, mapRef.current.getBoundingClientRect()).x}
                  y2={coordsToPixel(deliveryCoords, mapRef.current.getBoundingClientRect()).y}
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeDasharray="8,4"
                  className="animate-pulse"
                />
              </svg>
            )}

            {/* Etiqueta central del mapa */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg text-center border">
                <h3 className="font-semibold text-slate-700 mb-1">La Paz, Bolivia</h3>
                <p className="text-xs text-slate-500">Mapa Interactivo</p>
                {distance > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="text-blue-600 font-medium">{distance.toFixed(2)} km</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de Coordenadas y Precio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Origen */}
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <h4 className="font-semibold text-green-700">Origen</h4>
            </div>
            {pickupCoords.lat !== 0 ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lat:</span>
                  <Badge variant="outline" className="text-xs">
                    {pickupCoords.lat.toFixed(6)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lng:</span>
                  <Badge variant="outline" className="text-xs">
                    {pickupCoords.lng.toFixed(6)}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No seleccionado</p>
            )}
          </CardContent>
        </Card>

        {/* Destino */}
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <h4 className="font-semibold text-red-700">Destino</h4>
            </div>
            {deliveryCoords.lat !== 0 ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lat:</span>
                  <Badge variant="outline" className="text-xs">
                    {deliveryCoords.lat.toFixed(6)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lng:</span>
                  <Badge variant="outline" className="text-xs">
                    {deliveryCoords.lng.toFixed(6)}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No seleccionado</p>
            )}
          </CardContent>
        </Card>

        {/* Precio Calculado */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              <h4 className="font-semibold text-blue-700">Precio</h4>
            </div>
            {distance > 0 ? (
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-800">Bs. {price.toFixed(2)}</div>
                <div className="text-xs text-blue-600">
                  {distance.toFixed(2)} km • {Math.ceil(distance * 8 + 10)} min
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Selecciona ambos puntos</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Desglose de Precio */}
      {distance > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-green-800 mb-3">Desglose del Precio</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tarifa base:</span>
                <span>Bs. {PRICE_CONFIG.baseFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Distancia ({distance.toFixed(2)} km × Bs. {PRICE_CONFIG.pricePerKm}):
                </span>
                <span>Bs. {(distance * PRICE_CONFIG.pricePerKm).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>Bs. {price.toFixed(2)}</span>
              </div>
              {price === PRICE_CONFIG.minimumFare && (
                <div className="text-xs text-green-600 italic">
                  * Se aplicó la tarifa mínima de Bs. {PRICE_CONFIG.minimumFare}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
