import { Link, useLocation } from "wouter"
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  Settings,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navigation = [
  { name: "Dashboard", href: "/pulse", icon: LayoutDashboard },
  { name: "Subscriptions", href: "/pulse/subscriptions", icon: CreditCard },
  { name: "Transactions", href: "/pulse/transactions", icon: Receipt },
  { name: "Settings", href: "/pulse/settings", icon: Settings },
]

export function Sidebar() {
  const [location] = useLocation()

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border/10 bg-card px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">Pulse</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive =
                    location === item.href ||
                    (item.href !== "/pulse" && location.startsWith(item.href))
                  return (
                    <li key={item.name}>
                      <Link href={item.href}>
                        <a
                          className={cn(
                            "group flex gap-x-3 rounded-lg p-2 text-sm font-medium leading-6 transition-colors",
                            isActive
                              ? "bg-secondary text-foreground"
                              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                          )}
                        >
                          <item.icon
                            className="h-5 w-5 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <div className="flex items-center gap-x-3 rounded-lg p-2 text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Alex Chen</p>
                  <p className="text-xs text-muted-foreground">
                    alex.chen@example.com
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}
