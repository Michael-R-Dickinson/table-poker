import type {
  Subscription,
  Transaction,
  MonthlyStats,
  BudgetAlert,
  CashflowDataPoint,
  UserProfile,
  NotificationSettings,
} from "./types"

export const subscriptions: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    amount: 15.99,
    billingCycle: "monthly",
    category: "entertainment",
    nextBillingDate: "2025-01-05",
    isActive: true,
  },
  {
    id: "2",
    name: "Spotify Premium",
    amount: 10.99,
    billingCycle: "monthly",
    category: "entertainment",
    nextBillingDate: "2025-01-10",
    isActive: true,
  },
  {
    id: "3",
    name: "GitHub Pro",
    amount: 7.0,
    billingCycle: "monthly",
    category: "productivity",
    nextBillingDate: "2025-01-15",
    isActive: true,
  },
  {
    id: "4",
    name: "Adobe Creative Cloud",
    amount: 54.99,
    billingCycle: "monthly",
    category: "productivity",
    nextBillingDate: "2025-01-03",
    isActive: true,
  },
  {
    id: "5",
    name: "Amazon Prime",
    amount: 14.99,
    billingCycle: "monthly",
    category: "shopping",
    nextBillingDate: "2025-01-20",
    isActive: true,
  },
  {
    id: "6",
    name: "Notion Pro",
    amount: 10.0,
    billingCycle: "monthly",
    category: "productivity",
    nextBillingDate: "2025-01-08",
    isActive: true,
  },
  {
    id: "7",
    name: "New York Times",
    amount: 4.25,
    billingCycle: "weekly",
    category: "education",
    nextBillingDate: "2025-12-28",
    isActive: true,
  },
  {
    id: "8",
    name: "Planet Fitness",
    amount: 24.99,
    billingCycle: "monthly",
    category: "health",
    nextBillingDate: "2025-01-01",
    isActive: true,
  },
]

export const transactions: Transaction[] = [
  {
    id: "t1",
    date: "2025-12-26",
    description: "Whole Foods Market",
    amount: 87.42,
    category: "food",
  },
  {
    id: "t2",
    date: "2025-12-26",
    description: "Uber Ride",
    amount: 18.5,
    category: "transport",
  },
  {
    id: "t3",
    date: "2025-12-25",
    description: "Netflix Subscription",
    amount: 15.99,
    category: "entertainment",
    subscriptionId: "1",
  },
  {
    id: "t4",
    date: "2025-12-24",
    description: "Starbucks",
    amount: 6.75,
    category: "food",
  },
  {
    id: "t5",
    date: "2025-12-24",
    description: "Amazon Purchase",
    amount: 42.99,
    category: "shopping",
  },
  {
    id: "t6",
    date: "2025-12-23",
    description: "Spotify Premium",
    amount: 10.99,
    category: "entertainment",
    subscriptionId: "2",
  },
  {
    id: "t7",
    date: "2025-12-23",
    description: "Shell Gas Station",
    amount: 52.0,
    category: "transport",
  },
  {
    id: "t8",
    date: "2025-12-22",
    description: "Target",
    amount: 134.56,
    category: "shopping",
  },
  {
    id: "t9",
    date: "2025-12-22",
    description: "Chipotle",
    amount: 13.45,
    category: "food",
  },
  {
    id: "t10",
    date: "2025-12-21",
    description: "Adobe Creative Cloud",
    amount: 54.99,
    category: "productivity",
    subscriptionId: "4",
  },
  {
    id: "t11",
    date: "2025-12-21",
    description: "CVS Pharmacy",
    amount: 28.99,
    category: "health",
  },
  {
    id: "t12",
    date: "2025-12-20",
    description: "Trader Joe's",
    amount: 65.23,
    category: "food",
  },
  {
    id: "t13",
    date: "2025-12-20",
    description: "Notion Pro",
    amount: 10.0,
    category: "productivity",
    subscriptionId: "6",
  },
  {
    id: "t14",
    date: "2025-12-19",
    description: "Uber Eats",
    amount: 32.5,
    category: "food",
  },
  {
    id: "t15",
    date: "2025-12-19",
    description: "GitHub Pro",
    amount: 7.0,
    category: "productivity",
    subscriptionId: "3",
  },
  {
    id: "t16",
    date: "2025-12-18",
    description: "Metro Card Reload",
    amount: 50.0,
    category: "transport",
  },
  {
    id: "t17",
    date: "2025-12-18",
    description: "Best Buy",
    amount: 89.99,
    category: "shopping",
  },
  {
    id: "t18",
    date: "2025-12-17",
    description: "Planet Fitness",
    amount: 24.99,
    category: "health",
    subscriptionId: "8",
  },
]

export const monthlyStats: MonthlyStats = {
  totalSpend: 2547.89,
  activeSubscriptions: 8,
  upcomingBills: 4,
  savingsRate: 22.5,
  spendChange: 8.3,
  subscriptionChange: 0,
  billsChange: -12.5,
  savingsChange: 3.2,
}

export const budgetAlerts: BudgetAlert[] = [
  {
    category: "shopping",
    budgetLimit: 300,
    currentSpend: 285.5,
    percentUsed: 95.2,
    status: "warning",
  },
  {
    category: "food",
    budgetLimit: 400,
    currentSpend: 425.3,
    percentUsed: 106.3,
    status: "danger",
  },
]

export const cashflowData: CashflowDataPoint[] = [
  { month: "Jul", income: 4200, expenses: 3150 },
  { month: "Aug", income: 4200, expenses: 3280 },
  { month: "Sep", income: 4200, expenses: 3100 },
  { month: "Oct", income: 4350, expenses: 3450 },
  { month: "Nov", income: 4200, expenses: 3320 },
  { month: "Dec", income: 4500, expenses: 3500 },
]

export const userProfile: UserProfile = {
  name: "Alex Chen",
  email: "alex.chen@example.com",
  currency: "USD",
}

export const notificationSettings: NotificationSettings = {
  billReminders: {
    sevenDaysBefore: true,
    oneDayBefore: true,
  },
  budgetAlerts: {
    approaching: true,
    exceeded: true,
  },
  subscriptionReminders: {
    renewals: true,
  },
  emailEnabled: true,
  pushEnabled: false,
}

export const upcomingBills = subscriptions
  .filter((sub) => {
    const nextBilling = new Date(sub.nextBillingDate)
    const today = new Date()
    const diffTime = nextBilling.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  })
  .sort(
    (a, b) =>
      new Date(a.nextBillingDate).getTime() -
      new Date(b.nextBillingDate).getTime()
  )
