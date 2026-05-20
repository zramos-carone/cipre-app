"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Calendar, 
  Clock, 
  Video, 
  User, 
  Filter, 
  Activity, 
  Bell,
  Sparkles,
  ClipboardList
} from "lucide-react"
import { toast } from "sonner"
import { AppointmentDialog } from "@/components/dashboard/agenda/appointment-dialog"
import { 
  getAppointments, 
  getPsychologists, 
  createAppointment, 
  updateAppointment,
  cancelAppointment
} from "@/lib/actions/appointments"
import { getPatients } from "@/lib/actions/patients"
import { AppointmentInput } from "@/lib/validations/appointment"

type AppointmentType = "primera" | "seguimiento" | "cierre"

interface Appointment {
  id: string
  patientId: string
  psychologistId: string
  scheduledAt: string | Date
  status: "Pendiente" | "Confirmada" | "Completada" | "Cancelada"
  notes?: string | null
  type: AppointmentType
  modality: "Presencial" | "En línea"
  duration: number
  sendReminder: boolean
  patient: {
    id: string
    name: string
    lastName: string
    phone: string | null
    email: string | null
  }
  psychologist: {
    id: string
    fullName: string
    email: string
  }
}

const appointmentTypeColors: Record<AppointmentType, { pill: string; border: string; bg: string }> = {
  primera: {
    pill: "bg-purple-500 text-white",
    border: "border-purple-200 dark:border-purple-900/30",
    bg: "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300"
  },
  seguimiento: {
    pill: "bg-blue-500 text-white",
    border: "border-blue-200 dark:border-blue-900/30",
    bg: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300"
  },
  cierre: {
    pill: "bg-pink-500 text-white",
    border: "border-pink-200 dark:border-pink-900/30",
    bg: "bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300"
  },
}

const statusBadges: Record<string, string> = {
  Pendiente: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-900/30",
  Confirmada: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/30",
  Completada: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/30",
  Cancelada: "bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-900/30",
}

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

