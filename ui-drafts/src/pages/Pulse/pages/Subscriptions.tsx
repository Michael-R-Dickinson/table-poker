import { useState } from "react"
import { Plus, Search, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { subscriptions } from "../data"
import type { Subscription, Category } from "../types"
import { cn } from "@/lib/utils"

const categoryColors: Record<Category, string> = {
  entertainment: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  productivity: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  utilities: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  food: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  transport: "bg-green-500/10 text-green-700 dark:text-green-400",
  shopping: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  health: "bg-red-500/10 text-red-700 dark:text-red-400",
  education: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  other: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
}

export function Subscriptions() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null)

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalMonthly = subscriptions
    .filter((sub) => sub.isActive)
    .reduce((sum, sub) => {
      if (sub.billingCycle === "yearly") return sum + sub.amount / 12
      if (sub.billingCycle === "weekly") return sum + sub.amount * 4
      return sum + sub.amount
    }, 0)

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingSubscription(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subscriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your recurring payments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <SubscriptionDialog
            subscription={editingSubscription}
            onClose={() => setIsDialogOpen(false)}
          />
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total monthly cost
              </p>
              <p className="mt-1 text-3xl font-semibold">
                ${totalMonthly.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Active subscriptions
              </p>
              <p className="mt-1 text-3xl font-semibold">
                {subscriptions.filter((s) => s.isActive).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search subscriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSubscriptions.map((subscription) => (
          <Card
            key={subscription.id}
            className="transition-all hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{subscription.name}</h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "mt-2 text-xs",
                      categoryColors[subscription.category]
                    )}
                  >
                    {subscription.category}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(subscription)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-semibold">
                  ${subscription.amount.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{subscription.billingCycle}
                </span>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                Next billing:{" "}
                {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface SubscriptionDialogProps {
  subscription: Subscription | null
  onClose: () => void
}

function SubscriptionDialog({
  subscription,
  onClose,
}: SubscriptionDialogProps) {
  const isEditing = Boolean(subscription)

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Subscription" : "Add Subscription"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update your subscription details"
            : "Add a new recurring subscription"}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Netflix"
            defaultValue={subscription?.name}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="15.99"
              step="0.01"
              defaultValue={subscription?.amount}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cycle">Billing Cycle</Label>
            <Select defaultValue={subscription?.billingCycle || "monthly"}>
              <SelectTrigger id="cycle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select defaultValue={subscription?.category || "other"}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="productivity">Productivity</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="transport">Transportation</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="health">Health & Fitness</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="next-billing">Next Billing Date</Label>
          <Input
            id="next-billing"
            type="date"
            defaultValue={subscription?.nextBillingDate}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Input
            id="notes"
            placeholder="Add any notes..."
            defaultValue={subscription?.notes}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>
          {isEditing ? "Save Changes" : "Add Subscription"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
