import { Card } from "./Card";
import { OpponentDisplay } from "./OpponentDisplay";
import { ActionButtons } from "./ActionButtons";

interface Player {
  id: string;
  name: string;
  chips: number;
  currentBet: number;
  status: "active" | "folded" | "called" | "raised" | "allin";
  avatar: string;
}

interface MobilePokerGameProps {
  opponents: Player[];
  pot: number;
  playerCards: Array<{ rank: string; suit: string }>;
  playerChips: number;
  playerCurrentBet: number;
  isPlayerTurn: boolean;
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
}

export function MobilePokerGame({
  opponents,
  pot,
  playerCards,
  playerChips,
  playerCurrentBet,
  isPlayerTurn,
  onFold,
  onCheck,
  onCall,
  onRaise,
}: MobilePokerGameProps) {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0e1a] text-white">
      {/* Opponents section */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-6 pb-4 bg-gradient-to-b from-[#0a0e1a] to-transparent z-10">
        <div className="flex justify-around items-start gap-2">
          {opponents.map((opponent) => (
            <OpponentDisplay key={opponent.id} player={opponent} />
          ))}
        </div>
      </div>

      {/* Pot display */}
      <div className="absolute top-24 left-0 right-0 flex flex-col items-center z-10">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path
              fillRule="evenodd"
              d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm text-gray-400 uppercase tracking-wide">
            Pot
          </span>
        </div>
        <div className="text-7xl font-bold tracking-tight">{pot}</div>
      </div>

      {/* Purple circular table */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="relative w-[140vw] h-[140vw] max-w-[700px] max-h-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(88, 70, 150, 0.4) 0%, rgba(88, 70, 150, 0.15) 40%, transparent 70%)",
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(120, 90, 200, 0.3) 0%, transparent 50%)",
            }}
          />
        </div>
      </div>

      {/* Player section */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 px-6 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/90 to-transparent z-20">
        {/* Player status badge */}
        {isPlayerTurn && (
          <div className="flex justify-center mb-4">
            <div className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-full font-semibold text-lg shadow-lg shadow-yellow-500/50">
              Your Turn! 0:34
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mb-6">
          <ActionButtons
            onFold={onFold}
            onCheck={onCheck}
            onCall={onCall}
            onRaise={onRaise}
            isPlayerTurn={isPlayerTurn}
          />
        </div>

        {/* Current bet display */}
        {playerCurrentBet > 0 && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <circle cx="10" cy="10" r="8" />
              </svg>
              <span className="font-semibold">{playerCurrentBet}</span>
            </div>
          </div>
        )}

        {/* Player cards */}
        <div className="flex justify-center gap-4 mb-6">
          {playerCards.map((card, index) => (
            <Card key={index} rank={card.rank} suit={card.suit} size="large" />
          ))}
        </div>

        {/* Player bank display */}
        <div className="flex justify-end items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Your Bank
            </div>
            <div className="text-3xl font-bold">{playerChips}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
