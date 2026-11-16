/**
 * Preset Venezuelan Criollo Stickers generated as clean, standalone SVG Data URLs
 * 100% vector, zero external dependencies, works on all Windows/Mac/Android/iOS devices!
 */

export interface CriolloStickerDef {
  id: string;
  title: string;
  subtitle: string;
  svgDataUrl: string;
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const CRIOLLO_STICKERS: CriolloStickerDef[] = [
  {
    id: 'caraota',
    title: '¡Pon la caraota!',
    subtitle: 'Marcador criollo',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.5"/>
        </filter>
        <g filter="url(#shadow)">
          <!-- Sticker white contour -->
          <ellipse cx="80" cy="72" rx="56" ry="38" transform="rotate(-15 80 72)" fill="#ffffff"/>
          <!-- Caraota body -->
          <ellipse cx="80" cy="72" rx="52" ry="34" transform="rotate(-15 80 72)" fill="url(#beanGrad)"/>
          <!-- Specular shine -->
          <ellipse cx="70" cy="56" rx="28" ry="10" transform="rotate(-18 70 56)" fill="rgba(255,255,255,0.45)"/>
          <!-- Hilum / ombligo -->
          <ellipse cx="82" cy="73" rx="7" ry="4" transform="rotate(-15 82 73)" fill="#f4f4f5"/>
          <ellipse cx="82" cy="73" rx="4" ry="2" transform="rotate(-15 82 73)" fill="#a1a1aa"/>
        </g>
        <!-- Text badge -->
        <rect x="12" y="118" width="136" height="32" rx="16" fill="#18181b" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="139" font-family="sans-serif" font-weight="900" font-size="12" text-anchor="middle" fill="#facc15">¡PON LA CARAOTA!</text>
        <defs>
          <radialGradient id="beanGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#3f3f46"/>
            <stop offset="50%" stop-color="#18181b"/>
            <stop offset="100%" stop-color="#09090b"/>
          </radialGradient>
        </defs>
      </svg>
    `),
  },
  {
    id: 'maiz',
    title: '¡Maíz pa los pollos!',
    subtitle: 'El grano bendito',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
        <filter id="shadow2">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.4"/>
        </filter>
        <g filter="url(#shadow2)">
          <!-- White sticker contour -->
          <path d="M46 42 C40 85 58 112 80 112 C102 112 120 85 114 42 C110 25 50 25 46 42 Z" fill="#ffffff" transform="scale(1.08) translate(-6 -4)"/>
          <!-- Corn body -->
          <path d="M46 42 C40 85 58 112 80 112 C102 112 120 85 114 42 C110 25 50 25 46 42 Z" fill="url(#cornGrad)"/>
          <!-- Tip cap -->
          <path d="M68 106 C72 113 88 113 92 106 Z" fill="#fef08a"/>
          <!-- Specular highlight -->
          <ellipse cx="68" cy="50" rx="14" ry="8" fill="rgba(255,255,255,0.6)"/>
        </g>
        <rect x="10" y="118" width="140" height="32" rx="16" fill="#b45309" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="139" font-family="sans-serif" font-weight="900" font-size="11.5" text-anchor="middle" fill="#ffffff">¡MAÍZ PA' LOS POLLOS!</text>
        <defs>
          <radialGradient id="cornGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="45%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#b45309"/>
          </radialGradient>
        </defs>
      </svg>
    `),
  },
  {
    id: 'atiro',
    title: '¡A tiro de BINGO!',
    subtitle: 'A un número de ganar',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
        <!-- Target circles -->
        <circle cx="80" cy="68" r="46" fill="#ffffff"/>
        <circle cx="80" cy="68" r="42" fill="#ef4444"/>
        <circle cx="80" cy="68" r="32" fill="#ffffff"/>
        <circle cx="80" cy="68" r="22" fill="#ef4444"/>
        <circle cx="80" cy="68" r="12" fill="#facc15"/>
        <polygon points="80,59 83,65 90,66 85,71 86,77 80,74 74,77 75,71 70,66 77,65" fill="#ffffff"/>
        <!-- Arrow dart -->
        <path d="M110 32 L85 62" stroke="#18181b" stroke-width="4" stroke-linecap="round"/>
        <polygon points="110,26 122,30 116,42" fill="#f59e0b"/>
        <rect x="10" y="118" width="140" height="32" rx="16" fill="#dc2626" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="139" font-family="sans-serif" font-weight="900" font-size="12" text-anchor="middle" fill="#ffffff">¡A TIRO DE BINGO! 🎯</text>
      </svg>
    `),
  },
  {
    id: 'salao',
    title: '¡No me sale ni una!',
    subtitle: 'La mala racha',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
        <circle cx="80" cy="68" r="46" fill="#ffffff"/>
        <circle cx="80" cy="68" r="42" fill="#38bdf8"/>
        <!-- Shocked face -->
        <ellipse cx="66" cy="58" rx="7" ry="11" fill="#ffffff"/>
        <ellipse cx="94" cy="58" rx="7" ry="11" fill="#ffffff"/>
        <circle cx="66" cy="60" r="4" fill="#0369a1"/>
        <circle cx="94" cy="60" r="4" fill="#0369a1"/>
        <!-- Open mouth -->
        <ellipse cx="80" cy="85" rx="10" ry="14" fill="#082f49"/>
        <!-- Sweat drops -->
        <path d="M42 46 C42 40 48 35 48 35 C48 35 54 40 54 46 C54 50 49 53 45 51 C43 49 42 48 42 46 Z" fill="#bae6fd"/>
        <rect x="8" y="118" width="144" height="32" rx="16" fill="#0284c7" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="139" font-family="sans-serif" font-weight="900" font-size="11.5" text-anchor="middle" fill="#ffffff">¡NO ME SALE NI UNA! 😱</text>
      </svg>
    `),
  },
  {
    id: 'bombo',
    title: '¡Pónganle azúcar al bombo!',
    subtitle: 'Que salgan los míos',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
        <!-- Fire flames in background -->
        <path d="M80 18 C95 40 120 50 110 85 C100 105 60 105 50 85 C40 50 65 40 80 18 Z" fill="#f97316"/>
        <path d="M80 34 C90 50 108 58 100 85 C92 100 68 100 60 85 C52 58 70 50 80 34 Z" fill="#facc15"/>
        <!-- Ball in center -->
        <circle cx="80" cy="74" r="28" fill="#1e1b4b" stroke="#ffffff" stroke-width="4"/>
        <circle cx="80" cy="74" r="17" fill="#ffffff"/>
        <text x="80" y="81" font-family="sans-serif" font-weight="900" font-size="18" text-anchor="middle" fill="#1e1b4b">75</text>
        <rect x="6" y="118" width="148" height="32" rx="16" fill="#ea580c" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="139" font-family="sans-serif" font-weight="900" font-size="10" text-anchor="middle" fill="#ffffff">¡AZÚCAR AL BOMBO! 🔥</text>
      </svg>
    `),
  },
  {
    id: 'trampa',
    title: '¡Trampa de la buena!',
    subtitle: 'Riendo de nervios',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
        <circle cx="80" cy="68" r="46" fill="#ffffff"/>
        <circle cx="80" cy="68" r="42" fill="#fbbf24"/>
        <!-- Laughing squinting eyes -->
        <path d="M54 58 L70 66 L54 74" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
        <path d="M106 58 L90 66 L106 74" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
        <!-- Big open laughing mouth -->
        <path d="M58 76 C58 100 102 100 102 76 Z" fill="#991b1b"/>
        <path d="M64 76 C64 84 96 84 96 76 Z" fill="#ffffff"/>
        <!-- Tears of joy -->
        <ellipse cx="44" cy="72" rx="6" ry="10" fill="#38bdf8"/>
        <ellipse cx="116" cy="72" rx="6" ry="10" fill="#38bdf8"/>
        <rect x="8" y="118" width="144" height="32" rx="16" fill="#d97706" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="139" font-family="sans-serif" font-weight="900" font-size="11" text-anchor="middle" fill="#ffffff">¡TRAMPA DE LA BUENA! 🤣</text>
      </svg>
    `),
  },
  {
    id: 'premio',
    title: '¡Ese premio es mío!',
    subtitle: 'Bolsa de reales',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
        <!-- Money Bag -->
        <path d="M70 34 C64 28 96 28 90 34 L98 46 C124 54 126 106 80 106 C34 106 36 54 62 46 Z" fill="#ffffff" transform="scale(1.08) translate(-6 -4)"/>
        <path d="M70 34 C64 28 96 28 90 34 L98 46 C124 54 126 106 80 106 C34 106 36 54 62 46 Z" fill="#15803d"/>
        <!-- String tied -->
        <rect x="66" y="44" width="28" height="6" rx="3" fill="#facc15"/>
        <!-- Dollar sign -->
        <text x="80" y="85" font-family="sans-serif" font-weight="900" font-size="34" text-anchor="middle" fill="#fef08a">$</text>
        <rect x="8" y="118" width="144" height="32" rx="16" fill="#166534" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="139" font-family="sans-serif" font-weight="900" font-size="11.5" text-anchor="middle" fill="#fef08a">¡EL PREMIO ES MÍO! 💸</text>
      </svg>
    `),
  },
  {
    id: 'bingo',
    title: '¡BINGO BINGO BINGO!',
    subtitle: 'El grito de gloria',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
        <!-- Starburst / Explosion -->
        <path d="M80 14 L94 48 L130 38 L114 70 L146 88 L112 100 L120 134 L88 116 L70 146 L58 112 L24 120 L40 88 L14 70 L48 56 L38 22 L72 36 Z" fill="#ffffff" transform="scale(1.05) translate(-4 -3)"/>
        <path d="M80 14 L94 48 L130 38 L114 70 L146 88 L112 100 L120 134 L88 116 L70 146 L58 112 L24 120 L40 88 L14 70 L48 56 L38 22 L72 36 Z" fill="#fbbf24"/>
        <circle cx="80" cy="74" r="32" fill="#4338ca" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="82" font-family="sans-serif" font-weight="900" font-size="16" text-anchor="middle" fill="#ffffff">¡BINGO!</text>
        <rect x="6" y="118" width="148" height="32" rx="16" fill="#4f46e5" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="139" font-family="sans-serif" font-weight="900" font-size="11.5" text-anchor="middle" fill="#fef08a">¡BINGO BINGO BINGO! 🎉</text>
      </svg>
    `),
  },
  {
    id: 'campeon',
    title: '¡Mente de Campeón!',
    subtitle: 'El trofeo dorado',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
        <!-- Trophy Cup -->
        <path d="M52 38 L108 38 L98 76 C94 88 86 92 80 92 C74 92 66 88 62 76 Z" fill="#ffffff" transform="scale(1.1) translate(-8 -4)"/>
        <path d="M52 38 L108 38 L98 76 C94 88 86 92 80 92 C74 92 66 88 62 76 Z" fill="#eab308"/>
        <!-- Handles -->
        <path d="M54 44 C40 44 40 68 56 70" fill="none" stroke="#ca8a04" stroke-width="6" stroke-linecap="round"/>
        <path d="M106 44 C120 44 120 68 104 70" fill="none" stroke="#ca8a04" stroke-width="6" stroke-linecap="round"/>
        <!-- Base -->
        <rect x="74" y="90" width="12" height="14" fill="#a16207"/>
        <rect x="60" y="104" width="40" height="10" rx="3" fill="#854d0e"/>
        <rect x="8" y="118" width="144" height="32" rx="16" fill="#a16207" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="139" font-family="sans-serif" font-weight="900" font-size="11" text-anchor="middle" fill="#fef08a">¡MENTE DE CAMPEÓN! 🏆</text>
      </svg>
    `),
  },
  {
    id: 'cafe',
    title: '¡Un cafecito en la mesa!',
    subtitle: 'Para la paciencia',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
        <!-- Cup -->
        <ellipse cx="76" cy="100" rx="42" ry="10" fill="#cbd5e1"/>
        <path d="M44 54 L108 54 C104 88 94 98 76 98 C58 98 48 88 44 54 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>
        <!-- Coffee surface -->
        <ellipse cx="76" cy="54" rx="28" ry="8" fill="#451a03"/>
        <!-- Handle -->
        <path d="M106 60 C120 60 120 84 100 86" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
        <!-- Steams -->
        <path d="M64 42 C64 32 72 28 72 18" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
        <path d="M84 42 C84 32 92 28 92 18" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
        <rect x="6" y="118" width="148" height="32" rx="16" fill="#78350f" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="139" font-family="sans-serif" font-weight="900" font-size="10.5" text-anchor="middle" fill="#ffffff">¡UN CAFECITO EN LA MESA! ☕</text>
      </svg>
    `),
  },
  {
    id: 'rapido',
    title: '¡Mueve esa bola rápido!',
    subtitle: 'El bombo no para',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
        <!-- Lightning bolt -->
        <polygon points="86,16 52,68 82,68 68,114 114,56 84,56" fill="#ffffff" transform="scale(1.08) translate(-6 -4)"/>
        <polygon points="86,16 52,68 82,68 68,114 114,56 84,56" fill="#facc15"/>
        <rect x="6" y="118" width="148" height="32" rx="16" fill="#ca8a04" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="139" font-family="sans-serif" font-weight="900" font-size="10.5" text-anchor="middle" fill="#ffffff">¡MUEVE ESA BOLA RÁPIDO! ⚡</text>
      </svg>
    `),
  },
  {
    id: 'ojo',
    title: '¡Revisen bien ese cartón!',
    subtitle: 'Cuidado con los vivos',
    svgDataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
        <!-- Two big eyes -->
        <ellipse cx="56" cy="66" rx="26" ry="34" fill="#ffffff" stroke="#18181b" stroke-width="4"/>
        <ellipse cx="104" cy="66" rx="26" ry="34" fill="#ffffff" stroke="#18181b" stroke-width="4"/>
        <!-- Pupils -->
        <circle cx="62" cy="66" r="13" fill="#18181b"/>
        <circle cx="110" cy="66" r="13" fill="#18181b"/>
        <!-- Light reflection -->
        <circle cx="65" cy="62" r="4" fill="#ffffff"/>
        <circle cx="113" cy="62" r="4" fill="#ffffff"/>
        <rect x="6" y="118" width="148" height="32" rx="16" fill="#18181b" stroke="#ffffff" stroke-width="3"/>
        <text x="80" y="139" font-family="sans-serif" font-weight="900" font-size="10.5" text-anchor="middle" fill="#ffffff">¡REVISEN BIEN ESE CARTÓN! 👀</text>
      </svg>
    `),
  },
];
