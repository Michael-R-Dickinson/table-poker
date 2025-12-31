import { MobilePokerGame } from '@/components/mobile-poker-draft/mobile-poker-game';

export default function MobilePokerDraftScreen() {
  const opponents = [
    {
      id: '1',
      name: 'Tom',
      chips: 180,
      currentBet: 20,
      status: 'called' as const,
      avatar: '#6366f1',
    },
    {
      id: '2',
      name: 'Joe',
      chips: 190,
      currentBet: 10,
      status: 'folded' as const,
      avatar: '#f97316',
    },
    {
      id: '3',
      name: 'Sarah',
      chips: 220,
      currentBet: 20,
      status: 'raised' as const,
      avatar: '#10b981',
    },
    {
      id: '4',
      name: 'Mike',
      chips: 150,
      currentBet: 0,
      status: 'active' as const,
      avatar: '#3b82f6',
    },
    {
      id: '5',
      name: 'Lisa',
      chips: 100,
      currentBet: 100,
      status: 'allin' as const,
      avatar: '#a855f7',
    },
  ];

  const playerCards = [
    { rank: '9', suit: 'hearts' as const },
    { rank: 'Q', suit: 'spades' as const },
  ];

  const handleAction = (action: string, amount?: number) => {
    console.log('Action:', action, amount);
  };

  return (
    <MobilePokerGame
      opponents={opponents}
      playerCards={playerCards}
      playerChips={180}
      playerCurrentBet={20}
      isPlayerTurn={true}
      availableActions={['fold', 'call', 'raise']}
      onAction={handleAction}
      chipRange={{ min: 20, max: 180 }}
      amountToCall={20}
      winningInfo={null}
    />
  );
}
