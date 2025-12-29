import React from 'react';
import { Coins } from 'lucide-react';

interface PlayerAvatarProps {
  name: string;
  chips: number;
  bet?: number;
  status?: string;
  avatar: string;
  isActive: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  chips,
  bet,
  status,
  avatar,
  isActive,
}) => {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      {/* Status Badge */}
      {status && (
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
            isActive
              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
              : 'bg-red-500/20 text-red-300 border border-red-400/30'
          }`}
        >
          {status}
        </div>
      )}

      {/* Avatar Circle */}
      <div
        className={`relative w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg ${
          isActive
            ? 'bg-gradient-to-br from-purple-400 to-purple-600 ring-2 ring-purple-400/50'
            : 'bg-gradient-to-br from-slate-600 to-slate-700 ring-2 ring-slate-500/30 opacity-60'
        }`}
      >
        <span className="filter drop-shadow-sm">{avatar}</span>
      </div>

      {/* Player Name */}
      <div
        className={`text-sm font-semibold tracking-wide truncate max-w-full ${
          isActive ? 'text-white' : 'text-slate-400'
        }`}
      >
        {name}
      </div>

      {/* Chips Display */}
      <div className="flex items-center gap-1.5 text-xs">
        <Coins className={`w-3.5 h-3.5 ${isActive ? 'text-purple-300' : 'text-slate-500'}`} />
        <span className={isActive ? 'text-purple-200 font-medium' : 'text-slate-500'}>
          {chips}
        </span>
      </div>

      {/* Current Bet */}
      {bet !== undefined && bet > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
          <Coins className="w-3.5 h-3.5 text-purple-300" />
          <span className="text-white font-semibold text-xs">{bet}</span>
        </div>
      )}
    </div>
  );
};
