import React, { useMemo } from 'react';
import { MarkerType } from '../types';

interface GrainMarkerProps {
  type: MarkerType;
  size?: 'sm' | 'md' | 'lg';
  seed?: string; // Seed string (e.g. `${cardId}_${cellIndex}`) for realistic organic random rotation and offset
  className?: string;
}

/**
 * Generates deterministic pseudo-random rotation, jitter offset, and scale
 * so beans don't all look identical or aligned in the exact same direction on the card.
 */
function getOrganicTransform(seed?: string, type?: MarkerType) {
  if (!seed) return { rot: -10, dx: 0, dy: 0, scale: 1 };

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  const abs = Math.abs(hash);

  // Different rotation ranges per seed
  let rot = (abs % 140) - 70; // -70deg to +70deg
  if (type === 'LENTEJA') {
    rot = (abs % 360) - 180; // Full 360deg disc freedom
  } else if (type === 'MAIZ') {
    rot = (abs % 160) - 80;
  } else if (type === 'NEON') {
    rot = (abs % 24) - 12; // Slight stamp tilt
  }

  // Slight jitter displacement from center (-3.5px to +3.5px)
  const dx = ((abs >> 3) % 7) - 3;
  const dy = ((abs >> 6) % 7) - 3;
  // Natural size variance (0.93 to 1.07)
  const scale = 0.93 + ((abs >> 9) % 15) * 0.01;

  return { rot, dx, dy, scale };
}

