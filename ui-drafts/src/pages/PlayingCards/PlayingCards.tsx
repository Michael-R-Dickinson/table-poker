import Card from "./Card"
import CardVariant from "./CardVariant"

const PlayingCards = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-8">
      <div className="grid grid-cols-2 gap-8">
        <Card suit="club" value="8" />
        <Card suit="diamond" value="A" />
        <CardVariant suit="heart" value="K" />
        <CardVariant suit="spade" value="7" />
      </div>
    </div>
  )
}

export default PlayingCards
