import { DollarSign, CreditCard, AlertCircle, TrendingUp } from "lucide-react"
import { StatCard } from "../components/StatCard"
import { CashflowChart } from "../components/CashflowChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  monthlyStats,
  cashflowData,
  upcomingBills,
  budgetAlerts,
} from "../data"
import { cn } from "@/lib/utils"

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your financial overview for December 2025
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Monthly Spend"
          value={`$${monthlyStats.totalSpend.toLocaleString()}`}
          change={monthlyStats.spendChange}
          icon={DollarSign}
        />
        <StatCard
          label="Active Subscriptions"
          value={monthlyStats.activeSubscriptions}
          change={monthlyStats.subscriptionChange}
          icon={CreditCard}
        />
        <StatCard
          label="Upcoming Bills (7d)"
          value={monthlyStats.upcomingBills}
          change={monthlyStats.billsChange}
          icon={AlertCircle}
        />
        <StatCard
          label="Savings Rate"
          value={`${monthlyStats.savingsRate}%`}
          change={monthlyStats.savingsChange}
          icon={TrendingUp}
        />
      </div>

      <CashflowChart data={cashflowData} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Upcoming Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingBills.map((bill) => {
                const daysUntil = Math.ceil(
                  (new Date(bill.nextBillingDate).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
                return (
                  <div key={bill.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{bill.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {daysUntil === 0
                            ? "Today"
                            : daysUntil === 1
                            ? "Tomorrow"
                            : `In ${daysUntil} days`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          ${bill.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {bill.billingCycle}
                        </p>
                      </div>
                    </div>
                    {upcomingBills.indexOf(bill) < upcomingBills.length - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Budget Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetAlerts.map((alert) => (
                <div
                  key={alert.category}
                  className={cn(
                    "rounded-lg border p-4",
                    alert.status === "danger"
                      ? "border-destructive/20 bg-destructive/5"
                      : "border-warning/20 bg-warning/5"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium capitalize">
                          {alert.category}
                        </p>
                        <Badge
                          variant={
                            alert.status === "danger" ? "destructive" : "secondary"
                          }
                          className="text-xs"
                        >
                          {alert.percentUsed.toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ${alert.currentSpend.toFixed(2)} of $
                        {alert.budgetLimit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full transition-all",
                        alert.status === "danger" ? "bg-destructive" : "bg-warning"
                      )}
                      style={{ width: `${Math.min(alert.percentUsed, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
