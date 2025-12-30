import clubImg from "./assets/club.png"
import diamondImg from "./assets/diamond.png"
import heartImg from "./assets/heart.png"
import spadeImg from "./assets/spade.png"

type Suit = "club" | "diamond" | "heart" | "spade"
type Value = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K"

interface CardVariantProps {
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

const CardVariant = ({ suit, value }: CardVariantProps) => {
  const textColor = suitColors[suit]

  return (
    <div className="relative h-96 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl" style={{ boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 8px 8px 0px 0px rgb(0 0 0 / 0.08)' }}>
      <div className={`absolute left-4 top-4 flex flex-col items-center ${textColor}`}>
        <span className="text-5xl font-bold leading-none">{value}</span>
        <img src={suitImages[suit]} alt={suit} className="mt-1 h-10 w-10" />
      </div>

      <div className={`absolute bottom-4 right-4 ${textColor}`}>
        <img
          src={suitImages[suit]}
          alt={suit}
          className="h-40 w-40 object-contain opacity-90"
        />
      </div>
    </div>
  )
}

export default CardVariant
