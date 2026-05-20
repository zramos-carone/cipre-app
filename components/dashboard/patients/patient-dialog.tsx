"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PatientForm } from "./patient-form"
import { PatientInput } from "@/lib/validations/patient"

interface PatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: PatientInput
  onSubmit: (data: PatientInput) => Promise<void>
  isSubmitting?: boolean
}

export function PatientDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting,
}: PatientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] bg-card/90 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {initialData ? "Editar Paciente" : "Nuevo Paciente"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Modifica los datos del paciente a continuación."
              : "Completa el formulario para registrar un nuevo paciente en el sistema."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <PatientForm
            initialData={initialData}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
