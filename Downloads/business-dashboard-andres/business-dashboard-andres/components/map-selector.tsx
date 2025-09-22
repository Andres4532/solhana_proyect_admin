"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, RotateCcw } from "lucide-react"

interface Coordinates {
  lat: number
  lng: number
}

interface MapSelectorProps {
  pickupCoords: Coordinates
  deliveryCoords: Coordinates
  onPickupChange: (coords: Coordinates) => void
  onDeliveryChange: (coords: Coordinates) => void
  onDistanceCalculated: (distance: number) => void
}

export function MapSelector({
  pickupCoords,
  deliveryCoords,
  onPickupChange,
  onDeliveryChange,
  onDistanceCalculated,
}: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isSelectingPickup, setIsSelectingPickup] = useState(false)
  const [isSelectingDelivery, setIsSelectingDelivery] = useState(false)
  const [pickupMarker, setPickupMarker] = useState<any>(null)
  const [deliveryMarker, setDeliveryMarker] = useState<any>(null)
  const [routeLine, setRouteLine] = useState<any>(null)

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

  // Inicializar mapa
  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !map) {
      // Simulamos Leaflet con un mapa interactivo personalizado
      initializeMap()
    }
  }, [])

  const initializeMap = () => {
    const mapContainer = mapRef.current
    if (!mapContainer) return

    // Crear un mapa simulado interactivo
    const mapInstance = {
      container: mapContainer,
      center: { lat: -16.5, lng: -68.1193 }, // La Paz, Bolivia
      zoom: 13,
    }

    setMap(mapInstance)
    updateMarkers()
  }

  // Actualizar marcadores cuando cambien las coordenadas
  useEffect(() => {
    if (map) {
      updateMarkers()
      updateRoute()
    }
  }, [pickupCoords, deliveryCoords, map])

  const updateMarkers = () => {
    // En una implementación real, aquí actualizarías los marcadores de Leaflet
    console.log("Updating markers:", { pickupCoords, deliveryCoords })
  }

  const updateRoute = () => {
    if (pickupCoords.lat !== 0 && deliveryCoords.lat !== 0) {
      const distance = calculateDistance(pickupCoords.lat, pickupCoords.lng, deliveryCoords.lat, deliveryCoords.lng)
      onDistanceCalculated(distance)
    }
  }

  // Manejar click en el mapa
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convertir coordenadas de pixel a lat/lng (simulado)
    const lat = -16.5 - (y - rect.height / 2) * 0.0001
    const lng = -68.1193 + (x - rect.width / 2) * 0.0001

    if (isSelectingPickup) {
      onPickupChange({ lat, lng })
      setIsSelectingPickup(false)
    } else if (isSelectingDelivery) {
      onDeliveryChange({ lat, lng })
      setIsSelectingDelivery(false)
    }
  }

  const resetMap = () => {
    onPickupChange({ lat: 0, lng: 0 })
    onDeliveryChange({ lat: 0, lng: 0 })
    setIsSelectingPickup(false)
    setIsSelectingDelivery(false)
  }

  const centerOnBolivia = () => {
    // Centrar en La Paz, Bolivia
    if (map) {
      console.log("Centering on Bolivia")
    }
  }

  return (
    <div className="space-y-4">
      {/* Controles del Mapa */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isSelectingPickup ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setIsSelectingPickup(!isSelectingPickup)
            setIsSelectingDelivery(false)
          }}
        >
          <MapPin className="h-4 w-4 mr-2 text-green-500" />
          {isSelectingPickup ? "Seleccionando Origen..." : "Seleccionar Origen"}
        </Button>
        <Button
          variant={isSelectingDelivery ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setIsSelectingDelivery(!isSelectingDelivery)
            setIsSelectingPickup(false)
          }}
        >
          <MapPin className="h-4 w-4 mr-2 text-red-500" />
          {isSelectingDelivery ? "Seleccionando Destino..." : "Seleccionar Destino"}
        </Button>
        <Button variant="outline" size="sm" onClick={centerOnBolivia}>
          <Navigation className="h-4 w-4 mr-2" />
          Centrar en Bolivia
        </Button>
        <Button variant="outline" size="sm" onClick={resetMap}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      </div>

      {/* Instrucciones */}
      <div className="text-sm text-muted-foreground">
        {isSelectingPickup && (
          <div className="flex items-center gap-2 text-green-600">
            <MapPin className="h-4 w-4" />
            Haz clic en el mapa para seleccionar el punto de origen
          </div>
        )}
        {isSelectingDelivery && (
          <div className="flex items-center gap-2 text-red-600">
            <MapPin className="h-4 w-4" />
            Haz clic en el mapa para seleccionar el punto de destino
          </div>
        )}
        {!isSelectingPickup && !isSelectingDelivery && (
          <div>Selecciona "Origen" o "Destino" y luego haz clic en el mapa para marcar la ubicación</div>
        )}
      </div>

      {/* Contenedor del Mapa */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={mapRef}
            className={`h-96 w-full relative overflow-hidden rounded-lg bg-gradient-to-br from-green-50 to-blue-50 ${
              isSelectingPickup || isSelectingDelivery ? "cursor-crosshair" : "cursor-default"
            }`}
            onClick={handleMapClick}
          >
            {/* Fondo del mapa simulado */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-100 to-yellow-100"></div>
              {/* Líneas de cuadrícula para simular calles */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Marcador de Origen */}
            {pickupCoords.lat !== 0 && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-full z-10"
                style={{
                  left: `${50 + (pickupCoords.lng + 68.1193) * 10000}%`,
                  top: `${50 - (pickupCoords.lat + 16.5) * 10000}%`,
                }}
              >
                <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="bg-white text-xs p-1 rounded shadow-md mt-1 whitespace-nowrap">
                  <div className="font-semibold text-green-600">Origen</div>
                  <div>{pickupCoords.lat.toFixed(6)}</div>
                  <div>{pickupCoords.lng.toFixed(6)}</div>
                </div>
              </div>
            )}

            {/* Marcador de Destino */}
            {deliveryCoords.lat !== 0 && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-full z-10"
                style={{
                  left: `${50 + (deliveryCoords.lng + 68.1193) * 10000}%`,
                  top: `${50 - (deliveryCoords.lat + 16.5) * 10000}%`,
                }}
              >
                <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="bg-white text-xs p-1 rounded shadow-md mt-1 whitespace-nowrap">
                  <div className="font-semibold text-red-600">Destino</div>
                  <div>{deliveryCoords.lat.toFixed(6)}</div>
                  <div>{deliveryCoords.lng.toFixed(6)}</div>
                </div>
              </div>
            )}

            {/* Línea de ruta */}
            {pickupCoords.lat !== 0 && deliveryCoords.lat !== 0 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
                <line
                  x1={`${50 + (pickupCoords.lng + 68.1193) * 10000}%`}
                  y1={`${50 - (pickupCoords.lat + 16.5) * 10000}%`}
                  x2={`${50 + (deliveryCoords.lng + 68.1193) * 10000}%`}
                  y2={`${50 - (deliveryCoords.lat + 16.5) * 10000}%`}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
              </svg>
            )}

            {/* Etiqueta central */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg text-center">
                <h3 className="font-semibold text-slate-700 mb-2">Mapa Interactivo</h3>
                <p className="text-sm text-slate-600">La Paz, Bolivia</p>
                <div className="text-xs text-slate-500 mt-2">
                  {pickupCoords.lat !== 0 && deliveryCoords.lat !== 0 && (
                    <div>
                      Distancia:{" "}
                      {calculateDistance(
                        pickupCoords.lat,
                        pickupCoords.lng,
                        deliveryCoords.lat,
                        deliveryCoords.lng,
                      ).toFixed(2)}{" "}
                      km
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de Coordenadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <h4 className="font-semibold text-green-700">Punto de Origen</h4>
            </div>
            {pickupCoords.lat !== 0 ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latitud:</span>
                  <Badge variant="outline">{pickupCoords.lat.toFixed(6)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longitud:</span>
                  <Badge variant="outline">{pickupCoords.lng.toFixed(6)}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No seleccionado</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <h4 className="font-semibold text-red-700">Punto de Destino</h4>
            </div>
            {deliveryCoords.lat !== 0 ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latitud:</span>
                  <Badge variant="outline">{deliveryCoords.lat.toFixed(6)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longitud:</span>
                  <Badge variant="outline">{deliveryCoords.lng.toFixed(6)}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No seleccionado</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
