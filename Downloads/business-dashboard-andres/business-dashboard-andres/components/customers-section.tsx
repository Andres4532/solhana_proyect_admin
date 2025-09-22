"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Phone, MapPin, Star, ShoppingCart } from "lucide-react"

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  favorite: boolean
  status: "active" | "inactive"
}

export function CustomersSection() {
  const [searchTerm, setSearchTerm] = useState("")

  const customers: Customer[] = [
    {
      id: "1",
      name: "Juan Pérez",
      phone: "+52 555 123 4567",
      email: "juan.perez@email.com",
      address: "Av. Reforma 123, Col. Centro",
      totalOrders: 15,
      totalSpent: 450.75,
      lastOrder: "2024-01-15",
      favorite: true,
      status: "active",
    },
    {
      id: "2",
      name: "María García",
      phone: "+52 555 987 6543",
      email: "maria.garcia@email.com",
      address: "Calle Juárez 456, Col. Roma",
      totalOrders: 8,
      totalSpent: 220.5,
      lastOrder: "2024-01-14",
      favorite: false,
      status: "active",
    },
    {
      id: "3",
      name: "Carlos López",
      phone: "+52 555 456 7890",
      email: "carlos.lopez@email.com",
      address: "Blvd. Insurgentes 789, Col. Del Valle",
      totalOrders: 23,
      totalSpent: 680.25,
      lastOrder: "2024-01-15",
      favorite: true,
      status: "active",
    },
    {
      id: "4",
      name: "Ana Martínez",
      phone: "+52 555 321 9876",
      email: "ana.martinez@email.com",
      address: "Calle Madero 321, Col. Centro",
      totalOrders: 5,
      totalSpent: 125.0,
      lastOrder: "2024-01-10",
      favorite: false,
      status: "inactive",
    },
  ]

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleFavorite = (customerId: string) => {
    // En una aplicación real, esto actualizaría la base de datos
    console.log(`Toggle favorite for customer ${customerId}`)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getCustomerLevel = (totalSpent: number) => {
    if (totalSpent >= 500) return { level: "VIP", color: "default" }
    if (totalSpent >= 200) return { level: "Premium", color: "secondary" }
    return { level: "Regular", color: "outline" }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground">Gestiona tu base de clientes</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {customers.filter((c) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes VIP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {customers.filter((c) => c.totalSpent >= 500).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{customers.filter((c) => c.favorite).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {filteredCustomers.map((customer) => {
          const customerLevel = getCustomerLevel(customer.totalSpent)
          return (
            <Card key={customer.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {customer.name}
                        <Badge variant={customerLevel.color as any}>{customerLevel.level}</Badge>
                        {customer.favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                      </CardTitle>
                      <CardDescription>{customer.email}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">Bs. {customer.totalSpent.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground">{customer.totalOrders} pedidos</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      {customer.address}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <ShoppingCart className="h-4 w-4" />
                      Último pedido: {customer.lastOrder}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleFavorite(customer.id)}>
                        <Star
                          className={`h-4 w-4 mr-2 ${customer.favorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                        />
                        {customer.favorite ? "Quitar de Favoritos" : "Agregar a Favoritos"}
                      </Button>
                      <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                        {customer.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron clientes</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
