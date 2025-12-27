import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CashflowDataPoint } from "../types"

interface CashflowChartProps {
  data: CashflowDataPoint[]
}

export function CashflowChart({ data }: CashflowChartProps) {
  const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expenses]))
  const chartHeight = 200

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Income vs Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex items-end justify-around" style={{ height: chartHeight }}>
              {data.map((point, idx) => {
                const incomeHeight = (point.income / maxValue) * (chartHeight - 40)
                const expenseHeight = (point.expenses / maxValue) * (chartHeight - 40)

                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="flex items-end gap-1" style={{ height: chartHeight - 40 }}>
                      <div className="group relative flex flex-col justify-end">
                        <div
                          className="w-8 rounded-t bg-chart-1 transition-all hover:opacity-80"
                          style={{ height: `${incomeHeight}px` }}
                        />
                        <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs shadow-md group-hover:block">
                          ${point.income.toLocaleString()}
                        </div>
                      </div>
                      <div className="group relative flex flex-col justify-end">
                        <div
                          className="w-8 rounded-t bg-chart-2 transition-all hover:opacity-80"
                          style={{ height: `${expenseHeight}px` }}
                        />
                        <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs shadow-md group-hover:block">
                          ${point.expenses.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {point.month}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-chart-1" />
                <span className="text-sm text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-chart-2" />
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
