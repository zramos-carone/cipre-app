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
    <div className="p-6 lg:p-8">
      {/* Clinic Header */}
      <header className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between select-none">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Clínica Preventiva CIPRE</h1>
        </div>
        <p className="text-sm capitalize text-muted-foreground">{formattedCurrentDate}</p>
      </header>

      {/* Title */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Historial Clínico</h2>
          <p className="text-muted-foreground">Expediente y viñetas de sesiones clínicas</p>
        </div>
        {selectedPatientId && (
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Sesión
          </Button>
        )}
      </div>

      {/* Patient Selector */}
      <Card className="mb-6 border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
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
          <Card className="border-border/50 shadow-sm bg-card">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-inner shrink-0 select-none">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 w-full text-center md:text-left">
                  <h3 className="text-xl font-bold text-foreground">
                    {selectedPatient.name} {selectedPatient.lastName}
                  </h3>
                  
                  {loadingNotes ? (
                    <div className="mt-4 flex items-center justify-center md:justify-start text-sm text-muted-foreground animate-pulse">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                      Procesando expediente clínico...
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left border-t border-border/50 pt-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total de Sesiones</p>
                        <p className="font-bold text-foreground mt-0.5 text-base">{totalSessions} sesiones</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primera Sesión</p>
                        <p className="font-bold text-foreground mt-0.5 text-base">{firstSessionDate}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Última Sesión</p>
                        <p className="font-bold text-foreground mt-0.5 text-base">{lastSessionDate}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Psicólogo Asignado</p>
                        <p className="font-bold text-foreground mt-0.5 text-base">{assignedPsychologist}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground/95 flex items-center gap-2 mb-2 select-none">
              <Calendar className="w-5 h-5 text-primary" />
              Línea de Tiempo de Sesiones
            </h3>
            
            {loadingNotes ? (
              <div className="py-12 flex flex-col items-center justify-center bg-card rounded-xl border border-border/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Cargando sesiones del historial...</p>
              </div>
            ) : notes.length > 0 ? (
              <div className="space-y-0 relative border-l border-primary/20 ml-5 pl-8 py-2">
                {notes.map((session, index) => {
                  const isExpanded = !!expandedNotes[session.id]
                  return (
                    <div key={session.id} className="relative mb-6 last:mb-0">
                      
                      {/* Timeline Node Icon (Sesión Número) */}
                      <span className="absolute -left-[53px] top-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25 border-4 border-background select-none">
                        {notes.length - index}
                      </span>

                      {/* Session Card */}
                      <Card className="border-border/50 shadow-sm bg-card hover:border-primary/30 transition-all duration-200">
                        
                        {/* Header Colapsable */}
                        <div 
                          onClick={() => toggleNote(session.id)}
                          className="px-5 py-4 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <h4 className="font-bold text-foreground">Sesión #{notes.length - index}</h4>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                              <Calendar className="h-4 w-4 text-primary shrink-0" />
                              {new Date(session.sessionDate).toLocaleDateString("es-ES")}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium">
                              <Clock className="h-4 w-4 text-primary shrink-0" />
                              {session.sessionTime} ({session.duration} min)
                            </div>
                            <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary uppercase tracking-wider">
                              {session.emotionalState}
                            </span>
                          </div>
                          
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </Button>
                        </div>

                        {/* Contenido Expandido (Desglose) */}
                        {isExpanded && (
                          <CardContent className="px-5 pb-5 pt-0 border-t border-border/50 divide-y divide-border/50 space-y-4">
                            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5" />
                                  Psicólogo
                                </span>
                                <p className="text-sm font-medium text-foreground">{session.psychologist.fullName}</p>
                              </div>
                              {session.nextSession && (
                                <div className="space-y-1">
                                  <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                    Próxima Sesión Sugerida
                                  </span>
                                  <p className="text-sm font-medium text-foreground">{session.nextSession}</p>
                                </div>
                              )}
                            </div>

                            <div className="pt-4 space-y-3">
                              <div className="space-y-1.5">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                                  <Smile className="w-3.5 h-3.5" />
                                  Motivo de Consulta
                                </span>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{session.reason}</p>
                              </div>
                            </div>

                            <div className="pt-4 space-y-3">
                              <div className="space-y-1.5">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5" />
                                  Observaciones Clínicas y Técnicas
                                </span>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{session.observations}</p>
                              </div>
                            </div>

                            <div className="pt-4 space-y-3">
                              <div className="space-y-1.5">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5" />
                                  Plan de Acción (Tareas)
                                </span>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{session.actionPlan}</p>
                              </div>
                            </div>
                          </CardContent>
                        )}

                      </Card>
                    </div>
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
