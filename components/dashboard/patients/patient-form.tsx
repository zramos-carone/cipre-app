"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { patientSchema, PatientInput } from "@/lib/validations/patient"
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
import { Loader2, Save, User, Mail, Phone, Calendar, Clock, UserCheck, MapPin, Users } from "lucide-react"

interface PatientFormProps {
  initialData?: PatientInput
  onSubmit: (data: PatientInput) => Promise<void>
  isSubmitting?: boolean
}

export function PatientForm({ initialData, onSubmit, isSubmitting }: PatientFormProps) {
  const form = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: initialData?.name || "",
      lastName: initialData?.lastName || "",
      birthDate: initialData?.birthDate || "",
      age: initialData?.age !== undefined && initialData?.age !== null ? (initialData.age as any) : "",
      gender: initialData?.gender || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      emergencyContact: initialData?.emergencyContact || "",
    },
  })

  const handleSubmit = async (values: PatientInput) => {
    await onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Fila 1: Nombre(s) y Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <User className="w-4 h-4 text-primary" />
                    Nombre(s)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej. Juan" 
                      className="bg-background/50 focus-visible:ring-primary/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <User className="w-4 h-4 text-primary" />
                    Apellidos
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej. Pérez García" 
                      className="bg-background/50 focus-visible:ring-primary/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Fila 2: Fecha de Nacimiento, Edad y Género */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-primary" />
                    Fecha de Nacimiento
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      className="bg-background/50 focus-visible:ring-primary/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="w-4 h-4 text-primary" />
                    Edad
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="Ej. 30" 
                      className="bg-background/50 focus-visible:ring-primary/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <UserCheck className="w-4 h-4 text-primary" />
                    Género
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej. Masculino, Femenino" 
                      className="bg-background/50 focus-visible:ring-primary/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Fila 3: Dirección */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-primary" />
                  Dirección
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej. Av. Constitución 456, Col. Centro" 
                    className="bg-background/50 focus-visible:ring-primary/50" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fila 4: Teléfono y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="w-4 h-4 text-primary" />
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="10 dígitos" 
                      className="bg-background/50 focus-visible:ring-primary/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="usuario@ejemplo.com" 
                      className="bg-background/50 focus-visible:ring-primary/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Fila 5: Contacto de Emergencia */}
          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <Users className="w-4 h-4 text-primary" />
                  Contacto de Emergencia
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nombre y teléfono" 
                    className="bg-background/50 focus-visible:ring-primary/50" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {initialData ? "Actualizar Paciente" : "Guardar Paciente"}
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
