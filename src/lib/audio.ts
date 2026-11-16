/**
 * Web Audio API synthesizer for native sound effects
 * Zero external audio files, works 100% offline and instant!
 */

class SoundEffects {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  // Sound when placing a bean/grain on the card
  playBeanClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  // Sound when a new ball drops from the Bombo
  playBallDrop() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  // Cheerful bell alert when a drawn ball matches a number on the player's card!
  playMatchAlert() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [587.33, 880]; // D5 then A5 bright chime
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.09);

        const startTime = this.ctx!.currentTime + idx * 0.09;
        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch {}
  }

  // Sound when someone wins BINGO!
  playBingoFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [440, 554.37, 659.25, 880]; // A major chord fanfare
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = this.ctx!.currentTime + idx * 0.1;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch {}
  }

  // Dramatic suspense sound when player is 1 number away from BINGO ("A tiro de BINGO")
  playNearBingoSound() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Double heartbeat thump (deep low frequencies 75Hz -> 40Hz)
      [0, 0.22].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(75, t + offset);
        osc.frequency.exponentialRampToValueAtTime(40, t + offset + 0.14);
        gain.gain.setValueAtTime(0.5, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.14);
      });

      // Ascending suspense chime at +0.42s
      const chime = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      chime.type = 'triangle';
      chime.frequency.setValueAtTime(659.25, t + 0.42); // E5
      chime.frequency.exponentialRampToValueAtTime(880, t + 0.65); // A5
      cGain.gain.setValueAtTime(0.3, t + 0.42);
      cGain.gain.exponentialRampToValueAtTime(0.01, t + 0.85);
      chime.connect(cGain);
      cGain.connect(this.ctx.destination);
      chime.start(t + 0.42);
      chime.stop(t + 0.85);
    } catch {}
  }

  // Realistic synthesized crowd applause and cheering
  playApplauseAndCheer() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const duration = 3.5;

      // 1. Crowd noise / Clapping buffer (filtered random impulses)
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Populate with rapid micro-bursts resembling thousands of claps
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.max(0, 1 - (i / bufferSize) * 0.7);
        // Randomized density spikes for individual claps
        const isClapPeak = Math.random() < 0.08;
        const amplitude = isClapPeak ? (Math.random() * 2 - 1) * 0.9 : (Math.random() * 2 - 1) * 0.2;
        data[i] = amplitude * decay;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Bandpass filter centered at 1400Hz (frequencies of hands clapping)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.Q.setValueAtTime(1.2, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.45, t + 0.3); // Swell
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration); // Fade out

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseNode.start(t);
      noiseNode.stop(t + duration);

      // 2. Play alongside victory fanfare chords (A major triumphal fanfare)
      const fanfareNotes = [440, 554.37, 659.25, 880, 1108.73];
      fanfareNotes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const fGain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        const startTime = t + idx * 0.08;
        fGain.gain.setValueAtTime(0.25, startTime);
        fGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);

        osc.connect(fGain);
        fGain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.7);
      });

      // 3. Celebration party whistle at +0.6s
      const whistle = this.ctx.createOscillator();
      const wGain = this.ctx.createGain();
      whistle.type = 'sine';
      whistle.frequency.setValueAtTime(1200, t + 0.6);
      whistle.frequency.exponentialRampToValueAtTime(2400, t + 0.9);
      whistle.frequency.exponentialRampToValueAtTime(1800, t + 1.2);

      wGain.gain.setValueAtTime(0.15, t + 0.6);
      wGain.gain.exponentialRampToValueAtTime(0.01, t + 1.25);

      whistle.connect(wGain);
      wGain.connect(this.ctx.destination);
      whistle.start(t + 0.6);
      whistle.stop(t + 1.25);
    } catch {}
  }

  // Synthesized Firework launch and explosion
  playFireworkSound() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 3 sequential fireworks at slight delays
      [0, 0.45, 0.9].forEach((delay) => {
        const launchTime = t + delay;
        // Whistling rocket ascent
        const whistle = this.ctx!.createOscillator();
        const wGain = this.ctx!.createGain();
        whistle.type = 'sine';
        whistle.frequency.setValueAtTime(450, launchTime);
        whistle.frequency.exponentialRampToValueAtTime(1600, launchTime + 0.35);

        wGain.gain.setValueAtTime(0.12, launchTime);
        wGain.gain.exponentialRampToValueAtTime(0.01, launchTime + 0.35);

        whistle.connect(wGain);
        wGain.connect(this.ctx!.destination);
        whistle.start(launchTime);
        whistle.stop(launchTime + 0.35);

        // Boom explosion at launchTime + 0.35s
        const boomTime = launchTime + 0.35;
        const sub = this.ctx!.createOscillator();
        const sGain = this.ctx!.createGain();
        sub.type = 'triangle';
        sub.frequency.setValueAtTime(160, boomTime);
        sub.frequency.exponentialRampToValueAtTime(35, boomTime + 0.45);

        sGain.gain.setValueAtTime(0.4, boomTime);
        sGain.gain.exponentialRampToValueAtTime(0.01, boomTime + 0.5);

        sub.connect(sGain);
        sGain.connect(this.ctx!.destination);
        sub.start(boomTime);
        sub.stop(boomTime + 0.5);
      });
    } catch {}
  }
}

