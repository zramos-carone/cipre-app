import { getPatients } from "@/lib/actions/patients"
import { PatientsClient } from "@/components/dashboard/patients/patients-client"
import { SearchInput } from "@/components/dashboard/patients/search-input"
import { PaginationControls } from "@/components/dashboard/patients/pagination-controls"
import { Card, CardHeader } from "@/components/ui/card"

interface PageProps {
  searchParams: Promise<{
    query?: string
    page?: string
  }>
}

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

export default async function PacientesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params?.query || ""
  const currentPage = Number(params?.page) || 1
  const pageSize = 8

  const currentDate = getCurrentDate()

  const result = await getPatients({
    query,
    page: currentPage,
    pageSize
  })

  const patients = result.success ? result.data.patients : []
  const totalPages = result.success ? result.data.totalPages : 0

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Clinic Header */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground/80">Clínica Preventiva CIPRE</h1>
        </div>
        <p className="text-sm capitalize text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-muted-foreground/10">
          {currentDate}
        </p>
      </header>

      {/* Main Card with Search and Table */}
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <SearchInput placeholder="Buscar por nombre, email o teléfono..." />
          </div>
        </CardHeader>
        
        <PatientsClient patients={patients} />
        
        <PaginationControls totalPages={totalPages} />
      </Card>
    </div>
  )
}
