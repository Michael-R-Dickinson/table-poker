import React from 'react';
import { PlayingCard } from './components/PlayingCard';
import { PlayerAvatar } from './components/PlayerAvatar';
import { ActionButton } from './components/ActionButton';
import { Coins, CircleDollarSign } from 'lucide-react';
import './styles.css';

const MoonPokerMobile: React.FC = () => {
  const otherPlayers = [
    { name: 'Tom', chips: 180, bet: 20, status: 'Called', avatar: '👤', isActive: true },
    { name: 'Sarah', chips: 245, bet: 20, status: 'Called', avatar: '👤', isActive: true },
    { name: 'Joe', chips: 190, bet: 10, status: 'Folded', avatar: '👤', isActive: false },
  ];

  return (
    <div className="moon-poker-mobile">
      {/* Background gradient effect */}
      <div className="fixed inset-0 bg-[#0a0e1a] -z-10" />

      <div className="relative min-h-screen flex flex-col">
        {/* Other Players Section */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex justify-between items-start gap-3">
            {otherPlayers.map((player, idx) => (
              <PlayerAvatar key={idx} {...player} />
            ))}
          </div>
        </div>

        {/* Pot Display */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CircleDollarSign className="w-5 h-5 text-purple-300/70" />
            <span className="text-purple-300/70 text-sm font-medium tracking-wide">Pot</span>
          </div>
          <div className="text-white font-bold tracking-tight pot-amount">
            50
          </div>
        </div>

        {/* Poker Table Gradient Circle */}
        <div className="flex-1 relative flex flex-col justify-end pb-32">
          <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-center pointer-events-none">
            <div className="poker-table-gradient" />
          </div>

          {/* Player's Action Status */}
          <div className="relative z-10 text-center mb-6">
            <div className="inline-block px-6 py-2 rounded-full bg-purple-500/20 border border-purple-400/30 backdrop-blur-sm">
              <span className="text-purple-200 font-semibold text-sm tracking-wide">Raised</span>
            </div>
          </div>

          {/* Player's Hole Cards */}
          <div className="relative z-10 flex justify-center gap-3 px-8 mb-8">
            <PlayingCard suit="hearts" rank="9" />
            <PlayingCard suit="spades" rank="Q" />
          </div>
        </div>

        {/* Player Bank Info */}
        <div className="absolute bottom-32 right-4 z-20">
          <div className="text-right space-y-2">
            <div className="flex items-center justify-end gap-2 text-xs text-purple-300/60">
              <Coins className="w-3.5 h-3.5" />
              <span>Your Bank</span>
            </div>
            <div className="text-white font-bold text-4xl tracking-tight">
              180
            </div>
            <div className="flex items-center justify-end gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
              <Coins className="w-4 h-4 text-purple-300" />
              <span className="text-white font-semibold text-sm">20</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/95 to-transparent pb-6 pt-8 px-4">
          <div className="flex gap-3 mb-4">
            <ActionButton variant="fold" label="Fold" hotkey="F" />
            <ActionButton variant="raise" label="Raise" hotkey="R" />
            <ActionButton variant="check" label="Check" hotkey="C" />
          </div>

          {/* Your Turn Indicator */}
          <div className="flex justify-center">
            <div className="px-8 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-500/30 animate-pulse-subtle">
              <div className="flex items-center gap-3">
                <span className="text-slate-900 font-bold text-base tracking-wide">Your Turn!</span>
                <span className="text-slate-900/70 font-mono text-sm font-semibold">0:34</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoonPokerMobile;