export const sounds = new SoundEffects();

/**
 * Suspense heartbeat vibration for near-bingo on mobile phones
 */
export function triggerNearBingoVibrate() {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate([120, 80, 120, 80, 260]);
    } catch {}
  }
}

/**
 * Excited pulsing vibration when player completes pattern and can shout BINGO
 */
export function triggerCanClaimBingoVibrate() {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate([150, 75, 150, 75, 250, 100, 350]);
    } catch {}
  }
}

/**
 * Grand celebration vibration across all connected mobile phones when BINGO is won
 */
export function triggerBingoWinVibrate() {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 300, 100, 500, 100, 500]);
    } catch {}
  }
}

/**
 * Haptic feedback vibration on mobile devices when a drawn ball matches player's card
 */
export function triggerHapticMatch() {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate([80, 40, 80]);
    } catch {}
  }
}

// Spanish numbers 1 to 75 written as words for clean natural pronunciation
const SPANISH_NUMBERS: Record<number, string> = {
  1: 'uno', 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco',
  6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez',
  11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce', 15: 'quince',
  16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve', 20: 'veinte',
  21: 'veintiuno', 22: 'veintidós', 23: 'veintitrés', 24: 'veinticuatro', 25: 'veinticinco',
  26: 'veintiséis', 27: 'veintisiete', 28: 'veintiocho', 29: 'veintinueve', 30: 'treinta',
  31: 'treinta y uno', 32: 'treinta y dos', 33: 'treinta y tres', 34: 'treinta y cuatro', 35: 'treinta y cinco',
  36: 'treinta y seis', 37: 'treinta y siete', 38: 'treinta y ocho', 39: 'treinta y nueve', 40: 'cuarenta',
  41: 'cuarenta y uno', 42: 'cuarenta y dos', 43: 'cuarenta y tres', 44: 'cuarenta y cuatro', 45: 'cuarenta y cinco',
  46: 'cuarenta y seis', 47: 'cuarenta y siete', 48: 'cuarenta y ocho', 49: 'cuarenta y nueve', 50: 'cincuenta',
  51: 'cincuenta y uno', 52: 'cincuenta y dos', 53: 'cincuenta y tres', 54: 'cincuenta y cuatro', 55: 'cincuenta y cinco',
  56: 'cincuenta y seis', 57: 'cincuenta y siete', 58: 'cincuenta y ocho', 59: 'cincuenta y nueve', 60: 'sesenta',
  61: 'sesenta y uno', 62: 'sesenta y dos', 63: 'sesenta y tres', 64: 'sesenta y cuatro', 65: 'sesenta y cinco',
  66: 'sesenta y seis', 67: 'sesenta y siete', 68: 'sesenta y ocho', 69: 'sesenta y nueve', 70: 'setenta',
  71: 'setenta y uno', 72: 'setenta y dos', 73: 'setenta y tres', 74: 'setenta y cuatro', 75: 'setenta y cinco',
};

