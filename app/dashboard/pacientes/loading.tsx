import { PatientTableSkeleton } from "@/components/dashboard/patients/patient-table-skeleton"
import { Card, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Clinic Header */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-32 rounded-full" />
      </header>

      {/* Main Card */}
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pb-6 pt-0">
          <Skeleton className="h-10 w-full rounded-full" />
        </CardHeader>
        
        <div className="mb-6 flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        <PatientTableSkeleton />
      </Card>
    </div>
  )
}
