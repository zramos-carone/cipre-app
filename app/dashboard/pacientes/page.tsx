"use client"

import { useState } from "react"
import { Search, Eye, Edit, Phone, Mail, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Patient {
  id: string
  nombreCompleto: string
  edad: number
  telefono: string
  email: string
  ultimaVisita: string
}

const patientsData: Patient[] = [
  {
    id: "1",
    nombreCompleto: "María González Hernández",
    edad: 34,
    telefono: "555-0101",
    email: "maria.g@email.com",
    ultimaVisita: "2026-03-28",
  },
  {
    id: "2",
    nombreCompleto: "Juan Pérez Martínez",
    edad: 28,
    telefono: "555-0102",
    email: "juan.p@email.com",
    ultimaVisita: "2026-04-01",
  },
  {
    id: "3",
    nombreCompleto: "Ana Martínez López",
    edad: 41,
    telefono: "555-0103",
    email: "ana.m@email.com",
    ultimaVisita: "2026-03-30",
  },
  {
    id: "4",
    nombreCompleto: "Carlos López García",
    edad: 52,
    telefono: "555-0104",
    email: "carlos.l@email.com",
    ultimaVisita: "2026-04-02",
  },
  {
    id: "5",
    nombreCompleto: "Laura Rodríguez Sánchez",
    edad: 29,
    telefono: "555-0105",
    email: "laura.r@email.com",
    ultimaVisita: "2026-03-25",
  },
]

function getCurrentDate() {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }
  const date = new Date()
  return date.toLocaleDateString("es-ES", options)
}

export default function PacientesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const currentDate = getCurrentDate()

  const filteredPatients = patientsData.filter((patient) =>
    patient.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8">
      {/* Clinic Header */}
      <header className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Clínica Preventiva CIPRE</h1>
        </div>
        <p className="text-sm capitalize text-muted-foreground">{currentDate}</p>
      </header>

      {/* Title */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ficha de Identificación</h2>
          <p className="text-muted-foreground">Datos básicos de pacientes</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader className="pb-4">
          <InputGroup className="max-w-full">
            <InputGroupAddon align="inline-start">
              <Search className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar paciente por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="pl-6">Nombre Completo</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead className="text-center pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="pl-6 font-medium">{patient.nombreCompleto}</TableCell>
                    <TableCell>{patient.edad} años</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {patient.telefono}
                        </span>
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {patient.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{patient.ultimaVisita}</TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No se encontraron pacientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
