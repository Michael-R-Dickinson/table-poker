import { Card } from "./Card"
import { OpponentDisplay } from "./OpponentDisplay"
import { ActionButtons } from "./ActionButtons"

interface Player {
  id: string
  name: string
  chips: number
  currentBet: number
  status: "active" | "folded" | "called" | "raised" | "allin"
  avatar: string
}

interface MobilePokerGameProps {
  opponents: Player[]
  pot: number
  playerCards: Array<{
    rank: string
    suit: "hearts" | "diamonds" | "clubs" | "spades"
  }>
  playerChips: number
  playerCurrentBet: number
  isPlayerTurn: boolean
  onFold: () => void
  onCall: () => void
  onRaise: (amount: number) => void
}

export function MobilePokerGame({
  opponents,
  pot: bet,
  playerCards,
  playerChips,
  playerCurrentBet,
  isPlayerTurn,
  onFold,
  onCall,
  onRaise,
}: MobilePokerGameProps) {
  const railSize = 22

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-[#050508] text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, #0e0f16 0%, #050508 60%)",
      }}
    >
      {/* Opponents section */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-6 pb-4 bg-gradient-to-b from-[#0e0f16] to-transparent z-10">
        <div className="flex justify-around items-start gap-2">
          {opponents.map((opponent) => (
            <OpponentDisplay key={opponent.id} player={opponent} />
          ))}
        </div>
      </div>

      {/* Pot display */}
      <div className="absolute top-40 left-0 right-0 flex flex-col items-center z-10">
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
            BET
          </span>
        </div>
        <div className="text-7xl font-bold tracking-tight">{bet}</div>
      </div>

      {/* Poker table edge curve */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          top: "50%",
          width: "280%",
          height: "70vh",
          borderRadius: "50% 50% 0 0",
          background: "linear-gradient(180deg, #161722 0%, #101016 10%)",
          boxShadow: `
            0 -1px 1px rgba(138, 130, 255, 0.3),
            0 -25px 50px -10px rgba(90, 60, 255, 0.15),
            inset 0 ${railSize}px 0 #0f1016,
            inset 0 ${railSize + 1}px 0 rgba(255, 255, 255, 0.04)
          `,
        }}
      />

      {/* Purple glow emanating from center of curve */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          top: "0",
          width: "600px",
          height: "150%",
          opacity: "0.3",
          background:
            "radial-gradient(ellipse at center 33%, rgba(138, 130, 255, 0.25) 0%, rgba(90, 60, 255, 0.15) 30%, transparent 70%)",
        }}
      />

      {/* Player section */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 px-6 bg-gradient-to-t from-[#050508] via-[#050508]/90 to-transparent z-20">
        {/* Action buttons */}
        <div className="mb-6">
          <ActionButtons
            onFold={onFold}
            onCall={onCall}
            onRaise={onRaise}
            isPlayerTurn={isPlayerTurn}
          />
        </div>

        {/* Current bet display */}
        {playerCurrentBet > 0 && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" />
              </svg>
              <span className="font-semibold">{playerCurrentBet}</span>
            </div>
          </div>
        )}

        {/* Player cards */}
        <div className="relative flex justify-center mb-6 h-32">
          {playerCards.map((card, index) => {
            const totalCards = playerCards.length
            const middleIndex = (totalCards - 1) / 2
            const offsetFromMiddle = index - middleIndex
            const rotation = offsetFromMiddle * 10
            const translateX = offsetFromMiddle * 30

            return (
              <div
                key={index}
                className="absolute"
                style={{
                  transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
                  transformOrigin: "center bottom",
                  zIndex: index,
                }}
              >
                <Card rank={card.rank} suit={card.suit} size="medium" />
              </div>
            )
          })}
        </div>

        {/* Player bank display */}
        <div className="flex justify-center items-center gap-3">
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Your Bank
            </div>
            <div className="text-3xl font-bold">{playerChips}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
