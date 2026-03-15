import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import StoryPlayer from '../components/StoryPlayer';
export default function StoryViewPage({ stage, progress, storyData, error, onBack, onReset, bedtimeMode }) {
  const isLoading = ['generating_script', 'generating_images', 'generating_video'].includes(stage);
  const isComplete = stage === 'complete' || (storyData?.scenes?.length > 0 && stage !== 'error');
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      className="flex flex-col items-center px-5 py-6 min-h-[80vh]">
      <div className="w-full flex items-center justify-between mb-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100"><ArrowLeft size={22} className={bedtimeMode ? 'text-amber-200' : 'text-gray-600'} /></button>
        {isComplete && <button onClick={onReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-display text-gray-600"><RotateCcw size={14} /> New Story</button>}
      </div>
      {stage === 'error' && <div className="w-full max-w-sm mx-auto text-center py-12">
        <div className="text-5xl mb-4">😢</div>
        <h2 className="font-display font-bold text-lg text-gray-700 mb-2">Oops! Something went wrong</h2>
        <p className="font-body text-sm text-gray-400 mb-6">{error || 'Please try again.'}</p>
        <button onClick={onReset} className="px-8 py-3 bg-gradient-to-r from-saffron-500 to-orange-500 text-white font-display font-bold rounded-2xl shadow-lg">Try Again</button>
      </div>}
      {isLoading && !isComplete && <LoadingState stage={stage} progress={progress} scenes={storyData?.scenes || []} />}
      {isComplete && <StoryPlayer storyData={storyData} bedtimeMode={bedtimeMode} />}
    </motion.div>
  );
}
