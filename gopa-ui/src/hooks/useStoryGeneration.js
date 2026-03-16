import { useState, useCallback } from 'react';
const API_URL = 'https://xky29a0bl1.execute-api.us-east-1.amazonaws.com/Prod';
export function useStoryGeneration() {
  const [stage, setStage] = useState('idle');
  const [storyData, setStoryData] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const startGeneration = useCallback(async (value, childName, childPhotoKey) => {
    setStage('generating_images');
    setError(null);
    setProgress(20);
    try {
      const res = await fetch(`${API_URL}/api/story/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Krishna teaches ${value} to children in Vrindavan`, value, child_name: childName, child_photo_key: childPhotoKey }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
      const result = await res.json();
      setStoryData(result);
      setStage('complete');
      setProgress(100);
    } catch (e) {
      setError(e.message);
      setStage('error');
      setProgress(0);
    }
  }, []);
  const reset = useCallback(() => { setStage('idle'); setStoryData(null); setError(null); setProgress(0); }, []);
  return { stage, storyData, error, progress, startGeneration, reset };
}
