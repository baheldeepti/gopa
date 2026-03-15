import React from 'react';
import { motion } from 'framer-motion';

const STAGE_MESSAGES = {
  generating_script: {
    title: 'The Chronicler is writing...',
    subtitle: 'Crafting a magical story for you',
    emoji: '📜',
  },
  generating_images: {
    title: 'The Visionary is painting...',
    subtitle: 'Creating beautiful scenes of Vrindavan',
    emoji: '🎨',
  },
  generating_video: {
    title: 'The Animator is bringing it to life...',
    subtitle: 'This takes about 30-60 seconds',
    emoji: '🎬',
  },
};

export default function LoadingState({ stage, progress = 0, scenes = [] }) {
  const info = STAGE_MESSAGES[stage] || STAGE_MESSAGES.generating_script;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto px-4 py-8"
    >
      {/* Nova branding */}
      <div className="bg-gradient-to-br from-teal-100 to-cyan-200 rounded-3xl p-6 w-full text-center shadow-md">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl mb-3"
        >
          {info.emoji}
        </motion.div>
        <h2 className="font-display font-bold text-lg text-gray-800 uppercase">
          Nova is Painting Your Story...
        </h2>
        <p className="font-body text-sm text-gray-500 mt-1">{info.subtitle}</p>
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
          <span>amazon</span>
          <span className="font-bold text-gray-600">nova</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className="progress-bar h-full"
          initial={{ width: '5%' }}
          animate={{ width: `${Math.max(progress, 5)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-sm text-gray-400 font-body">{Math.round(progress)}% complete</p>

      {/* Stage indicator dots */}
      <div className="flex items-center gap-3">
        {['Script', 'Images', 'Video'].map((label, i) => {
          const stageIndex = ['generating_script', 'generating_images', 'generating_video'].indexOf(stage);
          const isComplete = i < stageIndex;
          const isCurrent = i === stageIndex;
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${isComplete ? 'bg-vrindavan-500 text-white' : isCurrent ? 'bg-saffron-400 text-white animate-pulse' : 'bg-gray-200 text-gray-400'}`}
              >
                {isComplete ? '✓' : i + 1}
              </div>
              <span className="text-xs text-gray-400">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Preview generated scenes */}
      {scenes.length > 0 && (
        <div className="w-full">
          <p className="text-xs text-gray-400 mb-2 font-display">Scenes ready:</p>
          <div className="grid grid-cols-4 gap-2">
            {scenes.map((scene, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm"
              >
                {scene.image_url ? (
                  <img src={scene.image_url} alt={`Scene ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full shimmer" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
