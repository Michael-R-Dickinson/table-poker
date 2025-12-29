import React from 'react';

interface ActionButtonProps {
  variant: 'fold' | 'raise' | 'check';
  label: string;
  hotkey: string;
  onClick?: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant,
  label,
  hotkey,
  onClick,
}) => {
  const variantStyles = {
    fold: {
      bg: 'bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30',
      border: 'border-red-500/30 hover:border-red-500/50',
      text: 'text-red-400',
      icon: '🃏',
    },
    raise: {
      bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30',
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      text: 'text-emerald-400',
      icon: '📈',
    },
    check: {
      bg: 'bg-blue-500/10 hover:bg-blue-500/20 active:bg-blue-500/30',
      border: 'border-blue-500/30 hover:border-blue-500/50',
      text: 'text-blue-400',
      icon: '✓',
    },
  };

  const styles = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      className={`
        flex-1 relative px-6 py-4 rounded-2xl border backdrop-blur-sm
        transition-all duration-200 transform active:scale-95
        ${styles.bg} ${styles.border}
        group
      `}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl mb-0.5 transition-transform group-hover:scale-110">
          {styles.icon}
        </span>
        <span className={`font-bold text-base tracking-wide ${styles.text}`}>
          {label}
        </span>
        <span className="text-xs text-slate-500 font-mono mt-0.5">{hotkey}</span>
      </div>

      {/* Hotkey indicator */}
      <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
        <span className="text-xs font-mono text-slate-400 font-semibold">{hotkey}</span>
      </div>
    </button>
  );
};
