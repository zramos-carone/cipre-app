"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AppointmentInput } from "@/lib/validations/appointment"
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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { 
  Loader2, 
  Save, 
  User, 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  Bell, 
  Check, 
  ChevronsUpDown, 
  Activity 
} from "lucide-react"
import { cn } from "@/lib/utils"

// Schema interno para el formulario dividiendo scheduledAt en fecha y hora
const formSchema = z.object({
  patientId: z.string().min(1, "Debe seleccionar un paciente"),
  psychologistId: z.string().min(1, "Debe seleccionar un psicólogo"),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().min(1, "La hora es requerida"),
  type: z.enum(["primera", "seguimiento", "cierre"], {
    errorMap: () => ({ message: "El tipo de cita no es válido" })
  }),
  modality: z.enum(["Presencial", "En línea"], {
    errorMap: () => ({ message: "La modalidad no es válida" })
  }),
  duration: z.coerce.number()
    .int("La duración debe ser un número entero")
    .min(1, "La duración debe ser de al menos 1 minuto"),
  status: z.enum(["Pendiente", "Confirmada", "Completada", "Cancelada"], {
    errorMap: () => ({ message: "El estado no es válido" })
  }),
  notes: z.string().optional().or(z.literal("")),
  sendReminder: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

interface AppointmentFormProps {
  initialData?: Partial<AppointmentInput> & { id?: string }
  patients: { id: string; name: string; lastName: string }[]
  psychologists: { id: string; fullName: string }[]
  onSubmit: (data: AppointmentInput) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
}

export function AppointmentForm({
  initialData,
  patients,
  psychologists,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: AppointmentFormProps) {
  const [openPatientPopover, setOpenPatientPopover] = useState(false)

  // Separar fecha y hora para inicialización
  const getInitDate = () => {
    if (!initialData?.scheduledAt) return ""
    const d = new Date(initialData.scheduledAt)
    if (isNaN(d.getTime())) return ""
    // Formato local YYYY-MM-DD
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getInitTime = () => {
    if (!initialData?.scheduledAt) return ""
    const d = new Date(initialData.scheduledAt)
    if (isNaN(d.getTime())) return ""
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: initialData?.patientId || "",
      psychologistId: initialData?.psychologistId || "",
      date: getInitDate(),
      time: getInitTime(),
      type: initialData?.type || "seguimiento",
      modality: initialData?.modality || "Presencial",
      duration: initialData?.duration || 60,
      status: initialData?.status || "Pendiente",
      notes: initialData?.notes || "",
      sendReminder: initialData?.sendReminder || false,
    },
  })

  const handleSubmit = async (values: FormValues) => {
    // Combinar fecha y hora en scheduledAt
    const scheduledAt = new Date(`${values.date}T${values.time}`)
    
    const payload: AppointmentInput = {
      patientId: values.patientId,
      psychologistId: values.psychologistId,
      scheduledAt,
      type: values.type,
      modality: values.modality,
      duration: values.duration,
      status: values.status,
      notes: values.notes,
      sendReminder: values.sendReminder,
    }

    await onSubmit(payload)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          
          {/* Fila 1: Paciente y Psicólogo Asignado - 50% / 50% */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                    <User className="w-4 h-4 text-primary shrink-0" />
                    Paciente
                  </FormLabel>
                  <Popover open={openPatientPopover} onOpenChange={setOpenPatientPopover}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPatientPopover}
                          className={cn(
                            "w-full h-10 justify-between bg-background text-left font-normal border-input hover:bg-background/80",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? (() => {
                                const patient = patients.find((p) => p.id === field.value)
                                return patient ? `${patient.name} ${patient.lastName}` : "Buscar o seleccionar paciente..."
                              })()
                            : "Buscar o seleccionar paciente..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar paciente..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
                          <CommandGroup>
                            {patients.map((patient) => (
                              <CommandItem
                                value={`${patient.name} ${patient.lastName}`}
                                key={patient.id}
                                onSelect={() => {
                                  form.setValue("patientId", patient.id)
                                  setOpenPatientPopover(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    patient.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {patient.name} {patient.lastName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="psychologistId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                    <User className="w-4 h-4 text-primary shrink-0" />
                    Psicólogo Asignado
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background h-10 border-input">
                        <SelectValue placeholder="Seleccionar psicólogo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {psychologists.map((psychologist) => (
                        <SelectItem key={psychologist.id} value={psychologist.id}>
                          {psychologist.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Fila 2: Tipo de Cita y Modalidad - 50% / 50% */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                    <Activity className="w-4 h-4 text-primary shrink-0" />
                    Tipo de Cita
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background h-10 border-input">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="primera">Primera vez</SelectItem>
                      <SelectItem value="seguimiento">Seguimiento</SelectItem>
                      <SelectItem value="cierre">Cierre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modality"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                    <Video className="w-4 h-4 text-primary shrink-0" />
                    Modalidad
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background h-10 border-input">
                        <SelectValue placeholder="Seleccionar modalidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                      <SelectItem value="En línea">En línea</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Fila 3: Fecha, Hora y Duración - 33.3% / 33.3% / 33.3% */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    Fecha
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

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    Hora
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
                      placeholder="Ej. 60" 
                      className="bg-background h-10 border-input focus-visible:ring-primary/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Fila 4: Estado y Enviar recordatorios - 50% / 50% */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                    <Activity className="w-4 h-4 text-primary shrink-0" />
                    Estado
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background h-10 border-input">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Confirmada">Confirmada</SelectItem>
                      <SelectItem value="Completada">Completada</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sendReminder"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end h-full">
                  {/* Espacio para alinear con la etiqueta del campo de la izquierda en desktop */}
                  <div className="hidden md:block h-6 mb-1" />
                  <div className="border border-border/60 rounded-xl p-3 bg-muted/10 dark:bg-card/30 flex items-center justify-between h-10 md:h-[42px] select-none">
                    <div className="flex items-center gap-2 text-left">
                      <Bell className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground/90 leading-tight">Enviar recordatorios</span>
                        <span className="text-[10px] text-muted-foreground leading-none">Enviar SMS/Email al paciente</span>
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Fila 5: Notas Adicionales - 100% Ancho */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-1">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  Notas Adicionales
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detalles sobre el motivo de consulta, observaciones iniciales o indicaciones..."
                    className="bg-background resize-none h-24 border-input focus-visible:ring-primary/50"
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fila 6: Botones de Acción */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/60 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-10 px-6 font-semibold text-foreground/80 border-input hover:bg-muted transition-all"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-6 font-semibold bg-primary hover:bg-primary/95 text-primary-foreground transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 shrink-0" />
                Guardar Cita
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
