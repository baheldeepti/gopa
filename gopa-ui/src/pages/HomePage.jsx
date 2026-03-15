import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function HomePage({ onStart, bedtimeMode, onSetChildName }) {
  const [name, setName] = useState('');
  const handleStart = () => {
    if (onSetChildName) onSetChildName(name.trim() || 'Friend');
    onStart();
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-8 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }} className="relative w-72 h-72 mb-6">
        <div className={`w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border-4 ${bedtimeMode ? 'border-amber-800' : 'border-white'}`}>
          <img src="/krishna-hero.png" alt="Bal Krishna" className="w-full h-full object-cover" />
        </div>
        <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-3 -right-3 text-3xl">✨</motion.div>
        <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} className="absolute -bottom-2 -left-2 text-2xl">🌟</motion.div>
      </motion.div>
      <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className={`font-display font-bold text-3xl mb-2 ${bedtimeMode ? 'text-amber-100' : 'text-gray-800'}`}>
        What Should Krishna<br />Learn Today?
      </motion.h1>
      <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
        className={`font-body text-base mb-6 max-w-xs ${bedtimeMode ? 'text-amber-300' : 'text-gray-500'}`}>
        Personalized animated stories about Bal Krishna — just for your little one
      </motion.p>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}
        className="w-full max-w-xs mb-6">
        <label className={`block text-sm font-display font-semibold mb-2 ${bedtimeMode ? 'text-amber-200' : 'text-gray-600'}`}>
          What is your little one is name?
        </label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Arjun, Meera, Aarav..."
          className={`w-full px-4 py-3 rounded-2xl text-center font-body text-lg border-2 focus:outline-none focus:ring-2 focus:ring-saffron-400
            ${bedtimeMode ? 'bg-amber-900/30 border-amber-700 text-amber-100 placeholder-amber-600' : 'bg-white border-saffron-200 text-gray-800 placeholder-gray-300'}`}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()} />
      </motion.div>
      <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleStart}
        className={`px-10 py-4 rounded-2xl font-display font-bold text-xl flex items-center gap-3 shadow-xl
          ${bedtimeMode ? 'bg-gradient-to-r from-amber-700 to-orange-800 text-amber-100' : 'bg-gradient-to-r from-saffron-500 to-orange-500 text-white hover:shadow-saffron-500/40'}`}>
        <Sparkles size={22} /> Start Adventure
      </motion.button>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="mt-8 text-xs text-gray-400">Powered by <span className="font-semibold">Amazon Nova</span></motion.p>
    </motion.div>
  );
}
