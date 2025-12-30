import { X, TrendingUp, ListChecks } from "lucide-react";

interface ActionButtonsProps {
  onFold: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  isPlayerTurn: boolean;
}

export function ActionButtons({
  onFold,
  onCall,
  onRaise,
  isPlayerTurn,
}: ActionButtonsProps) {
  const raiseAmount = 20;

  if (!isPlayerTurn) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Fold button */}
      <button
        onClick={onFold}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg transition-all active:scale-95"
      >
        <X className="w-4 h-4 text-red-400" strokeWidth={2.5} />
        <span className="text-sm text-red-400 font-medium">Fold</span>
      </button>

      {/* Raise button */}
      <button
        onClick={() => onRaise(raiseAmount)}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg transition-all active:scale-95"
      >
        <TrendingUp className="w-4 h-4 text-green-400" strokeWidth={2.5} />
        <span className="text-sm text-green-400 font-medium">Raise</span>
      </button>

      {/* Check button */}
      <button
        onClick={onCall}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg transition-all active:scale-95"
      >
        <ListChecks className="w-4 h-4 text-blue-400" strokeWidth={2.5} />
        <span className="text-sm text-blue-400 font-medium">Check</span>
      </button>
    </div>
  );
}
