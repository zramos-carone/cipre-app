import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ActivityItemProps {
  name: string
  action: string
  time: string
}

export function ActivityItem({ name, action, time }: ActivityItemProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-card-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{action}</p>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  )
}
