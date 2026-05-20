"use client"

import { useState, useEffect } from "react"
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
import { toast } from "sonner"
import { getPatients } from "@/lib/actions/patients"
import { toggleConsentSignature, getInformedConsents, generateInformedConsent } from "@/lib/actions/consent"
import { InformedConsentDialog } from "@/components/dashboard/consentimientos/informed-consent-dialog"

type ConsentStatus = "firmado" | "pendiente"

interface Consent {
  id: number | string
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
  { id: 3, title: "Evaluación Psicológica", icon: "purple" },
]

const mockPatients = [
  { id: "p1", name: "María", lastName: "González" },
  { id: "p2", name: "Juan", lastName: "Pérez" },
  { id: "p3", name: "Ana", lastName: "Martínez" },
  { id: "p4", name: "Carlos", lastName: "López" },
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
  const [consents, setConsents] = useState<Consent[]>(consentsData)
  const [patients, setPatients] = useState<{ id: string; name: string; lastName: string }[]>(mockPatients)
  const [patientFilter, setPatientFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const formattedDate = getFormattedDate()

  useEffect(() => {
    async function loadData() {
      // 1. Cargar pacientes reales de la base de datos
      const patientsRes = await getPatients({ pageSize: 1000 })
      if (patientsRes.success && patientsRes.data?.patients) {
        const dbPatients = patientsRes.data.patients.map((p: any) => ({
          id: p.id,
          name: p.name,
          lastName: p.lastName,
        }))
        // Combinamos mock con reales sin duplicar por ID
        setPatients((prev) => {
          const existingIds = new Set(dbPatients.map((x: any) => x.id))
          const filteredMocks = mockPatients.filter((x) => !existingIds.has(x.id))
          return [...dbPatients, ...filteredMocks]
        })
      }

      // 2. Cargar consentimientos reales de la base de datos
      const consentsRes = await getInformedConsents()
      if (consentsRes.success && consentsRes.data) {
        const dbConsents = consentsRes.data.map((c: any) => {
          const isSigned = c.isSigned
          let title = "Tratamiento Psicológico"
          if (c.documentUrl.includes("datos")) {
            title = "Manejo de Datos Personales"
          } else if (c.documentUrl.includes("evaluacion")) {
            title = "Evaluación Psicológica"
          }
          
          return {
            id: c.id,
            title,
            patient: `${c.patient.name} ${c.patient.lastName}`,
            date: c.signedAt 
              ? new Date(c.signedAt).toISOString().split('T')[0] 
              : new Date().toISOString().split('T')[0],
            status: isSigned ? ("firmado" as const) : ("pendiente" as const),
          }
        })

        setConsents((prev) => {
          const existingIds = new Set(dbConsents.map((x: any) => x.id))
          const filteredMocks = consentsData.filter((x) => !existingIds.has(x.id))
          return [...dbConsents, ...filteredMocks]
        })
      }
    }
    loadData()
  }, [])

  const handleCreateConsent = async (data: { patientId: string; templateId: string; date: string }) => {
    setIsSubmitting(true)
    try {
      const res = await generateInformedConsent(data)
      if (res.success && res.data) {
        const templateTitle = data.templateId === "tratamiento" 
          ? "Tratamiento Psicológico"
          : data.templateId === "datos"
          ? "Manejo de Datos Personales"
          : "Evaluación Psicológica"

        const selectedPatient = patients.find((p) => p.id === data.patientId)

        const newConsent: Consent = {
          id: res.data.id,
          title: templateTitle,
          patient: selectedPatient ? `${selectedPatient.name} ${selectedPatient.lastName}` : "Paciente Nuevo",
          date: data.date,
          status: "pendiente",
        }

        setConsents((prev) => [newConsent, ...prev])
        toast.success("Consentimiento generado correctamente")
        setIsDialogOpen(false)
      } else {
        toast.error(res.error || "No se pudo generar el consentimiento informado")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al conectar con el servidor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleSignature = async (id: string | number, checked: boolean) => {
    // Update local state first for instant UI feedback (optimistic update)
    setConsents((prevConsents) =>
      prevConsents.map((c) =>
        c.id === id ? { ...c, status: checked ? "firmado" : "pendiente" } : c
      )
    )

    const newStatus = checked ? "Firmado" : "Pendiente"
    
    // If it's a database UUID (string containing letters/numbers with hyphens)
    if (typeof id === "string" && id.includes("-")) {
      try {
        const res = await toggleConsentSignature(id, checked)
        if (res.success) {
          toast.success(`Estado actualizado a ${newStatus} exitosamente`)
        } else {
          // Revert on error
          setConsents((prevConsents) =>
            prevConsents.map((c) =>
              c.id === id ? { ...c, status: !checked ? "firmado" : "pendiente" } : c
            )
          )
          toast.error(res.error || "No se pudo actualizar el estado de firma")
        }
      } catch (err) {
        setConsents((prevConsents) =>
          prevConsents.map((c) =>
            c.id === id ? { ...c, status: !checked ? "firmado" : "pendiente" } : c
          )
        )
        toast.error("Error al conectar con el servidor")
      }
    } else {
      // Mock success for local static items
      toast.success(`[Simulado] Estado de firma actualizado a ${newStatus}`)
    }
  }

  const filteredConsents = consents.filter((consent) => {
    if (patientFilter !== "all" && consent.patient !== patientFilter) return false
    if (typeFilter !== "all" && consent.title !== typeFilter) return false
    if (statusFilter !== "all" && consent.status !== statusFilter) return false
    return true
  })

  const uniquePatients = [...new Set(consents.map((c) => c.patient))]
  const uniqueTypes = [...new Set(consents.map((c) => c.title))]

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Clinic Header */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground/80">Clínica Preventiva CIPRE</h1>
        </div>
        <p className="text-sm capitalize text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-muted-foreground/10">
          {formattedDate}
        </p>
      </header>

      {/* Header Titulo & Boton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Consentimientos Informados
            <FileText className="w-5 h-5 text-primary animate-pulse" />
          </h2>
          <p className="text-muted-foreground">Gestión de documentos de autorización, control de firmas y plantillas.</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-5 shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Nuevo Consentimiento
        </Button>
      </div>

        {/* Filters */}
        <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Paciente</label>
                <Select value={patientFilter} onValueChange={setPatientFilter}>
                  <SelectTrigger className="w-full bg-white border border-slate-200 rounded-lg text-slate-700 h-10 px-3">
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Tipo de Consentimiento</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full bg-white border border-slate-200 rounded-lg text-slate-700 h-10 px-3">
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-white border border-slate-200 rounded-lg text-slate-700 h-10 px-3">
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

        {/* Consents List */}
        <div className="space-y-4">
          {filteredConsents.map((consent) => (
            <Card key={consent.id} className="rounded-xl border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50/80">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-[16px] leading-tight">{consent.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">Paciente: {consent.patient}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 flex-wrap">
                      <span>Fecha: {consent.date}</span>
                      {consent.status === "firmado" ? (
                        <button
                          onClick={() => handleToggleSignature(consent.id, false)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#22c55e] cursor-pointer hover:opacity-80 transition-opacity ml-1 bg-green-50/50 px-2 py-0.5 rounded-full border border-green-100/50"
                          title="Haga clic para cambiar a Pendiente"
                        >
                          <CheckCircle className="h-4 w-4 stroke-[2.5]" />
                          Firmado
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleSignature(consent.id, true)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#f97316] cursor-pointer hover:opacity-80 transition-opacity ml-1 bg-amber-50/50 px-2 py-0.5 rounded-full border border-amber-100/50"
                          title="Haga clic para cambiar a Firmado"
                        >
                          <Clock className="h-4 w-4 stroke-[2.5]" />
                          Pendiente
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-lg">
                    <Eye className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredConsents.length === 0 && (
            <Card className="rounded-xl border border-slate-100 shadow-sm bg-white">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-[16px] font-semibold text-slate-700">No se encontraron consentimientos</h3>
                <p className="text-sm text-slate-500 mt-1">Ajusta los filtros o crea un nuevo consentimiento</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Templates Section */}
        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-semibold text-slate-800">Plantillas Disponibles</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-3.5 p-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      template.icon === "green"
                        ? "bg-green-50/80 text-green-600"
                        : template.icon === "purple"
                        ? "bg-purple-50/80 text-purple-600"
                        : "bg-blue-50/80 text-blue-600"
                    }`}
                  >
                    <FileText
                      className={`h-5 w-5 ${
                        template.icon === "green"
                          ? "text-green-600"
                          : template.icon === "purple"
                          ? "text-purple-600"
                          : "text-blue-600"
                      }`}
                    />
                  </div>
                  <span className="font-semibold text-[15px] text-slate-700">{template.title}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      <InformedConsentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        patients={patients}
        onSubmit={handleCreateConsent}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
