"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Download } from "lucide-react"

interface HistoryOrder {
  id: string
  customerName: string
  items: string
  total: number
  status: "delivered" | "cancelled"
  date: string
  time: string
}

export function HistorySection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const historyOrders: HistoryOrder[] = [
    {
      id: "ORD-098",
      customerName: "Ana Martínez",
      items: "2x Hamburguesa Clásica, 1x Papas Fritas",
      total: 31.97,
      status: "delivered",
      date: "2024-01-15",
      time: "14:30",
    },
    {
      id: "ORD-097",
      customerName: "Pedro Sánchez",
      items: "1x Pizza Margherita",
      total: 18.5,
      status: "delivered",
      date: "2024-01-15",
      time: "13:45",
    },
    {
      id: "ORD-096",
      customerName: "Laura González",
      items: "3x Tacos al Pastor",
      total: 26.97,
      status: "cancelled",
      date: "2024-01-15",
      time: "12:20",
    },
    {
      id: "ORD-095",
      customerName: "Roberto Díaz",
      items: "1x Hamburguesa Clásica, 2x Bebidas",
      total: 18.97,
      status: "delivered",
      date: "2024-01-14",
      time: "19:15",
    },
    {
      id: "ORD-094",
      customerName: "Carmen López",
      items: "2x Pizza Margherita",
      total: 37.0,
      status: "delivered",
      date: "2024-01-14",
      time: "18:30",
    },
  ]

  const filteredOrders = historyOrders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && order.date === "2024-01-15") ||
      (dateFilter === "yesterday" && order.date === "2024-01-14")

    return matchesSearch && matchesStatus && matchesDate
  })

  const totalRevenue = filteredOrders
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + order.total, 0)

  const getStatusBadge = (status: string) => {
    return status === "delivered" ? (
      <Badge variant="outline" className="text-green-600">
        Entregado
      </Badge>
    ) : (
      <Badge variant="destructive">Cancelado</Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historial de Pedidos</h1>
        <p className="text-muted-foreground">Revisa todos los pedidos anteriores</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o ID de pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="delivered">Entregados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Fecha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="yesterday">Ayer</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Entregados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredOrders.filter((o) => o.status === "delivered").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bs. {totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {order.id} - {order.customerName}
                    {getStatusBadge(order.status)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {order.date} a las {order.time}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">Bs. {order.total.toFixed(2)}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{order.items}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron pedidos con los filtros aplicados</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
