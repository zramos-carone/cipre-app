"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  FileText, 
  User, 
  Calendar, 
  Check, 
  ChevronsUpDown, 
  X,
  FileIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface PatientOption {
  id: string
  name: string
  lastName: string
}

export interface InformedConsentFormProps {
  patients: PatientOption[]
  onSubmit: (data: { patientId: string; templateId: string; date: string }) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

export function InformedConsentForm({
  patients,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: InformedConsentFormProps) {
  const [patientId, setPatientId] = useState<string>("")
  const [templateId, setTemplateId] = useState<string>("")
  const [date, setDate] = useState<string>(() => {
    // Inicializar con la fecha de hoy en formato local YYYY-MM-DD
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })
  
  const [openPatientPopover, setOpenPatientPopover] = useState(false)
  const [validationError, setValidationError] = useState<string>("")

  const templates = [
    { id: "tratamiento", title: "Tratamiento Psicológico" },
    { id: "datos", title: "Manejo de Datos Personales" },
    { id: "evaluacion", title: "Evaluación Psicológica" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError("")

    if (!patientId) {
      setValidationError("Por favor, seleccione un paciente")
      return
    }

    if (!templateId) {
      setValidationError("Por favor, seleccione una plantilla de consentimiento")
      return
    }

    if (!date) {
      setValidationError("Por favor, seleccione una fecha válida")
      return
    }

    onSubmit({
      patientId,
      templateId,
      date,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive dark:bg-destructive/20">
          {validationError}
        </div>
      )}

      <div className="space-y-4">
        {/* Selector de Paciente (Autocomplete) */}
        <div className="flex flex-col">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground/80">
            <User className="h-4 w-4 text-primary shrink-0" />
            Paciente
          </label>
          <Popover open={openPatientPopover} onOpenChange={setOpenPatientPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openPatientPopover}
                className={cn(
                  "w-full h-11 justify-between bg-background text-left font-normal border-input hover:bg-muted/50 rounded-xl transition-all shadow-xs focus-visible:ring-primary/50",
                  !patientId && "text-muted-foreground"
                )}
              >
                {patientId
                  ? (() => {
                      const patient = patients.find((p) => p.id === patientId)
                      return patient ? `${patient.name} ${patient.lastName}` : "Buscar o seleccionar paciente..."
                    })()
                  : "Buscar o seleccionar paciente..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-lg border border-border" align="start">
              <Command className="rounded-xl">
                <CommandInput placeholder="Buscar paciente..." className="h-10 text-sm" />
                <CommandList className="max-h-[220px]">
                  <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
                  <CommandGroup>
                    {patients.map((patient) => (
                      <CommandItem
                        value={`${patient.name} ${patient.lastName}`}
                        key={patient.id}
                        onSelect={() => {
                          setPatientId(patient.id)
                          setValidationError("")
                          setOpenPatientPopover(false)
                        }}
                        className="flex items-center justify-between py-2.5 px-3 cursor-pointer text-sm hover:bg-primary/5 rounded-lg"
                      >
                        <span className="font-medium text-foreground">
                          {patient.name} {patient.lastName}
                        </span>
                        <Check
                          className={cn(
                            "h-4 w-4 text-primary transition-opacity",
                            patient.id === patientId ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Selector de Plantilla */}
        <div className="flex flex-col">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground/80">
            <FileIcon className="h-4 w-4 text-primary shrink-0" />
            Plantilla de Consentimiento
          </label>
          <Select value={templateId} onValueChange={(value) => {
            setTemplateId(value)
            setValidationError("")
          }}>
            <SelectTrigger className="w-full bg-background h-11 border-input rounded-xl shadow-xs transition-all focus-visible:ring-primary/50 text-left font-normal">
              <SelectValue placeholder="Seleccione una plantilla de consentimiento" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-border shadow-md">
              {templates.map((tpl) => (
                <SelectItem key={tpl.id} value={tpl.id} className="cursor-pointer py-2 rounded-lg">
                  {tpl.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Datepicker de Fecha de Generación */}
        <div className="flex flex-col">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground/80">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            Fecha de Emisión
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              setValidationError("")
            }}
            className="bg-background h-11 border-input rounded-xl shadow-xs transition-all focus-visible:ring-primary/50 text-foreground"
          />
        </div>
      </div>

      {/* Botonera Premium */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11 px-5 border-input text-muted-foreground hover:text-foreground rounded-xl transition-all font-semibold active:scale-95 duration-150 shrink-0"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto h-11 px-6 bg-primary text-primary-foreground font-semibold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/95 transition-all active:scale-95 duration-150 shrink-0 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Generando...
            </>
          ) : (
            <>
              <FileText className="h-4.5 w-4.5 shrink-0" />
              Generar Consentimiento
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
