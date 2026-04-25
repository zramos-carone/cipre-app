import { Users, Calendar, DollarSign, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityItem } from "@/components/dashboard/activity-item"
import { InfoCard } from "@/components/dashboard/info-card"

const stats = [
  {
    icon: Users,
    value: "248",
    label: "Pacientes Activos",
    iconBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: Calendar,
    value: "12",
    label: "Citas Hoy",
    iconBgColor: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    icon: DollarSign,
    value: "$48,500",
    label: "Ingresos Mes",
    iconBgColor: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    icon: Activity,
    value: "156",
    label: "Sesiones Realizadas",
    iconBgColor: "bg-rose-100",
    iconColor: "text-rose-600",
  },
]

const recentActivity = [
  { name: "María González", action: "Sesión completada", time: "10:30 AM" },
  { name: "Juan Pérez", action: "Nuevo registro", time: "11:00 AM" },
  { name: "Ana Martínez", action: "Pago registrado", time: "11:45 AM" },
  { name: "Carlos López", action: "Consentimiento firmado", time: "12:15 PM" },
]

const institutionalInfo = [
  {
    title: "Más de 20 años en el mercado",
    description: "Brindando servicios de calidad y prevención",
  },
  {
    title: "Sistema Centralizado",
    description: "Toda la información en un solo lugar",
  },
  {
    title: "Múltiples Perfiles",
    description: "Psicólogos, Recepción y Administración",
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

export default function DashboardPage() {
  const currentDate = getCurrentDate()

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Clínica Preventiva CIPRE</h1>
        </div>
        <p className="text-sm capitalize text-muted-foreground">{currentDate}</p>
      </header>

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Panel Principal</h2>
        <p className="text-muted-foreground">
          Bienvenido al sistema de gestión de la Clínica CIPRE
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {recentActivity.map((activity) => (
                <ActivityItem key={`${activity.name}-${activity.time}`} {...activity} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Institutional Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Información Institucional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {institutionalInfo.map((info) => (
                <InfoCard key={info.title} {...info} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