/**
 * Phonetic seseo normalizer:
 * If an OS only has a Castilian Spain voice (es-ES), this converts 'ce', 'ci', 'z'
 * to 'se', 'si', 's' so the Spain engine NEVER lisps/cecea ("españolete") and sounds Latin!
 */
function toLatinSeseo(word: string): string {
  return word
    .replace(/ce/gi, 'se')
    .replace(/ci/gi, 'si')
    .replace(/z/gi, 's')
    .replace(/qu/gi, 'k')
    .replace(/c(?=[aou])/gi, 'k');
}

/**
 * Intelligent voice selector:
 * Prioritizes Venezuelan voices (Paola / Sebastian / es-VE), then Latin American voices (es-419, es-MX, es-CO, es-US),
 * and strictly isolates female vs male voices so Cantadora NEVER plays a male voice.
 */
function findBestVoiceForGender(gender: 'female' | 'male'): { voice: SpeechSynthesisVoice | null; isSpain: boolean } {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return { voice: null, isSpain: false };
  }

  const allVoices = window.speechSynthesis.getVoices();
  const esVoices = allVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));

  if (esVoices.length === 0) {
    return { voice: null, isSpain: false };
  }

  const isSpainVoice = (v: SpeechSynthesisVoice) => {
    const l = (v.lang || '').toLowerCase();
    const n = (v.name || '').toLowerCase();
    return l === 'es-es' || l === 'es_es' || n.includes('spain') || n.includes('españa') || n.includes('castilian');
  };

  const femaleNames = [
    'paola', 'salome', 'dalia', 'sabina', 'paulina', 'mia', 'sofia', 'lucia', 'camila',
    'valentina', 'zira', 'helena', 'laura', 'monica', 'female', 'mujer', 'girl', 'rosa',
    'google', 'elena', 'carmen', 'conchita', 'penelope'
  ];
  const maleNames = [
    'sebastian', 'gonzalo', 'jorge', 'raul', 'carlos', 'pablo', 'diego', 'alvaro',
    'david', 'enrique', 'male', 'hombre', 'boy', 'miguel', 'manuel', 'pedro',
    'fernando', 'andres', 'hector', 'mateo', 'tomas', 'javier', 'luis', 'mario'
  ];

  const hasName = (v: SpeechSynthesisVoice, list: string[]) => {
    const n = v.name.toLowerCase();
    return list.some(k => n.includes(k));
  };

  const latinVoices = esVoices.filter(v => !isSpainVoice(v));
  const spainVoices = esVoices.filter(v => isSpainVoice(v));

  if (gender === 'female') {
    // 1. Venezuelan Female (Paola, es-VE)
    let match = latinVoices.find(v => (v.lang.toLowerCase().includes('ve') || v.name.toLowerCase().includes('venezuela')) && !hasName(v, maleNames));
    if (match) return { voice: match, isSpain: false };

    // 2. Confirmed Latin Female (Salome, Dalia, Sabina, Paulina, etc.)
    match = latinVoices.find(v => hasName(v, femaleNames) && !hasName(v, maleNames));
    if (match) return { voice: match, isSpain: false };

    // 3. Any Latin voice that is NOT explicitly male (e.g. Google español)
    match = latinVoices.find(v => !hasName(v, maleNames));
    if (match) return { voice: match, isSpain: false };

    // 4. Fallback to Spain female (Helena, Laura) only if no Latin female exists
    match = spainVoices.find(v => hasName(v, femaleNames) || !hasName(v, maleNames));
    if (match) return { voice: match, isSpain: true };

    return { voice: esVoices[0] || null, isSpain: false };
  } else {
    // MALE: Prioritize true male voices over any generic fallback!
    // 1. Venezuelan Male (Sebastian, es-VE)
    let match = latinVoices.find(v => (v.lang.toLowerCase().includes('ve') || v.name.toLowerCase().includes('venezuela')) && hasName(v, maleNames));
    if (match) return { voice: match, isSpain: false };

    // 2. Confirmed Latin Male (Gonzalo, Jorge, Raul, Carlos, etc.)
    match = latinVoices.find(v => hasName(v, maleNames) && !hasName(v, femaleNames));
    if (match) return { voice: match, isSpain: false };

    // 3. Confirmed Male in ANY Spanish dialect (e.g. Microsoft Pablo on Windows).
    // With toLatinSeseo(), Pablo speaks pure Venezuelan/Latin seseo with natural deep masculine baritone cords!
    match = spainVoices.find(v => hasName(v, maleNames));
    if (match) return { voice: match, isSpain: true };

    // 4. Any Latin voice that is NOT known to be female (excluding Google español which is female)
    match = latinVoices.find(v => !hasName(v, femaleNames));
    if (match) return { voice: match, isSpain: false };

    // 5. Ultimate fallback: pick any Spain voice that is not female, or first voice
    match = spainVoices.find(v => !hasName(v, femaleNames));
    if (match) return { voice: match, isSpain: true };

    return { voice: spainVoices[0] || esVoices[0] || null, isSpain: true };
  }
}