export const GrainMarker: React.FC<GrainMarkerProps> = ({
  type,
  size = 'md',
  seed,
  className = '',
}) => {
  const { rot, dx, dy, scale } = useMemo(() => getOrganicTransform(seed, type), [seed, type]);

  // Dimensions
  const pixelSize = size === 'sm' ? 22 : size === 'lg' ? 42 : 30;

  const transformStyle: React.CSSProperties = {
    transform: `rotate(${rot}deg) translate(${dx}px, ${dy}px) scale(${scale})`,
    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.75))',
    transformOrigin: 'center center',
  };

  if (type === 'CARAOTA') {
    // Hyper-realistic Venezuelan Caraota Negra:
    // Kidney bean shape, deep glossy charcoal black, curved specular spine reflection, and distinct white hilum
    return (
      <div 
        className={`inline-flex items-center justify-center select-none pointer-events-none transition-transform ${className}`}
        style={transformStyle}
      >
        <svg 
          width={pixelSize * 0.88} 
          height={pixelSize * 1.15} 
          viewBox="0 0 100 130" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 3D Body shading */}
            <radialGradient id="caraotaShading" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#2c3038" />
              <stop offset="35%" stopColor="#14171d" />
              <stop offset="85%" stopColor="#080a0e" />
              <stop offset="100%" stopColor="#020305" />
            </radialGradient>

            {/* Specular curved gloss on bean back */}
            <linearGradient id="caraotaGloss" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Hilum gradient */}
            <linearGradient id="hilumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d1d5db" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#9ca3af" />
            </linearGradient>
          </defs>

          {/* Cast shadow behind */}
          <ellipse cx="50" cy="68" rx="42" ry="54" fill="rgba(0,0,0,0.5)" filter="blur(3px)" />

          {/* Organic Kidney Bean Main Body */}
          <path 
            d="M50 8 C76 8, 92 30, 92 65 C92 100, 75 122, 50 122 C28 122, 10 102, 10 70 C10 46, 26 28, 40 16 Z" 
            fill="url(#caraotaShading)" 
            stroke="#0a0c10" 
            strokeWidth="2"
          />

          {/* Specular Top Curved Highlight */}
          <path 
            d="M42 16 C58 14, 75 24, 80 44 C82 50, 78 52, 74 46 C70 34, 58 26, 42 22 C38 21, 38 17, 42 16 Z" 
            fill="url(#caraotaGloss)" 
            opacity="0.9"
          />

          {/* Subtle Secondary Rim Sheen */}
          <ellipse cx="68" cy="85" rx="14" ry="24" fill="#ffffff" opacity="0.08" transform="rotate(20 68 85)" />

          {/* Hilum ("El Ombligo" blanco en la cintura del grano) */}
          <g transform="translate(18, 56) rotate(12)">
            {/* White scar oval */}
            <ellipse cx="10" cy="14" rx="5" ry="11" fill="url(#hilumGrad)" stroke="#111827" strokeWidth="1.2" />
            {/* Dark internal seed pore slit */}
            <path d="M10 7 L10 21" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    );
  }

  if (type === 'MAIZ') {
    // Hyper-realistic Dried Golden Corn Kernel:
    // Wedge/flat-triangular popcorn/corn kernel shape, rich golden yellow, toasted translucent crown, creamy tip cap
    return (
      <div 
        className={`inline-flex items-center justify-center select-none pointer-events-none transition-transform ${className}`}
        style={transformStyle}
      >
        <svg 
          width={pixelSize * 0.9} 
          height={pixelSize * 1.1} 
          viewBox="0 0 100 125" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Corn golden yellow gradient */}
            <radialGradient id="maizGrad" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#f59e0b" />
              <stop offset="75%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>

            {/* Tip cap base gradient (blanquecino / tostado donde se une a la mazorca) */}
            <linearGradient id="tipCapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="60%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            <linearGradient id="maizShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Drop shadow */}
          <ellipse cx="50" cy="65" rx="38" ry="50" fill="rgba(0,0,0,0.4)" filter="blur(3px)" />

          {/* Wedge-shaped Corn Kernel Body */}
          <path 
            d="M25 15 C40 10, 60 10, 75 15 C88 20, 92 45, 80 85 C74 100, 62 112, 50 114 C38 112, 26 100, 20 85 C8 45, 12 20, 25 15 Z" 
            fill="url(#maizGrad)" 
            stroke="#92400e" 
            strokeWidth="1.5"
          />

          {/* Kernel Crown Dent & Ridge (abolladura típica del maíz seco) */}
          <path 
            d="M32 24 C45 20, 55 20, 68 24 C60 38, 40 38, 32 24 Z" 
            fill="#d97706" 
            opacity="0.5"
          />

          {/* Translucent Front Sheen */}
          <ellipse cx="42" cy="40" rx="18" ry="26" fill="url(#maizShine)" opacity="0.6" />

          {/* Tip Cap at bottom (punta de inserción) */}
          <path 
            d="M38 100 C45 98, 55 98, 62 100 C58 114, 52 116, 50 116 C48 116, 42 114, 38 100 Z" 
            fill="url(#tipCapGrad)" 
            stroke="#78350f" 
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  }

  if (type === 'LENTEJA') {
    // Hyper-realistic Traditional Brown Lentil:
    // Biconvex lens disc shape, warm olive brown with perimeter rim and gentle dome specular highlight
    return (
      <div 
        className={`inline-flex items-center justify-center select-none pointer-events-none transition-transform ${className}`}
        style={transformStyle}
      >
        <svg 
          width={pixelSize} 
          height={pixelSize} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Lentil 3D dome gradient */}
            <radialGradient id="lentejaGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#a37b58" />
              <stop offset="40%" stopColor="#7c5539" />
              <stop offset="80%" stopColor="#533722" />
              <stop offset="100%" stopColor="#321e12" />
            </radialGradient>

            <linearGradient id="lentejaRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b48c68" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2c1a0e" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="50" cy="54" rx="44" ry="42" fill="rgba(0,0,0,0.5)" filter="blur(2.5px)" />

          {/* Outer Lens Rim */}
          <circle cx="50" cy="50" r="44" fill="url(#lentejaRim)" stroke="#382112" strokeWidth="1.5" />

          {/* Convex Dome Center */}
          <circle cx="50" cy="50" r="40" fill="url(#lentejaGrad)" />

          {/* Specular circular shine */}
          <ellipse cx="38" cy="36" rx="16" ry="12" fill="#ffffff" opacity="0.3" transform="rotate(-20 38 36)" />
          <ellipse cx="35" cy="33" rx="5" ry="3.5" fill="#ffffff" opacity="0.6" transform="rotate(-20 35 33)" />
        </svg>
      </div>
    );
  }

  // Sello Arcade Neón
  return (
    <div 
      className={`inline-flex items-center justify-center select-none pointer-events-none transition-transform ${className}`}
      style={transformStyle}
    >
      <div 
        className="rounded-full bg-emerald-500/30 flex items-center justify-center relative shadow-[0_0_16px_rgba(74,222,163,0.9)] border-2 border-emerald-400"
        style={{ width: pixelSize, height: pixelSize }}
      >
        <div 
          className="rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center shadow-inner"
          style={{ width: pixelSize * 0.65, height: pixelSize * 0.65 }}
        >
          <span className="text-zinc-950 text-xs font-black">★</span>
        </div>
      </div>
    </div>
  );
};
