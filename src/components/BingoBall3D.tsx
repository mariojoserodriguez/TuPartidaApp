import React from 'react';
import { getLetterForNumber } from '../lib/bingoEngine';

interface BingoBall3DProps {
  number?: number;
  letter?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isLatest?: boolean;
}

const BALL_COLORS: Record<'B' | 'I' | 'N' | 'G' | 'O', {
  bgGradient: string;
  shadowColor: string;
  badgeTextColor: string;
}> = {
  B: {
    bgGradient: 'radial-gradient(circle at 35% 30%, #60a5fa 0%, #2563eb 45%, #1e3a8a 85%, #0f172a 100%)',
    shadowColor: 'rgba(37, 99, 235, 0.5)',
    badgeTextColor: '#1d4ed8',
  },
  I: {
    bgGradient: 'radial-gradient(circle at 35% 30%, #fef08a 0%, #eab308 45%, #a16207 85%, #422006 100%)',
    shadowColor: 'rgba(234, 179, 8, 0.5)',
    badgeTextColor: '#854d0e',
  },
  N: {
    bgGradient: 'radial-gradient(circle at 35% 30%, #c084fc 0%, #9333ea 45%, #581c87 85%, #2e1065 100%)',
    shadowColor: 'rgba(147, 51, 234, 0.5)',
    badgeTextColor: '#6b21a8',
  },
  G: {
    bgGradient: 'radial-gradient(circle at 35% 30%, #6ee7b7 0%, #10b981 45%, #047857 85%, #064e3b 100%)',
    shadowColor: 'rgba(16, 185, 129, 0.5)',
    badgeTextColor: '#065f46',
  },
  O: {
    bgGradient: 'radial-gradient(circle at 35% 30%, #fca5a5 0%, #ef4444 45%, #991b1b 85%, #450a0a 100%)',
    shadowColor: 'rgba(239, 68, 68, 0.5)',
    badgeTextColor: '#991b1b',
  },
};

export const BingoBall3D: React.FC<BingoBall3DProps> = ({
  number,
  letter,
  size = 'md',
  className = '',
  isLatest = false,
}) => {
  const ballLetter = (letter || (number ? getLetterForNumber(number) : 'B')) as 'B' | 'I' | 'N' | 'G' | 'O';
  const color = BALL_COLORS[ballLetter] || BALL_COLORS.B;

  // Dimensions
  const dim = {
    xs: { outer: 'w-7 h-7', inner: 'w-4.5 h-4.5', text: 'text-[9px]', letter: 'text-[6px]' },
    sm: { outer: 'w-10 h-10', inner: 'w-6.5 h-6.5', text: 'text-xs', letter: 'text-[8px]' },
    md: { outer: 'w-14 h-14', inner: 'w-9 h-9', text: 'text-base', letter: 'text-[10px]' },
    lg: { outer: 'w-20 h-20', inner: 'w-13 h-13', text: 'text-2xl', letter: 'text-xs' },
    xl: { outer: 'w-32 h-32', inner: 'w-20 h-20', text: 'text-4xl', letter: 'text-sm' },
  }[size];

  if (!number) {
    return (
      <div 
        className={`${dim.outer} rounded-full bg-[#171f33] border-2 border-white/10 flex items-center justify-center text-zinc-500 text-xs font-bold shadow-inner ${className}`}
      >
        <span>?</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full select-none flex-shrink-0 transition-transform ${dim.outer} ${className}`}
      style={{
        background: color.bgGradient,
        boxShadow: `0 8px 16px -2px ${color.shadowColor}, inset -4px -4px 8px rgba(0,0,0,0.7), inset 4px 4px 8px rgba(255,255,255,0.6)`,
      }}
    >
      {/* 3D Top-Left Specular Shine */}
      <div 
        className="absolute top-1 left-2 w-1/3 h-1/4 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 40%, transparent 80%)',
          transform: 'rotate(-20deg)',
        }}
      />

      {/* Inner White Ball Center with Printed Letter & Number */}
      <div 
        className={`${dim.inner} rounded-full bg-gradient-to-b from-white via-zinc-100 to-zinc-200 border border-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center z-10`}
      >
        <span 
          className={`font-black uppercase tracking-wider leading-none ${dim.letter}`}
          style={{ color: color.badgeTextColor }}
        >
          {ballLetter}
        </span>
        <span className={`font-black font-['Space_Grotesk'] text-zinc-950 leading-none mt-0.5 ${dim.text}`}>
          {number}
        </span>
      </div>

      {/* "NUEVA" Badge if latest */}
      {isLatest && (
        <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[8px] font-black uppercase px-1 py-0.2 rounded-full shadow-md animate-bounce z-20">
          Nueva
        </span>
      )}
    </div>
  );
};
