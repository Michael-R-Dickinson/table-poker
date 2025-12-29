interface CardProps {
  rank: string;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  size?: "small" | "medium" | "large";
}

export function Card({ rank, suit, size = "medium" }: CardProps) {
  const suitSymbols = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };

  const suitColors = {
    hearts: "text-red-500",
    diamonds: "text-red-500",
    clubs: "text-gray-900",
    spades: "text-gray-900",
  };

  const sizes = {
    small: {
      container: "w-16 h-24",
      rank: "text-2xl",
      suit: "text-3xl",
    },
    medium: {
      container: "w-20 h-28",
      rank: "text-3xl",
      suit: "text-4xl",
    },
    large: {
      container: "w-32 h-44",
      rank: "text-5xl",
      suit: "text-6xl",
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div
      className={`${sizeConfig.container} bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden transform transition-transform hover:scale-105`}
      style={{
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Card content */}
      <div className="flex flex-col items-center justify-center">
        <div className={`${sizeConfig.rank} ${suitColors[suit]} font-bold`}>
          {rank}
        </div>
        <div className={`${sizeConfig.suit} ${suitColors[suit]} -mt-2`}>
          {suitSymbols[suit]}
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
        }}
      />
    </div>
  );
}
