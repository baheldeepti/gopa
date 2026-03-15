import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { getLiveKitToken } from '../utils/api';

/**
 * VoiceNarrator — connects to LiveKit room where the Nova Sonic narrator agent lives.
 * Uses @livekit/components-react for audio handling.
 * Falls back gracefully if LiveKit is not configured.
 */
export default function VoiceNarrator({ storyContext = '', bedtimeMode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Get token from backend
      const { token, room_name, livekit_url } = await getLiveKitToken(
        `gopa-${Date.now()}`,
        'child-listener'
      );

      // Dynamic import of livekit-client to keep bundle small if not used
      const { Room, RoomEvent } = await import('livekit-client');

      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      newRoom.on(RoomEvent.Connected, () => {
        setIsConnected(true);
        setIsConnecting(false);
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setRoom(null);
      });

      newRoom.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === 'audio') {
          const element = track.attach();
          document.body.appendChild(element);
          // Lower volume in bedtime mode
          if (bedtimeMode) element.volume = 0.4;
        }
      });

      await newRoom.connect(livekit_url, token);
      setRoom(newRoom);

      // Enable microphone for child to talk to narrator
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      setIsMicOn(true);

    } catch (err) {
      console.error('LiveKit connection failed:', err);
      setError('Voice narrator is not available. Check LiveKit setup.');
      setIsConnecting(false);
    }
  }, [bedtimeMode]);

  const disconnect = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
    }
    setIsConnected(false);
    setIsMicOn(false);
  }, [room]);

  const toggleMic = useCallback(async () => {
    if (!room) return;
    const newState = !isMicOn;
    await room.localParticipant.setMicrophoneEnabled(newState);
    setIsMicOn(newState);
  }, [room, isMicOn]);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.button
            key="connect"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={connect}
            disabled={isConnecting}
            className={`
              w-full py-4 rounded-2xl font-display font-bold text-lg
              flex items-center justify-center gap-3 shadow-lg
              transition-all duration-300
              ${bedtimeMode
                ? 'bg-gradient-to-r from-indigo-800 to-purple-900 text-indigo-100 hover:shadow-indigo-500/20'
                : 'bg-gradient-to-r from-krishna-500 to-blue-600 text-white hover:shadow-krishna-500/30'
              }
              disabled:opacity-60
            `}
          >
            <Volume2 size={22} />
            {isConnecting ? 'Connecting to Gopa...' : '🪈 Talk to Gopa (Voice AI)'}
          </motion.button>
        ) : (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              w-full p-4 rounded-2xl flex items-center justify-between
              ${bedtimeMode ? 'bg-indigo-900/50 border border-indigo-700' : 'bg-krishna-50 border border-krishna-200'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bedtimeMode ? 'bg-indigo-700' : 'bg-krishna-200'}`}>
                  <span className="text-lg">🪈</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <p className={`font-display font-bold text-sm ${bedtimeMode ? 'text-indigo-100' : 'text-krishna-800'}`}>
                  Gopa is listening...
                </p>
                <p className={`text-xs ${bedtimeMode ? 'text-indigo-300' : 'text-krishna-500'}`}>
                  Powered by Nova Sonic
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-full transition-colors ${
                  isMicOn
                    ? 'bg-green-500 text-white'
                    : 'bg-red-100 text-red-500'
                }`}
              >
                {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                onClick={disconnect}
                className="p-2.5 rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-red-400 text-center mt-2">{error}</p>
      )}
    </div>
  );
}
