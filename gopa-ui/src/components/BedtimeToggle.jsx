import React from 'react';
import { Moon, Sun } from 'lucide-react';

export default function BedtimeToggle({ enabled, onToggle }) {
  return (
    <div className="flex items-center gap-3 bg-white/80 dark:bg-amber-900/30 rounded-2xl px-4 py-3 shadow-sm">
      <Sun size={18} className={enabled ? 'text-gray-300' : 'text-saffron-500'} />

      <button
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
          enabled ? 'bg-indigo-900' : 'bg-saffron-300'
        }`}
        aria-label="Toggle bedtime mode"
      >
        <div
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
            enabled ? 'translate-x-7.5 left-0.5' : 'translate-x-0.5'
          }`}
          style={{ transform: enabled ? 'translateX(28px)' : 'translateX(2px)' }}
        >
          <span className="text-xs flex items-center justify-center h-full">
            {enabled ? '🌙' : '☀️'}
          </span>
        </div>
      </button>

      <Moon size={18} className={enabled ? 'text-indigo-300' : 'text-gray-300'} />

      <div className="ml-2">
        <span className="font-display font-semibold text-sm text-gray-700 dark:text-amber-200">
          {enabled ? 'Bedtime Tale' : 'Short Story'}
        </span>
        <span className="block text-xs text-gray-400 dark:text-amber-400">
          {enabled ? '3 mins' : '1 min'}
        </span>
      </div>
    </div>
  );
}
