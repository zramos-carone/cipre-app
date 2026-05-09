"use client"

import { useState, useEffect } from "react"
import { LogIn, LogOut, MapPin, Clock, CheckCircle2 } from "lucide-react"

type Registry = {
  id: string
  type: "entrada" | "salida"
  timestamp: string
  location?: { lat: number; lng: number }
  userRole: string
}

export function CheckInOut() {
  const [records, setRecords] = useState<Registry[]>([])
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  // Rol por defecto temporalmente, en un entorno real vendría del auth context
  const currentUserRole = "Psicólogo"

  // Cargar registros locales al montar
  useEffect(() => {
    setCurrentTime(new Date())
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)

    const saved = localStorage.getItem("cipre_asistencia")
    if (saved) {
      setRecords(JSON.parse(saved))
    }
    
    return () => clearInterval(interval)
  }, [])

  const handleRegister = (type: "entrada" | "salida") => {
    setLoading(true)
    
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por tu navegador")
      saveRecord(type)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveRecord(type, {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        console.warn("Error obteniendo ubicación:", error.message)
        saveRecord(type) // Guardamos aunque falle la ubicación
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }

  const saveRecord = (type: "entrada" | "salida", location?: { lat: number, lng: number }) => {
    const newRecord: Registry = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      location,
      userRole: currentUserRole
    }
    
    const updatedRecords = [newRecord, ...records]
    setRecords(updatedRecords)
    localStorage.setItem("cipre_asistencia", JSON.stringify(updatedRecords))
    setLoading(false)
    alert(`¡Registro de ${type} guardado con éxito!`)
  }

  const todayRecords = records.filter(r => {
    const rDate = new Date(r.timestamp)
    const tDate = new Date()
    return rDate.toDateString() === tDate.toDateString()
  })

  // Evitar problemas de hidratación renderizando el tiempo solo en el cliente
  if (!currentTime) return null

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">Control de Asistencia</h3>
          <p className="text-sm text-muted-foreground">
            Registra tu hora de llegada y salida de la clínica.
          </p>
        </div>
        <div className="p-6 pt-0 flex flex-col items-center justify-center space-y-6">
          
          <div className="flex flex-col items-center space-y-2">
            <span className="text-5xl font-bold tabular-nums tracking-tighter">
              {currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-muted-foreground font-medium">
              {currentTime.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div className="flex w-full gap-4">
            <button
              onClick={() => handleRegister("entrada")}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-4 py-2"
            >
              {loading ? "Procesando..." : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Entrada
                </>
              )}
            </button>
            <button
              onClick={() => handleRegister("salida")}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-12 px-4 py-2"
            >
              {loading ? "Procesando..." : (
                <>
                  <LogOut className="mr-2 h-5 w-5" />
                  Salida
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6 border-b">
          <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registros de Hoy
          </h3>
        </div>
        <div className="p-0">
          {todayRecords.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Aún no tienes registros el día de hoy.
            </div>
          ) : (
            <ul className="divide-y">
              {todayRecords.map((record) => (
                <li key={record.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${record.type === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {record.type === 'entrada' ? <LogIn className="h-5 w-5" /> : <LogOut className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{record.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.location ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground" title={`${record.location.lat}, ${record.location.lng}`}>
                        <MapPin className="h-3 w-3" /> GPS
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin ubicación</span>
                    )}
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
