interface InfoCardProps {
  title: string
  description: string
}

export function InfoCard({ title, description }: InfoCardProps) {
  return (
    <div className="rounded-lg bg-primary/5 p-4">
      <p className="text-sm font-semibold text-primary">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
