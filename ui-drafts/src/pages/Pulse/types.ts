export type BillingCycle = "monthly" | "yearly" | "weekly" | "custom"

export type Category =
  | "entertainment"
  | "productivity"
  | "utilities"
  | "food"
  | "transport"
  | "shopping"
  | "health"
  | "education"
  | "other"

export interface Subscription {
  id: string
  name: string
  amount: number
  billingCycle: BillingCycle
  category: Category
  nextBillingDate: string
  logo?: string
  notes?: string
  isActive: boolean
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: Category
  subscriptionId?: string
  tags?: string[]
  notes?: string
}

export interface MonthlyStats {
  totalSpend: number
  activeSubscriptions: number
  upcomingBills: number
  savingsRate: number
  spendChange: number
  subscriptionChange: number
  billsChange: number
  savingsChange: number
}

export interface BudgetAlert {
  category: Category
  budgetLimit: number
  currentSpend: number
  percentUsed: number
  status: "warning" | "danger"
}

export interface CashflowDataPoint {
  month: string
  income: number
  expenses: number
}

export interface UserProfile {
  name: string
  email: string
  avatar?: string
  currency: string
}

export interface NotificationSettings {
  billReminders: {
    sevenDaysBefore: boolean
    oneDayBefore: boolean
  }
  budgetAlerts: {
    approaching: boolean
    exceeded: boolean
  }
  subscriptionReminders: {
    renewals: boolean
  }
  emailEnabled: boolean
  pushEnabled: boolean
}
