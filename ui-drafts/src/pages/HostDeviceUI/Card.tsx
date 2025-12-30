import clubImg from "./assets/club.png"
import diamondImg from "./assets/diamond.png"
import heartImg from "./assets/heart.png"
import spadeImg from "./assets/spade.png"

type Suit = "club" | "diamond" | "heart" | "spade"
type Value = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K"

interface CardProps {
  suit: Suit
  value: Value
}

const suitImages = {
  club: clubImg,
  diamond: diamondImg,
  heart: heartImg,
  spade: spadeImg,
}

const suitColors = {
  club: "text-slate-800",
  diamond: "text-red-500",
  heart: "text-red-500",
  spade: "text-slate-800",
}

const Card = ({ suit, value }: CardProps) => {
  const textColor = suitColors[suit]

  return (
    <div className="relative h-32 w-22 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg" style={{ boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 4px 4px 0px 0px rgb(0 0 0 / 0.08)' }}>
      <div className={`absolute left-1 top-1 flex flex-col items-center ${textColor}`}>
        <span className="text-lg font-bold leading-none">{value}</span>
        <img src={suitImages[suit]} alt={suit} className="h-3.5 w-3.5" />
      </div>

      <div className="flex h-full items-center justify-center">
        <img
          src={suitImages[suit]}
          alt={suit}
          className="h-12 w-12 object-contain opacity-90"
        />
      </div>

      <div className={`absolute bottom-1 right-1 flex rotate-180 flex-col items-center ${textColor}`}>
        <span className="text-lg font-bold leading-none">{value}</span>
        <img src={suitImages[suit]} alt={suit} className="h-3.5 w-3.5" />
      </div>
    </div>
  )
}

export default Card
