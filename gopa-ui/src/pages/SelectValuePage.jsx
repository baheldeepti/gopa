import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import ValueCard from '../components/ValueCard';
import BedtimeToggle from '../components/BedtimeToggle';

const VALUES = ['friendship', 'kindness', 'fun', 'bravery'];

export default function SelectValuePage({ onSelect, onBack, bedtimeMode, onToggleBedtime }) {
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (selected) onSelect(selected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="flex flex-col items-center px-5 py-6 min-h-[80vh]"
    >
      {/* Back button */}
      <div className="w-full flex items-center mb-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors dark:hover:bg-amber-900/30">
          <ArrowLeft size={22} className={bedtimeMode ? 'text-amber-200' : 'text-gray-600'} />
        </button>
      </div>

      {/* Title */}
      <h1 className={`font-display font-bold text-2xl mb-6 text-center ${
        bedtimeMode ? 'text-amber-100' : 'text-gray-800'
      }`}>
        Choose a Value
      </h1>

      {/* Value grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
        {VALUES.map((value, i) => (
          <ValueCard
            key={value}
            value={value}
            selected={selected === value}
            onClick={setSelected}
            index={i}
          />
        ))}
      </div>

      {/* Duration toggle */}
      <div className="w-full max-w-sm mb-6">
        <BedtimeToggle enabled={bedtimeMode} onToggle={onToggleBedtime} />
      </div>

      {/* Powered by */}
      <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
        Powered by <span className="font-semibold">Amazon Nova</span>
      </p>

      {/* Continue button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleContinue}
        disabled={!selected}
        className={`
          w-full max-w-sm py-4 rounded-2xl font-display font-bold text-lg
          flex items-center justify-center gap-2 shadow-lg
          transition-all duration-300
          ${selected
            ? bedtimeMode
              ? 'bg-gradient-to-r from-amber-700 to-orange-800 text-amber-100'
              : 'bg-gradient-to-r from-saffron-500 to-orange-500 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        Continue <ArrowRight size={20} />
      </motion.button>
    </motion.div>
  );
}
