import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  change?: number
  icon?: LucideIcon
  onClick?: () => void
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  onClick,
}: StatCardProps) {
  const showChange = change !== undefined && change !== 0
  const isPositive = change && change > 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-[13px] font-medium text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-[32px] font-semibold leading-none">
              {value}
            </p>
            {showChange && (
              <div className="mt-2 flex items-center gap-1">
                <TrendIcon
                  className={cn(
                    "h-3 w-3",
                    isPositive ? "text-success" : "text-destructive"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-muted p-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
