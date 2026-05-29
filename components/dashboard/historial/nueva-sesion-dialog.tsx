"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { clinicalNoteSchema, ClinicalNoteInput } from "@/lib/validations/clinical-note"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  Save,
  User,
  Calendar,
  Clock,
  Smile,
  FileText,
  ArrowRight
} from "lucide-react"

// Schema interno para el formulario adaptando sessionDate a string (yyyy-MM-dd) para el input de fecha HTML5
const formSchema = z.object({
  patientId: z.string().min(1, "Debe seleccionar un paciente"),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().min(1, "La hora es requerida")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "La hora debe tener el formato HH:MM (24 horas)"),
  duration: z.coerce.number()
    .int("La duración debe ser un número entero")
    .min(1, "La duración debe ser de al menos 1 minuto"),
  reason: z.string()
    .min(2, "El motivo de la consulta debe tener al menos 2 caracteres")
    .max(1000, "El motivo es demasiado largo"),
  observations: z.string()
    .min(2, "Las observaciones de la sesión deben tener al menos 2 caracteres"),
  emotionalState: z.string()
    .min(1, "El estado emocional observado es requerido")
    .max(100, "El estado emocional es demasiado largo"),
  actionPlan: z.string()
    .min(2, "El plan de acción debe tener al menos 2 caracteres"),
  nextSession: z.string()
    .max(200, "La sugerencia de la próxima cita es demasiado larga")
    .optional()
    .or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface NuevaSesionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  patientName: string
  onSubmit: (data: ClinicalNoteInput) => Promise<void>
  isSubmitting?: boolean
}

export function NuevaSesionDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  onSubmit,
  isSubmitting = false,
}: NuevaSesionDialogProps) {

  // Inicializamos la fecha de hoy en formato local YYYY-MM-DD
  const getTodayDateString = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Inicializamos la hora actual en formato HH:MM
  const getCurrentTimeString = () => {
    const d = new Date()
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: patientId || "",
      date: getTodayDateString(),
      time: getCurrentTimeString(),
      duration: 50,
      reason: "",
      observations: "",
      emotionalState: "",
      actionPlan: "",
      nextSession: "",
    },
  })

  // Sincronizar el patientId si cambia al abrir el diálogo para otro paciente
  if (form.getValues("patientId") !== patientId && patientId) {
    form.setValue("patientId", patientId)
  }

  const handleSubmit = async (values: FormValues) => {
    // Combinar la fecha y la hora en un único objeto Date
    const sessionDate = new Date(`${values.date}T${values.time}`)

    const payload: ClinicalNoteInput = {
      patientId: values.patientId,
      sessionDate,
      sessionTime: values.time,
      duration: values.duration,
      reason: values.reason,
      observations: values.observations,
      emotionalState: values.emotionalState,
      actionPlan: values.actionPlan,
      nextSession: values.nextSession,
    }

    await onSubmit(payload)
    // Limpiamos los campos de texto específicos de la sesión tras un envío exitoso
    form.reset({
      patientId: patientId,
      date: getTodayDateString(),
      time: getCurrentTimeString(),
      duration: 50,
      reason: "",
      observations: "",
      emotionalState: "",
      actionPlan: "",
      nextSession: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card/95 backdrop-blur-xl border border-primary/20 max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Nueva Sesión Clínica
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Complete los campos estructurados para registrar las viñetas clínicas de la sesión en el expediente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">

            {/* Cabecera / Paciente Asignado */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 select-none">
              <User className="w-5 h-5 text-primary shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">Expediente del Paciente</span>
                <span className="text-sm font-bold text-foreground mt-0.5">{patientName}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Grid 1: Datos de Sesión (Fecha, Hora, Duración, Estado Emocional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Fecha de Sesión */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        Fecha de la Sesión
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-background h-10 border-input focus-visible:ring-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hora de Sesión */}
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        Hora de la Sesión
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          className="bg-background h-10 border-input focus-visible:ring-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duración (Minutos) */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        Duración (minutos)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej. 50"
                          className="bg-background h-10 border-input focus-visible:ring-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estado Emocional Observado */}
                <FormField
                  control={form.control}
                  name="emotionalState"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                        <Smile className="w-4 h-4 text-primary shrink-0" />
                        Estado Emocional Observado
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej. Receptivo, irritable, ansioso..."
                          className="bg-background h-10 border-input focus-visible:ring-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              {/* Grid 2: Notas y Descripciones (Motivo, Observaciones, Plan de Acción) */}
              <div className="space-y-4">

                {/* Motivo de Consulta */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        Motivo de Consulta
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Breve descripción del motivo principal de la sesión..."
                          className="bg-background resize-none h-20 border-input focus-visible:ring-primary/50"
                          maxLength={1000}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Observaciones */}
                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        Observaciones y Técnicas Aplicadas
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Desarrollo de la sesión, técnicas aplicadas, reacciones del paciente..."
                          className="bg-background resize-none h-28 border-input focus-visible:ring-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Plan de Acción */}
                <FormField
                  control={form.control}
                  name="actionPlan"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        Plan de Acción (Tareas)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Acuerdos, tareas asignadas para la semana, seguimiento..."
                          className="bg-background resize-none h-20 border-input focus-visible:ring-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Próxima Cita Sugerida */}
                <FormField
                  control={form.control}
                  name="nextSession"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                        <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                        Próxima Sesión Sugerida
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej. En 7 días, Siguiente martes, Pendiente..."
                          className="bg-background h-10 border-input focus-visible:ring-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

            </div>

            {/* Fila de Botones de Acción */}
            <div className="pt-4 border-t border-border/60 mt-2 flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar Sesión
                  </>
                )}
              </Button>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
