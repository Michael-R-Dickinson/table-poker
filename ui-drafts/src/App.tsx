import { Route, Switch } from "wouter"
import Design1 from "./pages/Design1/Design1"
import Home from "./pages/Home"
import Pulse from "./pages/Pulse"
import NotFoundPage from "./pages/NotFoundPage"
import MobilePokerPage from "./pages/MobilePoker"
import PlayingCards from "./pages/PlayingCards/PlayingCards"

function App() {
  return (
    <Switch>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/design1">
        <Design1 />
      </Route>
      <Route path="/pulse/:rest*">
        <Pulse />
      </Route>
      <Route path="/mobile-poker">
        <MobilePokerPage />
      </Route>
      <Route path="/playing-cards">
        <PlayingCards />
      </Route>
      <NotFoundPage />
    </Switch>
  )
}

export default App
