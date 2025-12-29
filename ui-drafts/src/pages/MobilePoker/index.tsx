import { MobilePokerGame } from "./MobilePokerGame";

export default function MobilePokerPage() {
  // Mock data matching the reference image
  const opponents = [
    {
      id: "1",
      name: "Tom",
      chips: 180,
      currentBet: 20,
      status: "called" as const,
      avatar: "#6366f1", // Blue-purple
    },
    {
      id: "2",
      name: "Joe",
      chips: 190,
      currentBet: 10,
      status: "folded" as const,
      avatar: "#f97316", // Orange
    },
  ];

  const playerCards = [
    { rank: "9", suit: "hearts" as const },
    { rank: "Q", suit: "spades" as const },
  ];

  const handleFold = () => console.log("Fold");
  const handleCheck = () => console.log("Check");
  const handleCall = () => console.log("Call");
  const handleRaise = (amount: number) => console.log("Raise", amount);

  return (
    <MobilePokerGame
      opponents={opponents}
      pot={50}
      playerCards={playerCards}
      playerChips={180}
      playerCurrentBet={20}
      isPlayerTurn={true}
      onFold={handleFold}
      onCheck={handleCheck}
      onCall={handleCall}
      onRaise={handleRaise}
    />
  );
}
