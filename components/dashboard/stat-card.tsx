import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  iconBgColor: string
  iconColor: string
}

export function StatCard({ icon: Icon, value, label, iconBgColor, iconColor }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div
        className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBgColor)}
      >
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
      <div>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
