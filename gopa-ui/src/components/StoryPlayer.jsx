import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Film } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
function getImageUrl(scene) {
  if (!scene?.image_url) return null;
  const url = scene.image_url;
  if (url.startsWith('/static')) return API_URL + url;
  if (url.startsWith('http')) return url;
  return API_URL + '/' + url;
}
export default function StoryPlayer({ storyData, bedtimeMode }) {
  const [videoRequested, setVideoRequested] = useState(false);
  const [videoStatus, setVideoStatus] = useState(null);
  const scrollRef = useRef(null);
  const scenes = storyData?.scenes || [];
  const title = storyData?.title || 'A Krishna Adventure';
  const storyId = storyData?.story_id;
  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };
  const requestVideo = async () => {
    setVideoRequested(true);
    setVideoStatus('generating');
    try {
      const res = await fetch(API_URL + '/api/story/generate-video/' + storyId, { method: 'POST' });
      if (!res.ok) throw new Error('Video request failed');
      setVideoStatus('in_progress');
    } catch (e) {
      setVideoStatus('error');
    }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col gap-5">
      <h2 className={`font-display font-bold text-2xl text-center ${bedtimeMode ? 'text-amber-100' : 'text-gray-800'}`}>{title}</h2>
      <p className={`text-center text-sm font-body ${bedtimeMode ? 'text-amber-300' : 'text-gray-500'}`}>Swipe through scenes</p>
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow-md hover:bg-white"><ChevronLeft size={20} /></button>
        <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow-md hover:bg-white"><ChevronRight size={20} /></button>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-8 scrollbar-hide" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
          {scenes.map((scene, i) => {
            const imgUrl = getImageUrl(scene);
            return (
              <motion.div key={i} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                className={`flex-shrink-0 w-72 snap-center rounded-3xl overflow-hidden shadow-lg ${bedtimeMode ? 'bg-amber-900/40' : 'bg-white'}`}>
                <div className="relative h-44 bg-gradient-to-br from-krishna-100 to-vrindavan-100">
                  {imgUrl ? <img src={imgUrl} alt={`Scene ${i+1}`} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><span className="text-4xl">🎨</span></div>}
                  <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-display">Scene {i+1}</div>
                </div>
                <div className="p-4">
                  <p className={`font-body text-sm leading-relaxed ${bedtimeMode ? 'text-amber-100' : 'text-gray-700'}`}>
                    {scene.narration || 'Loading narration...'}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2 justify-center">
        {scenes.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-saffron-500' : 'bg-gray-300'}`} />
        ))}
      </div>
      {!videoRequested ? (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          onClick={requestVideo} disabled={!storyId}
          className="mx-auto px-8 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-display font-bold text-lg rounded-2xl shadow-lg flex items-center gap-2 hover:shadow-xl disabled:opacity-50">
          <Film size={20} /> Generate Video
        </motion.button>
      ) : (
        <div className="text-center py-4">
          {videoStatus === 'generating' && <p className="font-display text-sm text-gray-500 animate-pulse">Starting video generation...</p>}
          {videoStatus === 'in_progress' && <p className="font-display text-sm text-gray-500 animate-pulse">Video generating... this takes 30-60 seconds per scene</p>}
          {videoStatus === 'error' && <p className="font-display text-sm text-red-400">Video generation failed. Try again later.</p>}
        </div>
      )}
    </motion.div>
  );
}
