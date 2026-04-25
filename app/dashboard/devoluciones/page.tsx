"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, MessageSquare, Calendar } from "lucide-react"

const patients = [
  { id: 1, name: "María González" },
  { id: 2, name: "Juan Pérez" },
  { id: 3, name: "Ana Martínez" },
  { id: 4, name: "Carlos López" },
]

const feedbackTypes = [
  "Retroalimentación de Sesión",
  "Evaluación de Progreso",
  "Recomendaciones Terapéuticas",
  "Cierre de Tratamiento",
]

const feedbackHistory = [
  {
    id: 1,
    patientId: 1,
    type: "Retroalimentación de Sesión",
    date: "2026-03-30",
    author: "Dr. Roberto Sánchez",
    content: "Excelente progreso en el manejo de ansiedad. Se observa mayor confianza y capacidad de autoregulación.",
  },
  {
    id: 2,
    patientId: 1,
    type: "Evaluación de Progreso",
    date: "2026-03-15",
    author: "Dr. Roberto Sánchez",
    content: "Avances significativos en técnicas de respiración. Se recomienda continuar con ejercicios diarios.",
  },
  {
    id: 3,
    patientId: 2,
    type: "Retroalimentación de Sesión",
    date: "2026-03-28",
    author: "Dra. Laura Mendez",
    content: "El paciente muestra mejoras en comunicación asertiva. Continuar trabajando en límites personales.",
  },
  {
    id: 4,
    patientId: 3,
    type: "Recomendaciones Terapéuticas",
    date: "2026-03-20",
    author: "Dr. Roberto Sánchez",
    content: "Se sugiere incorporar técnicas de mindfulness para complementar el tratamiento actual.",
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

export default function DevolucionesPage() {
  const [selectedPatient, setSelectedPatient] = useState("")
  const [feedbackType, setFeedbackType] = useState("")
  const [feedbackDate, setFeedbackDate] = useState("")
  const [feedbackContent, setFeedbackContent] = useState("")
  const formattedDate = getFormattedDate()

  const selectedPatientId = patients.find(p => p.name === selectedPatient)?.id

  const filteredHistory = selectedPatientId
    ? feedbackHistory.filter(f => f.patientId === selectedPatientId)
    : []

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
          <h2 className="text-2xl font-semibold text-foreground">Devoluciones y Retroalimentación</h2>
          <p className="text-muted-foreground">Seguimiento y evaluación de sesiones</p>
        </div>
      </div>

      {/* Patient Selector */}
      <Card>
        <CardContent className="p-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Seleccionar Paciente
          </label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Seleccionar...</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.name}>
                {patient.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedPatient && (
        <>
          {/* New Feedback Form */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Send className="h-4 w-4" />
                <span>Nueva Devolución</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipo de Devolución
                  </label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Seleccionar...</option>
                    {feedbackTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={feedbackDate}
                    onChange={(e) => setFeedbackDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contenido de la Devolución
                </label>
                <textarea
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="Escribe la retroalimentación para el paciente..."
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="h-4 w-4 mr-2" />
                Enviar Devolución
              </Button>
            </CardContent>
          </Card>

          {/* Feedback History */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">Historial de Devoluciones</h2>

            {filteredHistory.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No hay devoluciones registradas para este paciente.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground">{feedback.type}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{feedback.date}</span>
                            <span className="mx-1">Por:</span>
                            <span>{feedback.author}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {feedback.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!selectedPatient && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Selecciona un paciente para ver y crear devoluciones
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
