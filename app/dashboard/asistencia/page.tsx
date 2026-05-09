import { Metadata } from "next"
import { CheckInOut } from "@/components/asistencia/CheckInOut"

export const metadata: Metadata = {
  title: "Asistencia | CIPRE",
  description: "Registro de entradas y salidas del personal.",
}

export default function AsistenciaPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Control de Asistencia</h2>
      </div>
      <div className="hidden space-y-4 md:block">
        <p className="text-muted-foreground">
          Utiliza este módulo para registrar tus horas de entrada y salida de las instalaciones. 
          Tu ubicación actual será capturada para validación.
        </p>
      </div>
      
      <div className="mt-6">
        <CheckInOut />
      </div>
    </div>
  )
}
