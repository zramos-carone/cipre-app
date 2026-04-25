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
import { Plus, User, Calendar } from "lucide-react"

const patients = [
  {
    id: "1",
    name: "María González",
    totalSessions: 8,
    firstSession: "2026-01-15",
    lastSession: "2026-03-28",
    psychologist: "Dr. Roberto Sánchez",
  },
  {
    id: "2",
    name: "Juan Pérez",
    totalSessions: 5,
    firstSession: "2026-02-01",
    lastSession: "2026-03-25",
    psychologist: "Dra. Carmen López",
  },
  {
    id: "3",
    name: "Ana Martínez",
    totalSessions: 3,
    firstSession: "2026-03-01",
    lastSession: "2026-03-22",
    psychologist: "Dr. Roberto Sánchez",
  },
]

const sessionsByPatient: Record<string, Array<{
  id: string
  number: number
  date: string
  duration: string
  status: "Completada" | "Pendiente" | "Cancelada"
  reason: string
  observations: string
  actionPlan: string
}>> = {
  "1": [
    {
      id: "s8",
      number: 8,
      date: "2026-03-28",
      duration: "50 min",
      status: "Completada",
      reason: "Seguimiento de síntomas de ansiedad. Paciente reporta mejoras significativas en manejo de situaciones estresantes.",
      observations: "Se aplicaron técnicas de respiración y reestructuración cognitiva. Buena receptividad del paciente.",
      actionPlan: "Continuar con ejercicios de mindfulness. Próxima sesión en 7 días.",
    },
    {
      id: "s7",
      number: 7,
      date: "2026-03-21",
      duration: "50 min",
      status: "Completada",
      reason: "Seguimiento de síntomas de ansiedad. Paciente reporta mejoras significativas en manejo de situaciones estresantes.",
      observations: "Se aplicaron técnicas de respiración y reestructuración cognitiva. Buena receptividad del paciente.",
      actionPlan: "Continuar con ejercicios de mindfulness. Próxima sesión en 7 días.",
    },
    {
      id: "s6",
      number: 6,
      date: "2026-03-14",
      duration: "50 min",
      status: "Completada",
      reason: "Revisión de avances en técnicas de relajación. Paciente muestra progreso constante.",
      observations: "Se introdujeron nuevas técnicas de visualización. Paciente receptivo.",
      actionPlan: "Practicar visualización guiada diariamente.",
    },
    {
      id: "s5",
      number: 5,
      date: "2026-03-07",
      duration: "50 min",
      status: "Completada",
      reason: "Trabajo en identificación de pensamientos automáticos negativos.",
      observations: "Paciente logra identificar patrones de pensamiento disfuncionales.",
      actionPlan: "Registro diario de pensamientos automáticos.",
    },
  ],
  "2": [
    {
      id: "s5",
      number: 5,
      date: "2026-03-25",
      duration: "45 min",
      status: "Completada",
      reason: "Seguimiento de terapia de pareja. Avances en comunicación.",
      observations: "Pareja muestra mejoras en escucha activa.",
      actionPlan: "Ejercicios de comunicación asertiva.",
    },
    {
      id: "s4",
      number: 4,
      date: "2026-03-18",
      duration: "45 min",
      status: "Completada",
      reason: "Trabajo en resolución de conflictos.",
      observations: "Se establecieron acuerdos para manejo de desacuerdos.",
      actionPlan: "Implementar técnicas de negociación.",
    },
  ],
  "3": [
    {
      id: "s3",
      number: 3,
      date: "2026-03-22",
      duration: "50 min",
      status: "Completada",
      reason: "Evaluación de estado de ánimo. Paciente reporta mejoría.",
      observations: "Síntomas depresivos en remisión parcial.",
      actionPlan: "Continuar con activación conductual.",
    },
  ],
}

function getStatusColor(status: string) {
  switch (status) {
    case "Completada":
      return "bg-green-100 text-green-700"
    case "Pendiente":
      return "bg-orange-100 text-orange-700"
    case "Cancelada":
      return "bg-red-100 text-red-700"
    default:
      return "bg-muted text-muted-foreground"
  }
}

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

export default function HistorialClinicoPage() {
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const formattedDate = getFormattedDate()

  const patient = patients.find((p) => p.id === selectedPatient)
  const sessions = selectedPatient ? sessionsByPatient[selectedPatient] || [] : []

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
          <h2 className="text-2xl font-semibold text-foreground">Historial Clínico</h2>
          <p className="text-muted-foreground">Viñetas de sesiones psicológicas</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Sesión
        </Button>
      </div>

      {/* Patient Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-md">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Seleccionar Paciente
            </label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient Info & Sessions */}
      {patient && (
        <>
          {/* Patient Info Card */}
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground">{patient.name}</h2>
                  <div className="mt-2 grid grid-cols-4 gap-8">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Sesiones</p>
                      <p className="font-medium text-foreground">{patient.totalSessions} sesiones</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Primera Sesión</p>
                      <p className="font-medium text-foreground">{patient.firstSession}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Última Sesión</p>
                      <p className="font-medium text-foreground">{patient.lastSession}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Psicólogo Asignado</p>
                      <p className="font-medium text-foreground">{patient.psychologist}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Timeline */}
          <div className="space-y-0">
            {sessions.map((session, index) => (
              <div key={session.id} className="relative flex gap-6">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    {session.number}
                  </div>
                  {index < sessions.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border" />
                  )}
                </div>

                {/* Session Content */}
                <Card className="mb-6 flex-1">
                  <CardContent className="py-4">
                    <div className="mb-3 flex items-center gap-4">
                      <h3 className="font-semibold text-foreground">Sesión #{session.number}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {session.date}
                      </div>
                      <span className="text-sm text-muted-foreground">{session.duration}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Motivo de Consulta:</p>
                        <p className="text-sm text-muted-foreground">{session.reason}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Observaciones:</p>
                        <p className="text-sm text-muted-foreground">{session.observations}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Plan de Acción:</p>
                        <p className="text-sm text-muted-foreground">{session.actionPlan}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedPatient && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Seleccione un paciente para ver su historial clínico</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