/**
 * Returns diagnostic name of the active TTS voice engine in the user's browser
 */
export function getActiveVoiceName(gender: 'female' | 'male'): string {
  if (typeof window === 'undefined' || !window.speechSynthesis) return 'Voz del Navegador';
  const { voice } = findBestVoiceForGender(gender);
  return voice ? `${voice.name} (${voice.lang})` : 'Voz predeterminada del sistema';
}

/**
 * Web Speech API synthesizer for vocalizing bingo ball draws ("La Cantadera")
 * - Female: Juvenil, alegre, tono alto (pitch 1.28, rate 1.05)
 * - Male: Grave, barítono, locutor de bombo (pitch 0.68, rate 0.88)
 * - Anti-Españolete: Enforces Latin seseo phonetic spelling so numbers never cecean.
 */
export function speakBingoCallout(
  letter: string, 
  num: number, 
  gender: 'female' | 'male' = 'female'
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();

    const { voice, isSpain } = findBestVoiceForGender(gender);
    const numWord = SPANISH_NUMBERS[num] || String(num);

    // If using a Spain voice or generic voice, apply phonetic seseo so "doce" sounds "dose", "cincuenta" sounds "sinkuenta"
    const spokenNum = isSpain ? toLatinSeseo(numWord) : numWord;

    // Authentic Venezuelan Cantadera phrase:
    // Female uses excited inflection (juvenil), Male uses low chest resonance (ronco y grave)
    const calloutText = gender === 'female'
      ? `¡La ${letter}! ${spokenNum}. ¡${letter} ${spokenNum}!`
      : `La ${letter}... ${spokenNum}. ${letter}, ${spokenNum}.`;

    const utterance = new SpeechSynthesisUtterance(calloutText);

    if (voice) {
      utterance.voice = voice;
    }

    utterance.lang = 'es-419'; // Latin American Spanish tag

    if (gender === 'female') {
      // Femenino juvenil: voz alegre, fresca, ágil
      utterance.pitch = 1.25;
      utterance.rate = 1.02;
    } else {
      // Masculino ronco y grueso: voz grave, barítona, pesada y firme
      const isKnownMale = voice && ['pablo', 'jorge', 'raul', 'carlos', 'diego', 'alvaro', 'david', 'enrique', 'male', 'hombre', 'sebastian', 'gonzalo', 'miguel', 'manuel'].some(k => voice.name.toLowerCase().includes(k));
      utterance.pitch = isKnownMale ? 0.72 : 0.50;
      utterance.rate = 0.82;
    }

    window.speechSynthesis.speak(utterance);
  } catch {}
}
