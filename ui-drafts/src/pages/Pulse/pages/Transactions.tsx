import { useState } from "react"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FilterBar, FilterItem } from "../components/FilterBar"
import { transactions, subscriptions } from "../data"
import type { Transaction, Category } from "../types"
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

type SortField = "date" | "description" | "amount" | "category"
type SortDirection = "asc" | "desc"

export function Transactions() {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const filteredTransactions = transactions
    .filter((t) => {
      const matchesSearch = t.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesCategory =
        categoryFilter === "all" || t.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "date":
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case "amount":
          aValue = a.amount
          bValue = b.amount
          break
        case "description":
          aValue = a.description
          bValue = b.description
          break
        case "category":
          aValue = a.category
          bValue = b.category
          break
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const activeFiltersCount = [
    searchQuery !== "",
    categoryFilter !== "all",
  ].filter(Boolean).length

  const handleClearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage all your transactions
        </p>
      </div>

      <FilterBar
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
      >
        <FilterItem label="Search">
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-60"
          />
        </FilterItem>
        <FilterItem label="Category">
          <Select
            value={categoryFilter}
            onValueChange={(v) => setCategoryFilter(v as Category | "all")}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="productivity">Productivity</SelectItem>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="transport">Transportation</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="health">Health & Fitness</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>
      </FilterBar>

      <div className="rounded-lg border border-border/10 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 gap-1"
                  onClick={() => handleSort("date")}
                >
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 gap-1"
                  onClick={() => handleSort("description")}
                >
                  Description
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 gap-1"
                  onClick={() => handleSort("category")}
                >
                  Category
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-mr-3 h-8 gap-1"
                  onClick={() => handleSort("amount")}
                >
                  Amount
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className="cursor-pointer"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <TableCell className="font-medium">
                  {new Date(transaction.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      categoryColors[transaction.category]
                    )}
                  >
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ${transaction.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={selectedTransaction !== null}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
      >
        <SheetContent className="w-full sm:max-w-lg">
          {selectedTransaction && (
            <>
              <SheetHeader>
                <SheetTitle>Transaction Details</SheetTitle>
                <SheetDescription>
                  {new Date(selectedTransaction.date).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Description
                  </h3>
                  <p className="mt-1 text-lg font-semibold">
                    {selectedTransaction.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Amount
                  </h3>
                  <p className="mt-1 text-3xl font-semibold">
                    ${selectedTransaction.amount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Category
                  </h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "mt-1 text-sm",
                      categoryColors[selectedTransaction.category]
                    )}
                  >
                    {selectedTransaction.category}
                  </Badge>
                </div>

                {selectedTransaction.subscriptionId && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Related Subscription
                    </h3>
                    <p className="mt-1 text-sm">
                      {
                        subscriptions.find(
                          (s) => s.id === selectedTransaction.subscriptionId
                        )?.name
                      }
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <Button className="w-full" variant="outline">
                    Edit Transaction
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
