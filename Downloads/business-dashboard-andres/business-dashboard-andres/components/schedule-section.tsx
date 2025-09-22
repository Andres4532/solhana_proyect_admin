"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Calendar, Clock, Plus, User, Repeat } from "lucide-react"

interface ScheduledOrder {
  id: string
  customerName: string
  customerId: string
  items: string
  total: number
  scheduledDate: string
  scheduledTime: string
  frequency: "once" | "daily" | "weekly" | "monthly"
  status: "active" | "paused" | "completed"
  nextExecution?: string
}

export function ScheduleSection() {
  const [scheduledOrders, setScheduledOrders] = useState<ScheduledOrder[]>([
    {
      id: "SCH-001",
      customerName: "Juan Pérez",
      customerId: "1",
      items: "2x Hamburguesa Clásica, 1x Papas Fritas",
      total: 31.97,
      scheduledDate: "2024-01-16",
      scheduledTime: "12:00",
      frequency: "weekly",
      status: "active",
      nextExecution: "2024-01-23",
    },
    {
      id: "SCH-002",
      customerName: "María García",
      customerId: "2",
      items: "1x Pizza Margherita",
      total: 18.5,
      scheduledDate: "2024-01-17",
      scheduledTime: "19:30",
      frequency: "monthly",
      status: "active",
      nextExecution: "2024-02-17",
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    customerName: "",
    customerId: "",
    items: "",
    total: 0,
    scheduledDate: "",
    scheduledTime: "",
    frequency: "once" as const,
  })

  const customers = [
    { id: "1", name: "Juan Pérez" },
    { id: "2", name: "María García" },
    { id: "3", name: "Carlos López" },
    { id: "4", name: "Ana Martínez" },
  ]

  const handleCreateSchedule = () => {
    if (newSchedule.customerName && newSchedule.scheduledDate && newSchedule.scheduledTime) {
      const schedule: ScheduledOrder = {
        id: `SCH-${String(scheduledOrders.length + 1).padStart(3, "0")}`,
        ...newSchedule,
        status: "active",
        nextExecution: newSchedule.frequency !== "once" ? newSchedule.scheduledDate : undefined,
      }
      setScheduledOrders([...scheduledOrders, schedule])
      setNewSchedule({
        customerName: "",
        customerId: "",
        items: "",
        total: 0,
        scheduledDate: "",
        scheduledTime: "",
        frequency: "once",
      })
      setIsCreateDialogOpen(false)
    }
  }

  const toggleScheduleStatus = (scheduleId: string) => {
    setScheduledOrders(
      scheduledOrders.map((schedule) =>
        schedule.id === scheduleId
          ? { ...schedule, status: schedule.status === "active" ? "paused" : "active" }
          : schedule,
      ),
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Activo</Badge>
      case "paused":
        return <Badge variant="secondary">Pausado</Badge>
      case "completed":
        return <Badge variant="outline">Completado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "once":
        return "Una vez"
      case "daily":
        return "Diario"
      case "weekly":
        return "Semanal"
      case "monthly":
        return "Mensual"
      default:
        return frequency
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Programar Pedidos</h1>
          <p className="text-muted-foreground">Gestiona pedidos programados y recurrentes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pedido Programado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Programar Nuevo Pedido</DialogTitle>
              <DialogDescription>Crea un pedido programado para un cliente</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer">Cliente</Label>
                <Select
                  value={newSchedule.customerId}
                  onValueChange={(value) => {
                    const customer = customers.find((c) => c.id === value)
                    setNewSchedule({
                      ...newSchedule,
                      customerId: value,
                      customerName: customer?.name || "",
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="items">Productos</Label>
                <Input
                  id="items"
                  value={newSchedule.items}
                  onChange={(e) => setNewSchedule({ ...newSchedule, items: e.target.value })}
                  placeholder="Ej: 2x Hamburguesa Clásica"
                />
              </div>
              <div>
                <Label htmlFor="total">Total</Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newSchedule.total || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    
                    // Si está vacío, establecer como 0
                    if (value === '') {
                      setNewSchedule({ ...newSchedule, total: 0 });
                      return;
                    }
                    
                    // Convertir a número
                    const numValue = Number.parseFloat(value);
                    
                    // Solo actualizar si es un número válido y positivo
                    if (!isNaN(numValue) && numValue >= 0) {
                      setNewSchedule({ ...newSchedule, total: numValue });
                    }
                  }}
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newSchedule.scheduledDate}
                    onChange={(e) => setNewSchedule({ ...newSchedule, scheduledDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newSchedule.scheduledTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, scheduledTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="frequency">Frecuencia</Label>
                <Select
                  value={newSchedule.frequency}
                  onValueChange={(value: any) => setNewSchedule({ ...newSchedule, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Una vez</SelectItem>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSchedule}>Programar Pedido</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Programados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {scheduledOrders.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Programados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {scheduledOrders
                .filter((s) => s.status === "active")
                .reduce((sum, s) => sum + s.total, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {scheduledOrders.map((schedule) => (
          <Card key={schedule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {schedule.id} - {schedule.customerName}
                    {getStatusBadge(schedule.status)}
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Repeat className="h-3 w-3" />
                      {getFrequencyText(schedule.frequency)}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {schedule.scheduledDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {schedule.scheduledTime}
                    </span>
                    {schedule.nextExecution && (
                      <span className="text-sm text-muted-foreground">Próxima: {schedule.nextExecution}</span>
                    )}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">Bs. {schedule.total.toFixed(2)}</div>
                  <Button variant="outline" size="sm" onClick={() => toggleScheduleStatus(schedule.id)}>
                    {schedule.status === "active" ? "Pausar" : "Activar"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{schedule.items}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scheduledOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay pedidos programados</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crea tu primer pedido programado para automatizar las ventas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
