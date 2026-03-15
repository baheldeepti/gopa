import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SelectValuePage from './pages/SelectValuePage';
import UploadPhotoPage from './pages/UploadPhotoPage';
import StoryViewPage from './pages/StoryViewPage';
import { useStoryGeneration } from './hooks/useStoryGeneration';
const PAGES = { HOME: 'home', SELECT_VALUE: 'select_value', UPLOAD_PHOTO: 'upload_photo', STORY_VIEW: 'story_view' };
export default function App() {
  const [page, setPage] = useState(PAGES.HOME);
  const [bedtimeMode, setBedtimeMode] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [childName, setChildName] = useState('Friend');
  const [childPhotoKey, setChildPhotoKey] = useState(null);
  const { stage, storyData, error, progress, startGeneration, reset: resetGeneration } = useStoryGeneration();
  useEffect(() => {
    document.body.classList.toggle('bedtime-mode', bedtimeMode);
    document.documentElement.classList.toggle('dark', bedtimeMode);
  }, [bedtimeMode]);
  const handleValueSelected = useCallback((value) => { setSelectedValue(value); setPage(PAGES.UPLOAD_PHOTO); }, []);
  const handlePhotoReady = useCallback((photoKey) => {
    setChildPhotoKey(photoKey);
    setPage(PAGES.STORY_VIEW);
    startGeneration(selectedValue, childName, photoKey);
  }, [selectedValue, childName, startGeneration]);
  const handleReset = useCallback(() => { resetGeneration(); setSelectedValue(null); setChildPhotoKey(null); setPage(PAGES.HOME); }, [resetGeneration]);
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${bedtimeMode ? 'bg-[#1a1207]' : 'bg-[#fef9ef]'}`}>
      <Header bedtimeMode={bedtimeMode} onToggleBedtime={() => setBedtimeMode((b) => !b)} />
      <main className="flex-1 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {page === PAGES.HOME && <HomePage key="home" onStart={() => setPage(PAGES.SELECT_VALUE)} bedtimeMode={bedtimeMode} onSetChildName={setChildName} />}
          {page === PAGES.SELECT_VALUE && <SelectValuePage key="select" onSelect={handleValueSelected} onBack={() => setPage(PAGES.HOME)} bedtimeMode={bedtimeMode} onToggleBedtime={() => setBedtimeMode((b) => !b)} />}
          {page === PAGES.UPLOAD_PHOTO && <UploadPhotoPage key="upload" onPhotoReady={handlePhotoReady} onBack={() => setPage(PAGES.SELECT_VALUE)} bedtimeMode={bedtimeMode} />}
          {page === PAGES.STORY_VIEW && <StoryViewPage key="story" stage={stage} progress={progress} storyData={storyData} error={error} onBack={() => setPage(PAGES.SELECT_VALUE)} onReset={handleReset} bedtimeMode={bedtimeMode} />}
        </AnimatePresence>
      </main>
      <footer className={`text-center py-4 text-xs ${bedtimeMode ? 'text-amber-800' : 'text-gray-300'}`}>GOPA — Amazon Nova AI Hackathon 2026</footer>
    </div>
  );
}
