"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InformedConsentForm, PatientOption } from "./informed-consent-form"

interface InformedConsentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: PatientOption[]
  onSubmit: (data: { patientId: string; templateId: string; date: string }) => Promise<void> | void
  isSubmitting?: boolean
}

export function InformedConsentDialog({
  open,
  onOpenChange,
  patients,
  onSubmit,
  isSubmitting = false,
}: InformedConsentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border border-primary/10 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-2xl font-bold text-primary">
            Nuevo Consentimiento Informado
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Complete el formulario para vincular un documento de consentimiento autorizado a un expediente de paciente.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <InformedConsentForm
            patients={patients}
            onSubmit={async (data) => {
              await onSubmit(data)
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
