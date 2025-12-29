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
  const statusColors = {
    folded: "bg-red-500/90 text-white",
    called: "bg-blue-500/90 text-white",
    raised: "bg-green-500/90 text-white",
    allin: "bg-purple-500/90 text-white",
    active: "bg-transparent",
  };

  const statusLabels = {
    folded: "Folded",
    called: "Called",
    raised: "Raised",
    allin: "All In",
    active: "",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Status badge */}
      {player.status !== "active" && (
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusColors[player.status]}`}
        >
          {statusLabels[player.status]}
        </div>
      )}

      {/* Avatar */}
      <div className="relative">
        <div
          className={`w-16 h-16 rounded-full overflow-hidden border-4 ${
            player.status === "folded"
              ? "border-red-500/50 opacity-50"
              : "border-white/20"
          }`}
          style={{
            background: `linear-gradient(135deg, ${player.avatar}, ${player.avatar}dd)`,
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
            {player.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Player name */}
      <div
        className={`text-sm font-semibold ${
          player.status === "folded" ? "text-gray-500" : "text-white"
        }`}
      >
        {player.name}
      </div>

      {/* Chips display */}
      <div
        className={`flex items-center gap-1.5 ${
          player.status === "folded" ? "opacity-50" : ""
        }`}
      >
        <svg
          className="w-4 h-4 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <circle cx="10" cy="10" r="8" />
        </svg>
        <span className="text-sm font-semibold text-gray-300">
          {player.chips}
        </span>
      </div>

      {/* Current bet */}
      {player.currentBet > 0 && player.status !== "folded" && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" />
          </svg>
          <span className="text-xs font-semibold">{player.currentBet}</span>
        </div>
      )}
    </div>
  );
}
