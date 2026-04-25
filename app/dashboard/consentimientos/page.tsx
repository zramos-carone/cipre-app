"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Eye, Download, Plus, CheckCircle, Clock, FileIcon } from "lucide-react"

type ConsentStatus = "firmado" | "pendiente"

interface Consent {
  id: number
  title: string
  patient: string
  date: string
  status: ConsentStatus
}

const consentsData: Consent[] = [
  {
    id: 1,
    title: "Tratamiento Psicológico",
    patient: "María González",
    date: "2026-03-15",
    status: "firmado",
  },
  {
    id: 2,
    title: "Manejo de Datos Personales",
    patient: "Juan Pérez",
    date: "2026-04-01",
    status: "firmado",
  },
  {
    id: 3,
    title: "Tratamiento Psicológico",
    patient: "Ana Martínez",
    date: "2026-03-20",
    status: "firmado",
  },
  {
    id: 4,
    title: "Evaluación Psicológica",
    patient: "Carlos López",
    date: "2026-04-02",
    status: "pendiente",
  },
]

const templates = [
  { id: 1, title: "Tratamiento Psicológico", icon: "blue" },
  { id: 2, title: "Manejo de Datos Personales", icon: "green" },
  { id: 3, title: "Evaluación Psicológica", icon: "blue" },
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

export default function ConsentimientosPage() {
  const [patientFilter, setPatientFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const formattedDate = getFormattedDate()

  const filteredConsents = consentsData.filter((consent) => {
    if (patientFilter !== "all" && consent.patient !== patientFilter) return false
    if (typeFilter !== "all" && consent.title !== typeFilter) return false
    if (statusFilter !== "all" && consent.status !== statusFilter) return false
    return true
  })

  const uniquePatients = [...new Set(consentsData.map((c) => c.patient))]
  const uniqueTypes = [...new Set(consentsData.map((c) => c.title))]

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
          <h2 className="text-2xl font-semibold text-foreground">Consentimientos Informados</h2>
          <p className="text-muted-foreground">Gestión de documentos de autorización</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <FileText className="mr-2 h-4 w-4" />
          Nuevo Consentimiento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Paciente</label>
              <Select value={patientFilter} onValueChange={setPatientFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los pacientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pacientes</SelectItem>
                  {uniquePatients.map((patient) => (
                    <SelectItem key={patient} value={patient}>
                      {patient}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipo de Consentimiento</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="firmado">Firmado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Consents List */}
      <div className="space-y-3">
        {filteredConsents.map((consent) => (
          <Card key={consent.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{consent.title}</h3>
                  <p className="text-sm text-muted-foreground">Paciente: {consent.patient}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Fecha: {consent.date}</span>
                    {consent.status === "firmado" ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Firmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-orange-500">
                        <Clock className="h-4 w-4" />
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Eye className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredConsents.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No se encontraron consentimientos</h3>
              <p className="text-sm text-muted-foreground">Ajusta los filtros o crea un nuevo consentimiento</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Templates Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Plantillas Disponibles</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    template.icon === "green" ? "bg-green-50" : "bg-blue-50"
                  }`}
                >
                  <FileIcon
                    className={`h-5 w-5 ${template.icon === "green" ? "text-green-600" : "text-primary"}`}
                  />
                </div>
                <span className="font-medium text-foreground">{template.title}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
