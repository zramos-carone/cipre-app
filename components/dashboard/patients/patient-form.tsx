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
import { Loader2, Save, User, Mail, Phone } from "lucide-react"

interface PatientFormProps {
  initialData?: PatientInput
  onSubmit: (data: PatientInput) => Promise<void>
  isSubmitting?: boolean
}

export function PatientForm({ initialData, onSubmit, isSubmitting }: PatientFormProps) {
  const form = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData || {
      fullName: "",
      email: "",
      phone: "",
    },
  })

  const handleSubmit = async (values: PatientInput) => {
    await onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Nombre Completo
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej. Juan Pérez García" 
                    className="bg-background/50 focus-visible:ring-primary/50" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Correo Electrónico
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

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
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
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {initialData ? "Actualizar Paciente" : "Registrar Paciente"}
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
