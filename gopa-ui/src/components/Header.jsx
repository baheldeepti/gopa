import React from 'react';
import { Settings, Moon, Sun } from 'lucide-react';

export default function Header({ bedtimeMode, onToggleBedtime }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-saffron-400/90 dark:bg-amber-950/90 px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-3xl font-display font-bold text-white tracking-tight drop-shadow-md">
          GOPA
        </span>
        <span className="text-xl">🪈</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleBedtime}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          aria-label="Toggle bedtime mode"
        >
          {bedtimeMode ? (
            <Sun size={20} className="text-yellow-200" />
          ) : (
            <Moon size={20} className="text-white" />
          )}
        </button>
        <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
          <Settings size={20} className="text-white" />
        </button>
        <div className="w-8 h-8 rounded-full bg-krishna-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
          👶
        </div>
      </div>
    </header>
  );
}
