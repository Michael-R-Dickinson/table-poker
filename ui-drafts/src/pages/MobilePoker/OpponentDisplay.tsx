interface OpponentDisplayProps {
  player: {
    id: string;
    name: string;
    chips: number;
    currentBet: number;
    status: "active" | "folded" | "called" | "raised" | "allin";
    avatar: string;
  };
}

export function OpponentDisplay({ player }: OpponentDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Player card */}
      <div
        className={`relative px-2 py-2 rounded-lg bg-[#1a1b26]/80 border border-gray-400/40 ${
          player.status === "folded" ? "opacity-50" : ""
        }`}
        style={{
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="flex flex-col gap-1.5 w-[60px]">
          {/* Player name */}
          <div
            className={`text-xs font-semibold truncate ${
              player.status === "folded" ? "text-gray-500" : "text-white"
            }`}
          >
            {player.name}
          </div>

          {/* Chips display */}
          <div className="flex items-center gap-1">
            <svg
              className="w-3 h-3 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <circle cx="10" cy="10" r="8" />
            </svg>
            <span className="text-xs font-medium text-gray-300">
              {player.chips}
            </span>
          </div>
        </div>
      </div>

      {/* Bet circle below card */}
      {player.currentBet > 0 && player.status !== "folded" && (
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10">
          <span className="text-xs font-semibold text-white">
            {player.currentBet}
          </span>
        </div>
      )}
    </div>
  );
}
