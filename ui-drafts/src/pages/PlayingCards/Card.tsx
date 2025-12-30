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
    <div className="relative h-96 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl" style={{ boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 8px 8px 0px 0px rgb(0 0 0 / 0.08)' }}>
      <div className={`absolute left-3 top-3 flex flex-col items-center ${textColor}`}>
        <span className="text-3xl font-bold leading-none">{value}</span>
        <img src={suitImages[suit]} alt={suit} className="h-6 w-6" />
      </div>

      <div className="flex h-full items-center justify-center">
        <img
          src={suitImages[suit]}
          alt={suit}
          className="h-40 w-40 object-contain opacity-90"
        />
      </div>

      <div className={`absolute bottom-3 right-3 flex rotate-180 flex-col items-center ${textColor}`}>
        <span className="text-3xl font-bold leading-none">{value}</span>
        <img src={suitImages[suit]} alt={suit} className="h-6 w-6" />
      </div>
    </div>
  )
}

export default Card
