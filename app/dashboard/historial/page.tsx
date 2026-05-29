"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Smile,
  FileText,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react"
import {
  getLinkedPatients,
  getClinicalNotesByPatient,
  createClinicalNote
} from "@/lib/actions/clinical-notes"
import { NuevaSesionDialog } from "@/components/dashboard/historial/nueva-sesion-dialog"
import { ClinicalNoteInput } from "@/lib/validations/clinical-note"

function getFormattedDate(dateInput?: Date | string) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }
  const date = dateInput ? new Date(dateInput) : new Date()
  return date.toLocaleDateString("es-ES", options)
}

export default function HistorialClinicoPage() {
  const { data: session } = useSession()
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [notes, setNotes] = useState<any[]>([])
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  // Estados de carga
  const [loadingPatients, setLoadingPatients] = useState<boolean>(true)
  const [loadingNotes, setLoadingNotes] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const formattedCurrentDate = getFormattedDate()

  // 1. Cargar pacientes vinculados al montar el componente
  useEffect(() => {
    async function loadPatients() {
      setLoadingPatients(true)
      const res = await getLinkedPatients()
      if (res.success && res.data) {
        setPatients(res.data)
      } else {
        toast.error(res.error || "Error al cargar la lista de pacientes")
      }
      setLoadingPatients(false)
    }
    loadPatients()
  }, [])

  // 2. Cargar notas clínicas del paciente seleccionado
  useEffect(() => {
    if (!selectedPatientId) {
      setNotes([])
      return
    }

    async function loadNotes() {
      setLoadingNotes(true)
      const res = await getClinicalNotesByPatient(selectedPatientId)
      if (res.success && res.data) {
        setNotes(res.data)
        // Por defecto, expandir la nota más reciente (la primera)
        if (res.data.length > 0) {
          setExpandedNotes({ [res.data[0].id]: true })
        } else {
          setExpandedNotes({})
        }
      } else {
        toast.error(res.error || "Error al cargar el historial del paciente")
      }
      setLoadingNotes(false)
    }
    loadNotes()
  }, [selectedPatientId])

  // Obtener datos del paciente seleccionado
  const selectedPatient = patients.find((p) => p.id === selectedPatientId)

  // Metadatos calculados de la sesión
  const totalSessions = notes.length
  const firstSessionDate = notes.length > 0
    ? new Date(notes[notes.length - 1].sessionDate).toLocaleDateString("es-ES")
    : "Ninguna"
  const lastSessionDate = notes.length > 0
    ? new Date(notes[0].sessionDate).toLocaleDateString("es-ES")
    : "Ninguna"
  const assignedPsychologist = notes.length > 0
    ? notes[0].psychologist.fullName
    : (session?.user?.name || "No asignado")

  // Alternar el desglose rápido de una nota
  const toggleNote = (id: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Manejar el guardado de una nueva sesión
  const handleCreateNote = async (data: ClinicalNoteInput) => {
    setIsSubmitting(true)

    // Crear FormData para enviar al Server Action
    const formData = new FormData()
    formData.append("patientId", data.patientId)
    formData.append("sessionDate", data.sessionDate.toISOString().split('T')[0])
    formData.append("sessionTime", data.sessionTime)
    formData.append("duration", String(data.duration))
    formData.append("reason", data.reason)
    formData.append("observations", data.observations)
    formData.append("emotionalState", data.emotionalState)
    formData.append("actionPlan", data.actionPlan)
    if (data.nextSession) {
      formData.append("nextSession", data.nextSession)
    }

    const res = await createClinicalNote(formData)

    if (res.success) {
      toast.success("Sesión clínica registrada correctamente")
      setIsDialogOpen(false)
      // Recargar notas del paciente para actualizar el Timeline
      const notesRes = await getClinicalNotesByPatient(selectedPatientId)
      if (notesRes.success && notesRes.data) {
        setNotes(notesRes.data)
        // Expandir la nota recién creada
        if (notesRes.data.length > 0) {
          setExpandedNotes({ [notesRes.data[0].id]: true })
        }
      }
    } else {
      toast.error(res.error || "Ocurrió un error al guardar la sesión")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Clinic Header */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between select-none">
        <div>
          <h1 className="text-lg font-semibold text-foreground/80">Clínica Preventiva PSIPRE</h1>
        </div>
        <p className="text-sm capitalize text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-muted-foreground/10">
          {formattedCurrentDate}
        </p>
      </header>

      {/* Header Titulo & Boton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Historial Clínico
            <FileText className="w-5 h-5 text-primary animate-pulse" />
          </h2>
          <p className="text-muted-foreground">Expediente y viñetas de sesiones clínicas</p>
        </div>
        {selectedPatientId && (
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-5 shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer flex items-center justify-center"
          >
            <Plus className="h-5 w-5" />
            Nueva Sesión
          </Button>
        )}
      </div>

      {/* Patient Selector */}
      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="max-w-md">
            <label className="mb-2 block text-sm font-semibold text-foreground/80">
              Seleccionar Paciente
            </label>
            {loadingPatients ? (
              <div className="flex h-10 w-full items-center justify-center rounded-lg border border-input bg-background/50 text-muted-foreground text-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                Cargando listado de pacientes...
              </div>
            ) : (
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="w-full bg-background border-input h-10">
                  <SelectValue placeholder="Seleccione un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.length > 0 ? (
                    patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.lastName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No se encontraron pacientes vinculados
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Info & Sessions */}
      {selectedPatientId && selectedPatient && (
        <div className="space-y-6">
          {/* Patient Info Card */}
          <Card className="border-slate-100 shadow-sm bg-card">
            <CardContent className="py-6">
              <div className="flex items-center gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500 shrink-0 select-none">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1 w-full">
                  {loadingNotes ? (
                    <div className="flex items-center text-sm text-muted-foreground animate-pulse">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                      Procesando expediente clínico...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full text-left">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 leading-tight">
                          {selectedPatient.name} {selectedPatient.lastName}
                        </h3>
                        <p className="text-xs font-medium text-slate-400 mt-2">Total de Sesiones</p>
                        <p className="font-bold text-slate-700 text-sm mt-0.5">{totalSessions} sesiones</p>
                      </div>
                      <div className="flex flex-col justify-end">
                        <p className="text-xs font-medium text-slate-400">Primera Sesión</p>
                        <p className="font-bold text-slate-700 text-sm mt-0.5">{firstSessionDate}</p>
                      </div>
                      <div className="flex flex-col justify-end">
                        <p className="text-xs font-medium text-slate-400">Última Sesión</p>
                        <p className="font-bold text-slate-700 text-sm mt-0.5">{lastSessionDate}</p>
                      </div>
                      <div className="flex flex-col justify-end">
                        <p className="text-xs font-medium text-slate-400">Psicólogo Asignado</p>
                        <p className="font-bold text-slate-700 text-sm mt-0.5">{assignedPsychologist}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Timeline */}
          <div className="space-y-4">
            <h3 className="sr-only">Línea de Tiempo de Sesiones</h3>

            {loadingNotes ? (
              <div className="py-12 flex flex-col items-center justify-center bg-card rounded-xl border border-border/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Cargando sesiones del historial...</p>
              </div>
            ) : notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((session, index) => {
                  const isExpanded = !!expandedNotes[session.id]
                  return (
                    <Card key={session.id} className="border-slate-100 shadow-sm bg-card hover:border-blue-200 transition-all duration-200">

                      <div className="p-6 flex items-start gap-4">
                        {/* Indicador azul de número de sesión */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg select-none">
                          {notes.length - index}
                        </div>

                        {/* Contenido derecho de la sesión */}
                        <div className="flex-1 min-w-0">

                          {/* Fila superior: Titulo y botón de expandir */}
                          <div
                            onClick={() => toggleNote(session.id)}
                            className="flex items-center justify-between cursor-pointer select-none"
                          >
                            <div>
                              <h4 className="text-base font-bold text-slate-800">Sesión #{notes.length - index}</h4>

                              {/* Metadata de fecha, duración, estado emocional y completada */}
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400 font-medium">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  {new Date(session.sessionDate).toISOString().split('T')[0]}
                                </div>
                                <div>{session.duration} min</div>
                                {session.emotionalState && (
                                  <div>• {session.emotionalState}</div>
                                )}
                                <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700">
                                  Completada
                                </span>
                              </div>
                            </div>

                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </Button>
                          </div>

                          {/* Contenido Expandido */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                              <div className="space-y-1">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Motivo de Consulta:
                                </span>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                  {session.reason}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Observaciones:
                                </span>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                  {session.observations}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Plan de Acción:
                                </span>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                  {session.actionPlan}
                                </p>
                              </div>

                              {/* Mostrar detalles de psicólogo y próxima cita si existen */}
                              {(session.psychologist?.fullName || session.nextSession) && (
                                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {session.psychologist?.fullName && (
                                    <div className="space-y-0.5">
                                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Psicólogo registrado:
                                      </span>
                                      <p className="text-sm text-slate-600 font-medium">
                                        {session.psychologist.fullName}
                                      </p>
                                    </div>
                                  )}
                                  {session.nextSession && (
                                    <div className="space-y-0.5">
                                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Próxima sesión sugerida:
                                      </span>
                                      <p className="text-sm text-slate-600 font-medium">
                                        {session.nextSession}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="border-border/50 bg-muted/5 dark:bg-card/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center select-none">
                  <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground/60" />
                  <h4 className="font-bold text-foreground/80 mb-1">Sin historial registrado</h4>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Este paciente aún no cuenta con sesiones clínicas registradas. Presione "Nueva Sesión" para comenzar.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedPatientId && (
        <Card className="border-border/50 bg-muted/5 dark:bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center select-none">
            <User className="mb-4 h-14 w-14 text-muted-foreground/60 p-3 bg-primary/5 rounded-2xl border border-primary/10" />
            <h3 className="text-lg font-bold text-foreground/80 mb-1">Ningún paciente seleccionado</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Por favor, seleccione un paciente de la lista superior para desplegar su expediente e historial clínico de sesiones.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Nueva Sesión Modal Form */}
      {selectedPatientId && selectedPatient && (
        <NuevaSesionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          patientId={selectedPatientId}
          patientName={`${selectedPatient.name} ${selectedPatient.lastName}`}
          onSubmit={handleCreateNote}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}
