import { useState } from "react";

interface ActionButtonsProps {
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  isPlayerTurn: boolean;
}

export function ActionButtons({
  onFold,
  onCheck,
  onCall,
  onRaise,
  isPlayerTurn,
}: ActionButtonsProps) {
  const [raiseAmount, setRaiseAmount] = useState(20);

  if (!isPlayerTurn) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Fold button */}
      <button
        onClick={onFold}
        className="flex-1 flex flex-col items-center gap-1 py-3 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-xl transition-all active:scale-95"
      >
        <svg
          className="w-5 h-5 text-red-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs text-red-400 font-semibold uppercase tracking-wide">
          Fold
        </span>
        <span className="text-[10px] text-gray-500">F</span>
      </button>

      {/* Raise button with controls */}
      <div className="flex-1 flex flex-col gap-2">
        <button
          onClick={() => onRaise(raiseAmount)}
          className="w-full flex flex-col items-center gap-1 py-3 px-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-xl transition-all active:scale-95"
        >
          <svg
            className="w-5 h-5 text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs text-green-400 font-semibold uppercase tracking-wide">
            Raise
          </span>
          <span className="text-[10px] text-gray-500">R</span>
        </button>
      </div>

      {/* Check/Call button */}
      <button
        onClick={onCall}
        className="flex-1 flex flex-col items-center gap-1 py-3 px-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-xl transition-all active:scale-95"
      >
        <svg
          className="w-5 h-5 text-blue-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs text-blue-400 font-semibold uppercase tracking-wide">
          Check
        </span>
        <span className="text-[10px] text-gray-500">C</span>
      </button>
    </div>
  );
}
