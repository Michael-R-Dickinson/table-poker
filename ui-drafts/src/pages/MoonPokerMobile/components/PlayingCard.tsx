import React from 'react';

interface PlayingCardProps {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({ suit, rank }) => {
  const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };

  const suitColors = {
    hearts: 'text-red-500',
    diamonds: 'text-red-500',
    clubs: 'text-slate-900',
    spades: 'text-slate-900',
  };

  return (
    <div className="playing-card group">
      <div className="relative bg-white rounded-2xl shadow-2xl w-28 h-40 p-3 transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
        {/* Card shine effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Top rank and suit */}
        <div className="absolute top-2 left-2.5 flex flex-col items-center">
          <span className={`font-bold text-2xl leading-none ${suitColors[suit]}`}>
            {rank}
          </span>
          <span className={`text-3xl leading-none -mt-1 ${suitColors[suit]}`}>
            {suitSymbols[suit]}
          </span>
        </div>

        {/* Center suit symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-6xl ${suitColors[suit]} opacity-90`}>
            {suitSymbols[suit]}
          </span>
        </div>

        {/* Bottom rank and suit (rotated) */}
        <div className="absolute bottom-2 right-2.5 flex flex-col items-center rotate-180">
          <span className={`font-bold text-2xl leading-none ${suitColors[suit]}`}>
            {rank}
          </span>
          <span className={`text-3xl leading-none -mt-1 ${suitColors[suit]}`}>
            {suitSymbols[suit]}
          </span>
        </div>
      </div>
    </div>
  );
};
