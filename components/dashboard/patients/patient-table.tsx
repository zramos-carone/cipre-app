"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

interface PatientTableProps {
  patients: Patient[]
  onEdit?: (patient: Patient) => void
  onDelete?: (id: string) => void
}

export function PatientTable({ patients, onEdit, onDelete }: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card/50 rounded-xl border border-dashed border-muted-foreground/20 backdrop-blur-sm">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No hay pacientes registrados</h3>
        <p className="text-muted-foreground">Comienza agregando un nuevo paciente al sistema.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card/30 backdrop-blur-md shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="font-bold text-foreground">Nombre</TableHead>
            <TableHead className="font-bold text-foreground">Contacto</TableHead>
            <TableHead className="font-bold text-foreground">Fecha Registro</TableHead>
            <TableHead className="font-bold text-foreground text-right px-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id} className="group hover:bg-primary/5 transition-colors">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{patient.name} {patient.lastName}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {patient.email && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {patient.email}
                    </span>
                  )}
                  {patient.phone && (
                    <Badge variant="outline" className="w-fit text-[10px] py-0">
                      {patient.phone}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {new Date(patient.createdAt).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right px-6">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit?.(patient)}
                    aria-label="Editar paciente"
                    className="hover:bg-blue-500/20 hover:text-blue-500 transition-all rounded-full h-9 w-9"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete?.(patient.id)}
                    aria-label="Eliminar paciente"
                    className="hover:bg-red-500/20 hover:text-red-500 transition-all rounded-full h-9 w-9"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
