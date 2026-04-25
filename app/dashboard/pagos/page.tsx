"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DollarSign, CreditCard, Clock, TrendingUp, Plus } from "lucide-react"

const stats = [
  {
    value: "$48,500",
    label: "Ingresos del Mes",
    icon: DollarSign,
    color: "bg-green-500",
  },
  {
    value: "156",
    label: "Pagos Recibidos",
    icon: CreditCard,
    color: "bg-blue-500",
  },
  {
    value: "8",
    label: "Pendientes",
    icon: Clock,
    color: "bg-orange-500",
  },
  {
    value: "+12%",
    label: "Crecimiento",
    icon: TrendingUp,
    color: "bg-pink-500",
  },
]

const payments = [
  {
    id: 1,
    fecha: "2026-03-28",
    paciente: "María González",
    concepto: "Sesión #8",
    monto: "$800",
    metodo: "Tarjeta",
    estado: "Pagado",
  },
  {
    id: 2,
    fecha: "2026-04-01",
    paciente: "Juan Pérez",
    concepto: "Sesión #3",
    monto: "$800",
    metodo: "Efectivo",
    estado: "Pagado",
  },
  {
    id: 3,
    fecha: "2026-03-30",
    paciente: "Ana Martínez",
    concepto: "Sesión #6",
    monto: "$800",
    metodo: "Transferencia",
    estado: "Pagado",
  },
  {
    id: 4,
    fecha: "2026-04-02",
    paciente: "Carlos López",
    concepto: "Sesión #2",
    monto: "$800",
    metodo: "Tarjeta",
    estado: "Pendiente",
  },
]

function getFormattedDate() {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }
  const date = new Date()
  return date.toLocaleDateString("es-ES", options)
}

const pacientes = ["Todos", "María González", "Juan Pérez", "Ana Martínez", "Carlos López"]
const metodos = ["Todos", "Tarjeta", "Efectivo", "Transferencia"]
const estados = ["Todos", "Pagado", "Pendiente"]
const meses = ["Todos", "Abril 2026", "Marzo 2026", "Febrero 2026"]

export default function PagosPage() {
  const [filterPaciente, setFilterPaciente] = useState("Todos")
  const [filterMetodo, setFilterMetodo] = useState("Todos")
  const [filterEstado, setFilterEstado] = useState("Todos")
  const [filterMes, setFilterMes] = useState("Todos")
  const formattedDate = getFormattedDate()

  const filteredPayments = payments.filter((payment) => {
    if (filterPaciente !== "Todos" && payment.paciente !== filterPaciente) return false
    if (filterMetodo !== "Todos" && payment.metodo !== filterMetodo) return false
    if (filterEstado !== "Todos" && payment.estado !== filterEstado) return false
    return true
  })

  return (
    <div className="p-6 lg:p-8">
      {/* Clinic Header */}
      <header className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Clínica Preventiva CIPRE</h1>
        </div>
        <p className="text-sm capitalize text-muted-foreground">{formattedDate}</p>
      </header>

      {/* Title */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Registro de Pagos</h2>
          <p className="text-muted-foreground">Control financiero de sesiones</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Registrar Pago
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className={`mb-3 inline-flex rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Paciente
              </label>
              <Select value={filterPaciente} onValueChange={setFilterPaciente}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Método de Pago
              </label>
              <Select value={filterMetodo} onValueChange={setFilterMetodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  {metodos.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Estado
              </label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Mes
              </label>
              <Select value={filterMes} onValueChange={setFilterMes}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="pl-6 font-medium">Fecha</TableHead>
                  <TableHead className="font-medium">Paciente</TableHead>
                  <TableHead className="font-medium">Concepto</TableHead>
                  <TableHead className="font-medium">Monto</TableHead>
                  <TableHead className="font-medium">Método</TableHead>
                  <TableHead className="pr-6 font-medium">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="pl-6 text-muted-foreground">{payment.fecha}</TableCell>
                    <TableCell className="font-medium">{payment.paciente}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.concepto}</TableCell>
                    <TableCell className="font-medium">{payment.monto}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.metodo}</TableCell>
                    <TableCell className="pr-6">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          payment.estado === "Pagado"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {payment.estado}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
