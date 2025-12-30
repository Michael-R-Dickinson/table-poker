import clubImg from "./assets/club.png"
import diamondImg from "./assets/diamond.png"
import heartImg from "./assets/heart.png"
import spadeImg from "./assets/spade.png"

interface CardProps {
  rank: string
  suit: "hearts" | "diamonds" | "clubs" | "spades"
  size?: "small" | "medium" | "large"
}

const suitImageMap = {
  hearts: heartImg,
  diamonds: diamondImg,
  clubs: clubImg,
  spades: spadeImg,
}

const suitColors = {
  hearts: "text-red-500",
  diamonds: "text-red-500",
  clubs: "text-slate-800",
  spades: "text-slate-800",
}

export function Card({ rank, suit, size = "medium" }: CardProps) {
  const textColor = suitColors[suit]
  const suitImage = suitImageMap[suit]

  const sizes = {
    small: {
      container: "h-20 w-14",
      topValue: "text-xl",
      topSuit: "h-2.5 w-2.5",
      bottomSuit: "h-7 w-7",
      padding: "p-1.5",
    },
    medium: {
      container: "h-28 w-20",
      topValue: "text-3xl",
      topSuit: "h-3.5 w-3.5",
      bottomSuit: "h-12 w-12",
      padding: "p-2",
    },
    large: {
      container: "h-44 w-32",
      topValue: "text-6xl",
      topSuit: "h-5 w-5",
      bottomSuit: "h-20 w-20",
      padding: "p-3",
    },
  }

  const sizeConfig = sizes[size]

  return (
    <div
      className={`relative ${sizeConfig.container} ${sizeConfig.padding} rounded-xl border border-slate-200 bg-white shadow-xl`}
      style={{
        boxShadow:
          "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 8px 8px 0px 0px rgb(0 0 0 / 0.08)",
      }}
    >
      <div className={`absolute left-2 top-2 flex items-center gap-0.5 ${textColor}`}>
        <span className={`${sizeConfig.topValue} font-bold leading-none`}>
          {rank}
        </span>
        <img
          src={suitImage}
          alt={suit}
          className={`${sizeConfig.topSuit} opacity-80`}
        />
      </div>

      <div className={`absolute bottom-2 right-2 ${textColor}`}>
        <img
          src={suitImage}
          alt={suit}
          className={`${sizeConfig.bottomSuit} object-contain opacity-90`}
        />
      </div>
    </div>
  )
}
