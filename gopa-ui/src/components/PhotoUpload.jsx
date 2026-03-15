import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X } from 'lucide-react';
export default function PhotoUpload({ onPhotoUploaded, onSkip }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { onPhotoUploaded(null); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/photo', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();
      onPhotoUploaded(result.s3_key);
    } catch (err) {
      console.error('Upload failed:', err);
      onPhotoUploaded(null);
    } finally { setUploading(false); }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div className="bg-gradient-to-br from-krishna-100 to-blue-200 rounded-3xl p-6 w-full text-center shadow-md">
        <h2 className="font-display font-bold text-xl text-krishna-800 mb-2">Meet Your Friend!</h2>
        <p className="font-body text-sm text-krishna-600 mb-3">Want to be in a story with Krishna?</p>
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="text-center"><div className="text-3xl">🪈</div><span className="text-xs text-krishna-600">Krishna</span></div>
          <div className="text-center"><div className="text-3xl">😊</div><span className="text-xs text-krishna-600">Kid</span></div>
        </div>
        <p className="font-body text-xs text-krishna-500 italic">Nova needs your smile! Upload your photo to join the fun!</p>
      </div>
      <div className="w-full">
        {preview ? (
          <div className="relative">
            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button onClick={() => { setPreview(null); if(fileRef.current) fileRef.current.value=''; }}
              className="absolute top-0 right-1/4 p-1.5 bg-red-500 rounded-full text-white shadow-md"><X size={16} /></button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-48 h-48 mx-auto rounded-full border-3 border-dashed border-saffron-300 bg-saffron-50 cursor-pointer hover:bg-saffron-100">
            <Camera size={40} className="text-saffron-400 mb-2" />
            <span className="font-display font-semibold text-saffron-600 text-sm">Smile for Nova!</span>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </label>
        )}
      </div>
      <div className="flex flex-col gap-3 w-full">
        {preview && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.97 }}
            onClick={handleUpload} disabled={uploading}
            className="w-full py-3.5 bg-gradient-to-r from-saffron-500 to-orange-500 text-white font-display font-bold text-lg rounded-2xl shadow-lg disabled:opacity-60">
            {uploading ? 'Uploading...' : 'Use This Photo'}</motion.button>
        )}
        <button onClick={onSkip} className="w-full py-3 bg-gray-100 text-gray-500 font-display font-semibold rounded-2xl hover:bg-gray-200">
          Skip — Tell Story Without Photo</button>
      </div>
    </motion.div>
  );
}
