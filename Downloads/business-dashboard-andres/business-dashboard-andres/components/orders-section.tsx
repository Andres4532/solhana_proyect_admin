"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, User, MapPin, Phone } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  variables: { [key: string]: string }
}

interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: OrderItem[]
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  orderTime: string
  estimatedTime?: string
  notes?: string
}

export function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      customerName: "Juan Pérez",
      customerPhone: "+52 555 123 4567",
      customerAddress: "Av. Reforma 123, Col. Centro",
      items: [
        {
          id: "1",
          name: "Hamburguesa Clásica",
          quantity: 2,
          price: 12.99,
          variables: { "Tipo de Carne": "Res", "Punto de Cocción": "Término medio" },
        },
        {
          id: "2",
          name: "Papas Fritas",
          quantity: 1,
          price: 5.99,
          variables: {},
        },
      ],
      total: 31.97,
      status: "preparing",
      orderTime: "10:30 AM",
      estimatedTime: "25 min",
      notes: "Sin cebolla por favor",
    },
    {
      id: "ORD-002",
      customerName: "María García",
      customerPhone: "+52 555 987 6543",
      customerAddress: "Calle Juárez 456, Col. Roma",
      items: [
        {
          id: "3",
          name: "Pizza Margherita",
          quantity: 1,
          price: 18.5,
          variables: { Tamaño: "Mediana" },
        },
      ],
      total: 18.5,
      status: "ready",
      orderTime: "10:45 AM",
      estimatedTime: "Listo",
    },
    {
      id: "ORD-003",
      customerName: "Carlos López",
      customerPhone: "+52 555 456 7890",
      customerAddress: "Blvd. Insurgentes 789, Col. Del Valle",
      items: [
        {
          id: "4",
          name: "Tacos al Pastor",
          quantity: 3,
          price: 8.99,
          variables: {},
        },
      ],
      total: 26.97,
      status: "pending",
      orderTime: "11:00 AM",
      notes: "Entrega urgente",
    },
  ])

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "destructive"
      case "confirmed":
        return "secondary"
      case "preparing":
        return "default"
      case "ready":
        return "default"
      case "delivered":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "confirmed":
        return "Confirmado"
      case "preparing":
        return "Preparando"
      case "ready":
        return "Listo"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const statusOptions = [
    { value: "pending", label: "Pendiente" },
    { value: "confirmed", label: "Confirmado" },
    { value: "preparing", label: "Preparando" },
    { value: "ready", label: "Listo" },
    { value: "delivered", label: "Entregado" },
    { value: "cancelled", label: "Cancelado" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Gestiona los pedidos activos</p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {order.id}
                    <Badge variant={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {order.orderTime}
                    </span>
                    {order.estimatedTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {order.estimatedTime}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">Bs. {order.total.toFixed(2)}</div>
                  <Select
                    value={order.status}
                    onValueChange={(value: Order["status"]) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Información del Cliente</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {order.customerName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {order.customerPhone}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {order.customerAddress}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Productos</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="text-sm">
                        <div className="flex justify-between">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>Bs. {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        {Object.keys(item.variables).length > 0 && (
                          <div className="text-xs text-muted-foreground ml-4">
                            {Object.entries(item.variables).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {order.notes && (
                <div className="border-t pt-2">
                  <h4 className="font-semibold text-sm">Notas:</h4>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
