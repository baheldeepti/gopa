import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import PhotoUpload from '../components/PhotoUpload';

export default function UploadPhotoPage({ onPhotoReady, onBack, bedtimeMode }) {
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

      <PhotoUpload
        onPhotoUploaded={(photoKey) => onPhotoReady(photoKey)}
        onSkip={() => onPhotoReady(null)}
      />
    </motion.div>
  );
}
