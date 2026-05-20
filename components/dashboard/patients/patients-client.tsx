"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatientTable } from "./patient-table"
import { PatientDialog } from "./patient-dialog"
import { PatientInput } from "@/lib/validations/patient"
import { createPatient, updatePatient, deletePatient } from "@/lib/actions/patients"
import { toast } from "sonner"

interface Patient {
  id: string
  name: string
  lastName: string
  email: string | null
  phone: string | null
  birthDate?: Date | string | null
  age?: number | null
  gender?: string | null
  address?: string | null
  emergencyContact?: string | null
  createdAt: Date
}

interface PatientsClientProps {
  patients: Patient[]
}

export function PatientsClient({ patients }: PatientsClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  const handleAddClick = () => {
    setEditingPatient(null)
    setIsDialogOpen(true)
  }

  const handleEditClick = (patient: any) => {
    setEditingPatient(patient)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas desactivar este paciente?")) {
      const result = await deletePatient(id)
      if (result.success) {
        toast.success("Paciente desactivado correctamente")
      } else {
        toast.error(result.error)
      }
    }
  }

  const handleSubmit = async (data: PatientInput) => {
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("lastName", data.lastName)
    if (data.birthDate) formData.append("birthDate", data.birthDate)
    if (data.age !== undefined && data.age !== null) formData.append("age", String(data.age))
    if (data.gender) formData.append("gender", data.gender)
    if (data.address) formData.append("address", data.address)
    if (data.phone) formData.append("phone", data.phone)
    if (data.email) formData.append("email", data.email)
    if (data.emergencyContact) formData.append("emergencyContact", data.emergencyContact)

    try {
      let result
      if (editingPatient) {
        result = await updatePatient(editingPatient.id, formData)
      } else {
        result = await createPatient(formData)
      }

      if (result.success) {
        toast.success(editingPatient ? "Paciente actualizado" : "Paciente registrado")
        setIsDialogOpen(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ficha de Identificación</h2>
          <p className="text-muted-foreground">Datos básicos de pacientes</p>
        </div>
        <Button onClick={handleAddClick} className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Plus className="h-4 w-4" />
          Nuevo Paciente
        </Button>
      </div>

      <PatientTable 
        patients={patients} 
        onEdit={handleEditClick} 
        onDelete={handleDeleteClick} 
      />

      <PatientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingPatient ? {
          name: editingPatient.name,
          lastName: editingPatient.lastName,
          birthDate: editingPatient.birthDate ? (editingPatient.birthDate instanceof Date ? editingPatient.birthDate.toISOString().split('T')[0] : String(editingPatient.birthDate).split('T')[0]) : "",
          age: editingPatient.age !== undefined && editingPatient.age !== null ? editingPatient.age : undefined,
          gender: editingPatient.gender || "",
          address: editingPatient.address || "",
          phone: editingPatient.phone || "",
          email: editingPatient.email || "",
          emergencyContact: editingPatient.emergencyContact || "",
        } : undefined}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
