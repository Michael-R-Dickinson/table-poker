import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface FilterBarProps {
  children: ReactNode
  activeFiltersCount?: number
  onClearFilters?: () => void
}

export function FilterBar({
  children,
  activeFiltersCount = 0,
  onClearFilters,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/10 bg-card p-4">
      <div className="flex flex-1 flex-wrap items-center gap-3">{children}</div>
      {activeFiltersCount > 0 && onClearFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="gap-1"
        >
          <X className="h-4 w-4" />
          Clear filters
          <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
            {activeFiltersCount}
          </span>
        </Button>
      )}
    </div>
  )
}

interface FilterItemProps {
  label: string
  children: ReactNode
}

export function FilterItem({ label, children }: FilterItemProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}