function getFormattedDate(date = new Date()) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }
  return date.toLocaleDateString("es-ES", options)
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"mes" | "dia">("mes")
  const [searchPatient, setSearchPatient] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  
  // Filtros
  const [filterPsychologist, setFilterPsychologist] = useState("")
  const [filterType, setFilterType] = useState("")
  
  // Listas generales
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [psychologists, setPsychologists] = useState<{ id: string; fullName: string }[]>([])
  const [patients, setPatients] = useState<{ id: string; name: string; lastName: string }[]>([])
  
  // Diálogo Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Partial<AppointmentInput> & { id?: string } | undefined>(undefined)
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchPatient)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchPatient])

  // Cargar psicólogos y pacientes al iniciar
  useEffect(() => {
    async function loadData() {
      try {
        const [psyRes, patRes] = await Promise.all([
          getPsychologists(),
          getPatients({ pageSize: 1000 })
        ])
        
        if (psyRes.success && psyRes.data) {
          setPsychologists(psyRes.data)
        }
        if (patRes.success && patRes.data?.patients) {
          setPatients(patRes.data.patients)
        }
      } catch (error) {
        console.error("Error cargando catálogos iniciales:", error)
        toast.error("Error al cargar los catálogos del sistema")
      }
    }
    loadData()
  }, [])

  // Calcular rango de fechas para el calendario de 42 días
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  // Construir matriz de días
  const calendarDays: { day: number; isCurrentMonth: boolean; date: Date }[] = []
  
  // Días del mes anterior
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(currentYear, currentMonth - 1, day)
    calendarDays.push({ day, isCurrentMonth: false, date })
  }
  
  // Días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i)
    calendarDays.push({ day: i, isCurrentMonth: true, date })
  }
  
  // Días del mes siguiente para completar la cuadrícula de 42 días
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(currentYear, currentMonth + 1, i)
    calendarDays.push({ day: i, isCurrentMonth: false, date })
  }

  // Cargar citas de la base de datos basándose en el mes/filtros seleccionados
  const fetchMonthAppointments = useCallback(async () => {
    setIsLoading(true)
    try {
      const startDate = calendarDays[0].date
      const endDate = calendarDays[calendarDays.length - 1].date
      
      const res = await getAppointments({
        startDate,
        endDate,
        psychologistId: filterPsychologist || undefined,
        type: filterType || undefined,
        query: debouncedSearch || undefined
      })
      
      if (res.success && res.data) {
        setAppointments(res.data as Appointment[])
      } else {
        toast.error("No se pudieron obtener las citas")
      }
    } catch (error) {
      console.error("Error al obtener citas:", error)
      toast.error("Error al intentar conectar con la base de datos")
    } finally {
      setIsLoading(false)
    }
  }, [currentDate, filterPsychologist, filterType, debouncedSearch])

  useEffect(() => {
    fetchMonthAppointments()
  }, [fetchMonthAppointments])

  // Navegación
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setViewMode("mes")
  }

  // Obtener citas programadas para un día en específico
  const getAppointmentsForDay = (date: Date): Appointment[] => {
    return appointments.filter((appt) => {
      const apptDate = new Date(appt.scheduledAt)
      return (
        apptDate.getFullYear() === date.getFullYear() &&
        apptDate.getMonth() === date.getMonth() &&
        apptDate.getDate() === date.getDate()
      )
    })
  }

  // Manejadores de Cliks
  const handleDayClick = (date: Date) => {
    // Al hacer clic en un día, preparamos para crear cita para ese día
    const scheduledAt = new Date(date)
    // Inicializar a las 9:00 AM por defecto
    scheduledAt.setHours(9, 0, 0, 0)
    
    setSelectedAppointment({
      scheduledAt,
      patientId: "",
      psychologistId: filterPsychologist || "",
      type: "seguimiento",
      modality: "Presencial",
      duration: 60,
      status: "Pendiente",
      notes: "",
      sendReminder: false,
    })
    setIsDialogOpen(true)
  }

  const handleNewAppointmentClick = () => {
    const scheduledAt = new Date()
    scheduledAt.setHours(9, 0, 0, 0)
    
    setSelectedAppointment({
      scheduledAt,
      patientId: "",
      psychologistId: filterPsychologist || "",
      type: "seguimiento",
      modality: "Presencial",
      duration: 60,
      status: "Pendiente",
      notes: "",
      sendReminder: false,
    })
    setIsDialogOpen(true)
  }

  const handleAppointmentClick = (appt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar click en la celda del día
    
    setSelectedAppointment({
      id: appt.id,
      patientId: appt.patientId,
      psychologistId: appt.psychologistId,
      scheduledAt: new Date(appt.scheduledAt),
      type: appt.type,
      modality: appt.modality,
      duration: appt.duration,
      status: appt.status,
      notes: appt.notes || "",
      sendReminder: appt.sendReminder,
    })
    setIsDialogOpen(true)
  }

  const handleFormSubmit = async (data: AppointmentInput) => {
    setIsSubmitting(true)
    
    const formData = new FormData()
    formData.append("patientId", data.patientId)
    formData.append("psychologistId", data.psychologistId)
    formData.append("scheduledAt", data.scheduledAt.toISOString())
    formData.append("type", data.type)
    formData.append("modality", data.modality)
    formData.append("duration", String(data.duration))
    formData.append("status", data.status)
    formData.append("notes", data.notes || "")
    formData.append("sendReminder", data.sendReminder ? "true" : "false")

    try {
      let result
      if (selectedAppointment?.id) {
        result = await updateAppointment(selectedAppointment.id, formData)
      } else {
        result = await createAppointment(formData)
      }

      if (result.success) {
        toast.success(
          selectedAppointment?.id 
            ? "Cita actualizada correctamente" 
            : "Nueva cita programada correctamente"
        )
        setIsDialogOpen(false)
        fetchMonthAppointments()
      } else {
        toast.error(result.error || "Ocurrió un error de validación o conflicto")
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al procesar la cita")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  // Citas para la vista detallada por día
  const dailyAppointments = getAppointmentsForDay(currentDate)

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Clinic Header */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground/80">Clínica Preventiva CIPRE</h1>
        </div>
        <p className="text-sm capitalize text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-muted-foreground/10">
          {getFormattedDate()}
        </p>
      </header>

      {/* Header Titulo & Boton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Agenda de Citas
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </h2>
          <p className="text-muted-foreground">Planificación, control de solapamiento y gestión interactiva.</p>
        </div>
        <Button 
          onClick={handleNewAppointmentClick}
          className="gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-5 shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          <Plus className="h-5 h-5" />
          Nueva Cita
        </Button>
      </div>

      {/* Grid de Filtros */}
      <Card className="border-primary/10 bg-card/60 backdrop-blur-md shadow-xl dark:shadow-black/20">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Psicologo */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                Psicólogo
              </label>
              <select 
                value={filterPsychologist}
                onChange={(e) => setFilterPsychologist(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background/50 hover:bg-background/80 focus:border-primary/50 px-3 py-1.5 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">Todos los psicólogos</option>
                {psychologists.map((psy) => (
                  <option key={psy.id} value={psy.id}>
                    {psy.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Cita */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                Tipo de Cita
              </label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background/50 hover:bg-background/80 focus:border-primary/50 px-3 py-1.5 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">Todos los tipos</option>
                <option value="primera">Primera vez</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="cierre">Cierre</option>
              </select>
            </div>

            {/* Vista */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Visualización
              </label>
              <div className="flex h-9">
                <Button
                  variant={viewMode === "mes" ? "default" : "outline"}
                  className="flex-1 rounded-r-none h-full text-xs font-semibold"
                  onClick={() => setViewMode("mes")}
                >
                  Mes
                </Button>
                <Button
                  variant={viewMode === "dia" ? "default" : "outline"}
                  className="flex-1 rounded-l-none h-full text-xs font-semibold"
                  onClick={() => setViewMode("dia")}
                >
                  Día
                </Button>
              </div>
            </div>

            {/* Buscar Paciente */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-primary" />
                Buscar Paciente
              </label>
              <InputGroup className="bg-background/50">
                <InputGroupAddon>
                  <Search className="h-4 w-4 text-muted-foreground/75" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Nombre del paciente..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  className="placeholder:text-muted-foreground/50 text-sm"
                />
              </InputGroup>
            </div>

          </div>

          {/* Leyenda y Estados */}
          <div className="mt-5 pt-4 border-t border-muted/50 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-medium">Tipos de Cita:</span>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                <span className="text-foreground/80">Primera vez</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span className="text-foreground/80">Seguimiento</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                <span className="text-foreground/80">Cierre</span>
              </div>
            </div>
            {isLoading && (
              <span className="text-primary animate-pulse font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping"></span>
                Sincronizando...
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cuerpo Principal del Calendario */}
      <Card className="border-primary/10 shadow-xl overflow-hidden bg-card/45 backdrop-blur-md">
        <CardContent className="p-0">
          
          {/* Navegacion superior del mes */}
          <div className="p-5 border-b border-muted/50 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPrevMonth}
                className="h-8 w-8 hover:bg-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-bold text-foreground min-w-[140px] text-center">
                {months[currentMonth]} {currentYear}
              </h3>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextMonth}
                className="h-8 w-8 hover:bg-background"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={goToToday}
                className="h-8 text-xs font-semibold px-4"
              >
                Hoy
              </Button>
            </div>
          </div>

          {/* VISTA POR MES */}
          {viewMode === "mes" && (
            <div className="grid grid-cols-7 gap-px bg-border/40">
              
              {/* Encabezados de días */}
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="bg-muted/40 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}

              {/* Dias del calendario */}
              {calendarDays.map((item, index) => {
                const dayAppointments = getAppointmentsForDay(item.date)
                const isDayToday = isToday(item.date)
                const isSelected = currentDate.getDate() === item.day && currentDate.getMonth() === item.date.getMonth() && currentDate.getFullYear() === item.date.getFullYear()
                
                // Mostrar un maximo de 3 citas en el mes por celda
                const maxVisible = 2
                const displayAppointments = dayAppointments.filter(a => a.status !== "Cancelada").slice(0, maxVisible)
                const extraCount = dayAppointments.filter(a => a.status !== "Cancelada").length - maxVisible
                
                return (
                  <div
                    key={index}
                    onClick={() => {
                      setCurrentDate(item.date)
                      handleDayClick(item.date)
                    }}
                    className={`min-h-[110px] bg-card/65 p-2 flex flex-col justify-between hover:bg-muted/30 cursor-pointer border-t border-r border-muted/30 transition-all group ${
                      !item.isCurrentMonth ? "opacity-35" : ""
                    }`}
                  >
                    {/* Numero del dia */}
                    <div className="flex justify-between items-center mb-1.5">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                          isDayToday
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : isSelected
                            ? "border border-primary text-primary font-bold bg-primary/5"
                            : "text-foreground group-hover:bg-muted p-1"
                        }`}
                      >
                        {item.day}
                      </span>
                    </div>

                    {/* Contenedor de citas del dia */}
                    <div className="flex-1 flex flex-col gap-1 overflow-hidden justify-start">
                      {displayAppointments.map((appt) => {
                        const style = appointmentTypeColors[appt.type] || appointmentTypeColors.seguimiento
                        const apptDate = new Date(appt.scheduledAt)
                        const time = apptDate.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false
                        })

                        return (
                          <div
                            key={appt.id}
                            onClick={(e) => handleAppointmentClick(appt, e)}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border flex flex-col gap-0.5 truncate transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${style.bg} ${style.border}`}
                            title={`${time} - ${appt.patient.name} ${appt.patient.lastName}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-foreground/90">{time}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                            </div>
                            <span className="truncate max-w-full text-foreground/80">
                              {appt.patient.name}
                            </span>
                          </div>
                        )
                      })}
                      {extraCount > 0 && (
                        <div className="text-[10px] font-bold text-primary/80 pl-1 mt-0.5 flex items-center gap-1 group-hover:text-primary">
                          <span>+{extraCount} más</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* VISTA DETALLADA POR DIA */}
          {viewMode === "dia" && (
            <div className="p-6">
              
              {/* Cabecera del día */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/15 p-4 rounded-lg border border-primary/5">
                <div>
                  <h4 className="text-xl font-extrabold text-foreground capitalize flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {getFormattedDate(currentDate)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Citas programadas para el día de hoy.
                  </p>
                </div>
                <Button 
                  onClick={() => handleDayClick(currentDate)}
                  size="sm"
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Cita para hoy
                </Button>
              </div>

              {/* Listado de citas de hoy */}
              {dailyAppointments.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center border-2 border-dashed border-muted/50 rounded-xl bg-muted/5">
                  <div className="bg-muted/40 p-4 rounded-full mb-3 text-muted-foreground">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <h5 className="text-base font-bold text-foreground">Sin citas programadas</h5>
                  <p className="text-sm text-muted-foreground max-w-xs mt-1">
                    No se encontraron citas agendadas para este día de consulta en particular.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDayClick(currentDate)}
                    className="mt-4 gap-1 text-xs font-semibold border-primary/20 text-primary hover:bg-primary/5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agendar Cita
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dailyAppointments.map((appt) => {
                    const style = appointmentTypeColors[appt.type] || appointmentTypeColors.seguimiento
                    const apptDate = new Date(appt.scheduledAt)
                    const time = apptDate.toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false
                    })

                    return (
                      <div
                        key={appt.id}
                        onClick={(e) => handleAppointmentClick(appt, e)}
                        className={`p-4 rounded-xl border bg-card/80 hover:bg-muted/5 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 ${
                          appt.type === "primera" ? "border-l-purple-500" : appt.type === "seguimiento" ? "border-l-blue-500" : "border-l-pink-500"
                        }`}
                      >
                        {/* Izquierda: Info de Cita y Paciente */}
                        <div className="flex items-start gap-4">
                          {/* Bloque de hora */}
                          <div className="flex flex-col items-center bg-muted/40 py-2 px-3 rounded-lg border border-muted/30 font-mono shrink-0">
                            <Clock className="w-3.5 h-3.5 text-primary mb-1" />
                            <span className="text-sm font-bold text-foreground">{time}</span>
                            <span className="text-[10px] text-muted-foreground">{appt.duration} min</span>
                          </div>

                          {/* Datos del Paciente */}
                          <div className="space-y-1">
                            <h5 className="text-base font-bold text-foreground flex items-center gap-1.5">
                              {appt.patient.name} {appt.patient.lastName}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusBadges[appt.status] || "bg-muted"}`}>
                                {appt.status}
                              </span>
                            </h5>
                            
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-primary" />
                                {appt.psychologist.fullName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3 text-primary" />
                                {appt.modality}
                              </span>
                              {appt.sendReminder && (
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                  <Bell className="w-3 h-3 text-emerald-500" />
                                  Recordatorios Activos
                                </span>
                              )}
                            </div>

                            {appt.notes && (
                              <p className="text-xs text-muted-foreground/80 italic mt-2 max-w-xl pl-2 border-l border-muted-foreground/20">
                                "{appt.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Derecha: Botón Editar */}
                        <div className="shrink-0 flex items-center justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleAppointmentClick(appt, e)}
                            className="text-xs font-semibold px-4 border-primary/20 hover:bg-primary/5 text-primary"
                          >
                            Gestionar Cita
                          </Button>
                        </div>

                      </div>
                    )
                  })}
                </div>
              )}

            </div>
          )}

        </CardContent>
      </Card>

      {/* Modal Dialog interactivo para alta y edicion */}
      <AppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedAppointment}
        patients={patients}
        psychologists={psychologists}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
