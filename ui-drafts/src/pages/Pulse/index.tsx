import { Route, Switch } from "wouter"
import { AppLayout } from "./components/AppLayout"
import { Dashboard } from "./pages/Dashboard"
import { Subscriptions } from "./pages/Subscriptions"
import { Transactions } from "./pages/Transactions"
import { Settings } from "./pages/Settings"

export default function Pulse() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/pulse" component={Dashboard} />
        <Route path="/pulse/subscriptions" component={Subscriptions} />
        <Route path="/pulse/transactions" component={Transactions} />
        <Route path="/pulse/settings" component={Settings} />
      </Switch>
    </AppLayout>
  )
}
