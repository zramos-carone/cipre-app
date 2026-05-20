"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AppointmentForm } from "./appointment-form"
import { AppointmentInput } from "@/lib/validations/appointment"

interface AppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<AppointmentInput> & { id?: string }
  patients: { id: string; name: string; lastName: string }[]
  psychologists: { id: string; fullName: string }[]
  onSubmit: (data: AppointmentInput) => Promise<void>
  isSubmitting?: boolean
}

export function AppointmentDialog({
  open,
  onOpenChange,
  initialData,
  patients,
  psychologists,
  onSubmit,
  isSubmitting = false,
}: AppointmentDialogProps) {
  const isEditing = !!initialData?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card/90 backdrop-blur-xl border-primary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {isEditing ? "Editar Cita" : "Nueva Cita"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los detalles de la cita agendada a continuación."
              : "Completa el formulario para agendar una nueva cita en el sistema."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AppointmentForm
            initialData={initialData}
            patients={patients}
            psychologists={psychologists}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
