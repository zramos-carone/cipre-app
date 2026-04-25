"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Plus, ChevronLeft, ChevronRight, Search } from "lucide-react"

type AppointmentType = "primera" | "seguimiento" | "cierre"

interface Appointment {
  id: string
  time: string
  type: AppointmentType
  patientName: string
}

interface DayAppointments {
  [day: number]: Appointment[]
}

const appointmentTypeColors: Record<AppointmentType, string> = {
  primera: "bg-purple-500 text-white",
  seguimiento: "bg-blue-500 text-white",
  cierre: "bg-pink-400 text-white",
}

const appointmentTypeLabels: Record<AppointmentType, string> = {
  primera: "Primera vez",
  seguimiento: "Seguimiento",
  cierre: "Cierre",
}

// Static appointments data for April 2026
const staticAppointments: DayAppointments = {
  3: [
    { id: "1", time: "09:00", type: "seguimiento", patientName: "María González" },
    { id: "2", time: "10:00", type: "primera", patientName: "Juan Pérez" },
    { id: "3", time: "11:00", type: "seguimiento", patientName: "Ana Martínez" },
  ],
  4: [
    { id: "4", time: "09:00", type: "primera", patientName: "Carlos López" },
    { id: "5", time: "10:00", type: "cierre", patientName: "Laura Rodríguez" },
  ],
  5: [
    { id: "6", time: "09:00", type: "cierre", patientName: "Pedro Sánchez" },
  ],
  7: [
    { id: "7", time: "14:00", type: "seguimiento", patientName: "Elena Torres" },
  ],
}

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
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

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 3)) // April 3, 2026
  const [viewMode, setViewMode] = useState<"mes" | "dia">("mes")
  const [searchPatient, setSearchPatient] = useState("")
  const formattedDate = getFormattedDate()

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const today = 3 // Static "today" for demo

  // Get first day of month and total days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  // Navigation handlers
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date(2026, 3, 3))
  }

  // Build calendar grid
  const calendarDays: { day: number; isCurrentMonth: boolean }[] = []
  
  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false })
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true })
  }
  
  // Next month days to complete the grid
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false })
  }

  const getAppointmentsForDay = (day: number, isCurrentMonth: boolean): Appointment[] => {
    if (!isCurrentMonth || currentMonth !== 3) return [] // Only show for April 2026
    return staticAppointments[day] || []
  }

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
          <h2 className="text-2xl font-bold text-foreground">Agenda de Citas</h2>
          <p className="text-muted-foreground">Gestión de citas y calendario por psicólogo</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Filtrar por Psicólogo
              </label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Todos</option>
                <option value="1">Dr. García</option>
                <option value="2">Dra. Martínez</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Tipo de Cita
              </label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Todos</option>
                <option value="primera">Primera vez</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="cierre">Cierre</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Vista
              </label>
              <div className="flex">
                <Button
                  variant={viewMode === "mes" ? "default" : "outline"}
                  className="rounded-r-none"
                  onClick={() => setViewMode("mes")}
                >
                  Mes
                </Button>
                <Button
                  variant={viewMode === "dia" ? "default" : "outline"}
                  className="rounded-l-none"
                  onClick={() => setViewMode("dia")}
                >
                  Día
                </Button>
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Buscar paciente
              </label>
              <InputGroup>
                <InputGroupAddon>
                  <Search className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Nombre del paciente..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                />
              </InputGroup>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">Tipos de Cita:</span>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-purple-500"></span>
              <span>Primera vez</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500"></span>
              <span>Seguimiento</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-pink-400"></span>
              <span>Cierre</span>
            </div>
          </div>
        </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardContent className="p-4">
          {/* Calendar Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold">
                {months[currentMonth]} {currentYear}
              </h2>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Button variant="outline" onClick={goToToday}>
              Hoy
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px rounded-lg border border-border bg-border overflow-hidden">
            {/* Day headers */}
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="bg-muted px-2 py-3 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((item, index) => {
              const appointments = getAppointmentsForDay(item.day, item.isCurrentMonth)
              const isToday = item.isCurrentMonth && item.day === today && currentMonth === 3
              const displayAppointments = appointments.slice(0, 2)
              const remainingCount = appointments.length - 2

              return (
                <div
                  key={index}
                  className={`min-h-[100px] bg-card p-2 ${
                    !item.isCurrentMonth ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex justify-center">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                        isToday
                          ? "bg-primary text-primary-foreground font-semibold"
                          : item.isCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-col gap-1">
                    {displayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={`rounded px-1.5 py-0.5 text-xs ${appointmentTypeColors[apt.type]}`}
                      >
                        {apt.time}
                      </div>
                    ))}
                    {remainingCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        +{remainingCount} más
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
