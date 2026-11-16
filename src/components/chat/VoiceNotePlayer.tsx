import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceNotePlayerProps {
  audioData: string; // Base64 data URL
  duration?: number;
  isSelf?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioData,
  duration = 0,
  isSelf = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioData);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.onerror = () => {
      setIsPlaying(false);
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioData]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const formatSec = (sec: number) => {
    const s = Math.floor(sec);
    return `0:0${s}`.slice(-4);
  };

  const totalTime = duration || (audioRef.current?.duration || 0);

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl min-w-[170px] max-w-[220px] ${
      isSelf 
        ? 'bg-emerald-700/40 text-emerald-100 border border-emerald-500/30' 
        : 'bg-[#0f172a] text-[#dae2fd] border border-white/10'
    }`}>
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 shadow-md ${
          isSelf 
            ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
            : 'bg-indigo-600 text-white hover:bg-indigo-500'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform Visualization Bars */}
      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-0.5 h-4">
          {[40, 75, 55, 90, 60, 80, 45, 95, 70, 50, 85, 65].map((h, i) => {
            const isPlayed = (currentTime / (totalTime || 5)) > (i / 12);
            return (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className={`w-1 rounded-full transition-colors ${
                  isPlayed 
                    ? isSelf ? 'bg-emerald-300' : 'bg-indigo-400'
                    : isSelf ? 'bg-emerald-900/60' : 'bg-zinc-700'
                } ${isPlaying ? 'animate-pulse' : ''}`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-['Space_Grotesk'] leading-none">
          <span>{formatSec(isPlaying ? currentTime : totalTime)}</span>
          <Volume2 className="w-3 h-3 opacity-60" />
        </div>
      </div>
    </div>
  );
};
