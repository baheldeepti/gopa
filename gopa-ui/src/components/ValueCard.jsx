import React from 'react';
import { motion } from 'framer-motion';

const VALUE_CONFIG = {
  friendship: {
    emoji: '🤝',
    label: 'Friendship',
    subtitle: 'Krishna & Sudama',
    color: 'from-blue-100 to-blue-200',
    border: 'border-blue-300',
    iconBg: 'bg-blue-100',
  },
  kindness: {
    emoji: '🐮',
    label: 'Kindness',
    subtitle: 'Krishna & the Cows',
    color: 'from-green-100 to-green-200',
    border: 'border-green-300',
    iconBg: 'bg-green-100',
  },
  fun: {
    emoji: '🍯',
    label: 'Fun',
    subtitle: 'Krishna & Butter',
    color: 'from-orange-100 to-orange-200',
    border: 'border-orange-300',
    iconBg: 'bg-orange-100',
  },
  bravery: {
    emoji: '🪈',
    label: 'Bravery',
    subtitle: "Krishna's Flute",
    color: 'from-red-100 to-red-200',
    border: 'border-red-300',
    iconBg: 'bg-red-100',
  },
};

export default function ValueCard({ value, selected, onClick, index = 0 }) {
  const config = VALUE_CONFIG[value] || VALUE_CONFIG.friendship;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(value)}
      className={`
        value-card relative w-full p-5 rounded-3xl border-2 cursor-pointer
        bg-gradient-to-br ${config.color} ${config.border}
        ${selected ? 'ring-4 ring-saffron-400 ring-offset-2 shadow-xl' : 'shadow-md'}
        transition-shadow duration-300
      `}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className={`w-16 h-16 rounded-2xl ${config.iconBg} flex items-center justify-center text-3xl shadow-inner`}>
          {config.emoji}
        </div>
        <h3 className="font-display font-bold text-lg text-gray-800 uppercase tracking-wide">
          {config.label}
        </h3>
        <p className="font-body text-sm text-gray-500">{config.subtitle}</p>
      </div>

      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-7 h-7 bg-saffron-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-white text-sm">✓</span>
        </motion.div>
      )}
    </motion.button>
  );
}
