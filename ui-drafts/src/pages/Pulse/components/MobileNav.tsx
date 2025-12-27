import { Link, useLocation } from "wouter"
import { LayoutDashboard, CreditCard, Receipt, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/pulse", icon: LayoutDashboard },
  { name: "Subscriptions", href: "/pulse/subscriptions", icon: CreditCard },
  { name: "Transactions", href: "/pulse/transactions", icon: Receipt },
  { name: "Settings", href: "/pulse/settings", icon: Settings },
]

export function MobileNav() {
  const [location] = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/10 bg-card lg:hidden">
      <nav className="flex items-center justify-around">
        {navigation.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/pulse" && location.startsWith(item.href))
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive && "fill-current opacity-20"
                  )}
                  aria-hidden="true"
                />
                <span className="font-medium">{item.name}</span>
              </a>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
