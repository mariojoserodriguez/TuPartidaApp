import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Room, BingoCard, MarkerType, MARKERS } from '../types';
import { getLetterForNumber, checkNearBingo, checkWinningBingo, getPatternDisplayName } from '../lib/bingoEngine';
import { claimBingo, generatePlayerCards, updateCardMarked } from '../lib/roomService';
import { sounds, speakBingoCallout, triggerHapticMatch, triggerNearBingoVibrate, triggerCanClaimBingoVibrate, triggerInvalidMarkVibrate } from '../lib/audio';
import { triggerVictoryCelebration } from '../lib/celebration';
import { GrainMarker } from './GrainMarker';
import { BingoBall3D } from './BingoBall3D';
import { RecentBallsHistory } from './RecentBallsHistory';
import { WinnerCeremonyModal } from './WinnerCeremonyModal';
import { GameChat } from './chat/GameChat';
import { 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  AlertCircle,
  Volume2,
  VolumeX,
  BellRing,
  Flame,
  ChevronLeft,
  ChevronRight,
  Trophy,
  X
} from 'lucide-react';

interface BingoPlayerViewProps {
  room: Room;
  cards: BingoCard[];
  userId: string;
  userName: string;
  selectedMarker: MarkerType;
  onLeave: () => void;
}

export const BingoPlayerView: React.FC<BingoPlayerViewProps> = ({
  room,
  cards,
  userId,
  userName,
  selectedMarker,
  onLeave,
}) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const marksStorageKey = `tupartida_marks_${room.id}_r${room.currentRound}`;

  // Persistent marks: restore from localStorage so grains are NEVER lost on reload or re-entering
  const [markedState, setMarkedState] = useState<Record<string, boolean[]>>(() => {
    try {
      const raw = localStorage.getItem(`tupartida_marks_${room.id}_r${room.currentRound}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  });

  const [claimStatus, setClaimStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [matchNotification, setMatchNotification] = useState<string | null>(null);
  const [showCeremonyModal, setShowCeremonyModal] = useState(true);

  // Speaker / Voice state on player side
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    return localStorage.getItem('tupartida_player_voice') !== 'false';
  });

  const marker = MARKERS[selectedMarker];
  const drawnSet = new Set(room.drawnNumbers);
  const lastNumber = room.lastDrawnNumber;
  const lastLetter = lastNumber ? getLetterForNumber(lastNumber) : null;

  // Active card
  const activeCard = cards[activeCardIndex] || cards[0];

  // Winning pattern status for active card (Line, 4 Corners, Full House)
  const winningStatus = useMemo(() => {
    if (!activeCard) return { isWinner: false, winningCells: [] as number[] };
    return checkWinningBingo(activeCard.matrix, room.drawnNumbers, room.config.winningPattern);
  }, [activeCard, room.drawnNumbers, room.config.winningPattern]);

  const winningCellsSet = useMemo(() => {
    return new Set(winningStatus.winningCells || []);
  }, [winningStatus.winningCells]);

  // Near-Bingo detection for the active card
  const nearStatus = useMemo(() => {
    if (!activeCard || winningStatus.isWinner) return { isNear: false, missingCount: 0, missingNumbers: [] };
    return checkNearBingo(activeCard.matrix, room.drawnNumbers, room.config.winningPattern);
  }, [activeCard, room.drawnNumbers, room.config.winningPattern, winningStatus.isWinner]);

  // Trigger suspense sound and vibration when player gets 1 ball away from winning ("A tiro de BINGO")
  const nearFiredRef = useRef<boolean>(false);
  useEffect(() => {
    if (nearStatus.isNear && !nearFiredRef.current && room.status !== 'FINISHED') {
      nearFiredRef.current = true;
      sounds.playNearBingoSound();
      triggerNearBingoVibrate();
    } else if (!nearStatus.isNear) {
      nearFiredRef.current = false;
    }
  }, [nearStatus.isNear, room.status]);

  // Vibrates player's phone when they complete the winning pattern and can press ¡CANTAR BINGO!
  const winPatternFiredRef = useRef<boolean>(false);
  useEffect(() => {
    if (winningStatus.isWinner && !winPatternFiredRef.current && room.status !== 'FINISHED') {
      winPatternFiredRef.current = true;
      triggerCanClaimBingoVibrate();
    } else if (!winningStatus.isWinner) {
      winPatternFiredRef.current = false;
    }
  }, [winningStatus.isWinner, room.status]);

  // Initialize marked array from local cache, Firestore card, or fallback
  const getCardMarks = (cardId: string): boolean[] => {
    if (markedState[cardId]) return markedState[cardId];
    const target = cards.find(c => c.id === cardId) || activeCard;
    if (target && target.marked && target.marked.length === 25) {
      return target.marked;
    }
    const initial = Array(25).fill(false);
    initial[12] = true; // Center free (index 12)
    return initial;
  };

  const toggleMark = (cardId: string, idx: number) => {
    if (idx === 12) return; // Free center
    sounds.playBeanClick();

    const targetCard = cards.find(c => c.id === cardId) || activeCard;
    const clickedVal = targetCard?.matrix[idx];
    if (clickedVal && clickedVal === room.lastDrawnNumber) {
      setMatchNotification(null);
    }

    const currentMarks = getCardMarks(cardId);
    const willBeMarked = !currentMarks[idx];

    // If player places a grain on a number that HAS NOT been drawn yet:
    // double-buzz warning vibration so they notice immediately!
    if (willBeMarked && clickedVal && !drawnSet.has(clickedVal)) {
      triggerInvalidMarkVibrate();
    }

    const nextMarks = [...currentMarks];
    nextMarks[idx] = willBeMarked;

    setMarkedState((prev) => {
      const updated = { ...prev, [cardId]: nextMarks };
      try {
        localStorage.setItem(marksStorageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Sync to Firestore in background
    updateCardMarked(room.id, cardId, nextMarks);
  };

  const toggleVoice = () => {
    const nextVal = !voiceEnabled;
    setVoiceEnabled(nextVal);
    localStorage.setItem('tupartida_player_voice', String(nextVal));
  };

  // Reset local marks and open ceremony modal when new round begins
  useEffect(() => {
    setMarkedState({});
    try {
      localStorage.removeItem(marksStorageKey);
    } catch {}
    setClaimStatus(null);
    setShowCeremonyModal(true);
    nearFiredRef.current = false;
    winPatternFiredRef.current = false;
  }, [room.currentRound]);

  // When room status becomes FINISHED, show the ceremony modal & fire grand celebration across all phones
  const finishedCelebratedRef = useRef<boolean>(false);
  useEffect(() => {
    if (room.status === 'FINISHED') {
      setShowCeremonyModal(true);
      if (!finishedCelebratedRef.current) {
        finishedCelebratedRef.current = true;
        triggerVictoryCelebration();
      }
    } else {
      finishedCelebratedRef.current = false;
    }
  }, [room.status]);

  // Sound, voice callout & match gestures when host draws a new ball
  const prevLastNumberRef = useRef<number | undefined>(room.lastDrawnNumber);
  useEffect(() => {
    const num = room.lastDrawnNumber;
    if (num && num !== prevLastNumberRef.current) {
      prevLastNumberRef.current = num;
      const letter = getLetterForNumber(num);

      // Check which cards have this number
      const matchingCards = cards
        .map((c, idx) => ({ c, idx }))
        .filter(item => item.c.matrix?.includes(num));

      if (matchingCards.length > 0) {
        // Cheerful bell alert and haptic vibration
        sounds.playMatchAlert();
        triggerHapticMatch();

        const cardLabels = matchingCards.map(m => `Cartón #${m.idx + 1}`).join(', ');
        setMatchNotification(`¡Salió el ${letter}-${num} en tu ${cardLabels}! ✨`);
        setTimeout(() => setMatchNotification(null), 4500);
      } else {
        sounds.playBallDrop();
      }

      // Voice callout on player side if enabled
      if (voiceEnabled) {
        speakBingoCallout(letter, num, room.config.callerVoiceGender || 'female');
      }
    }
  }, [room.lastDrawnNumber, cards, voiceEnabled, room.config.callerVoiceGender]);

  const handleClaim = async () => {
    if (!activeCard) return;
    setIsClaiming(true);
    setClaimStatus(null);

    const result = await claimBingo(room, activeCard, userName);
    setClaimStatus(result);
    setIsClaiming(false);

    if (result.success) {
      triggerVictoryCelebration();
      setShowCeremonyModal(true);
    }
  };

  const handleAddCard = async () => {
    if (cards.length >= 4) return;
    await generatePlayerCards(room.id, userId, userName, 1);
    setActiveCardIndex(cards.length);
  };

  const handlePrevCard = () => {
    if (cards.length <= 1) return;
    setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleNextCard = () => {
    if (cards.length <= 1) return;
    setActiveCardIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col gap-3 pb-36">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between bg-[#171f33] border border-white/10 rounded-2xl p-3 shadow-md">
        <button 
          onClick={onLeave}
          className="flex items-center gap-1 text-xs text-[#c7c4d8] hover:text-white font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Salir</span>
        </button>

        <div className="text-center">
          <div className="text-xs font-bold text-white font-['Outfit']">
            {room.title}
          </div>
          <span className="text-[10px] text-indigo-300 font-semibold">
            Ronda {room.currentRound} • {getPatternDisplayName(room.config.winningPattern)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Speaker Voice Toggle for Player */}
          <button
            onClick={toggleVoice}
            className={`p-1.5 rounded-xl border transition-colors ${
              voiceEnabled 
                ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-300' 
                : 'bg-white/5 border-white/10 text-zinc-500'
            }`}
            title={voiceEnabled ? 'Voz de la Cantadera activada' : 'Voz silenciada'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* PIN */}
          <div className="flex items-center gap-1 text-xs bg-[#0b1326] px-2.5 py-1 rounded-xl border border-white/5">
            <span className="text-zinc-400">PIN:</span>
            <span className="font-bold text-white font-['Space_Grotesk']">{room.pinCode}</span>
          </div>
        </div>
      </div>

      {/* 1. Unified Dashboard: Latest 3D Ball + Sequential History in ONE Single Compact Card */}
      <div className="bg-gradient-to-r from-indigo-950 via-[#171f33] to-[#0b1326] border border-indigo-500/30 rounded-3xl p-2.5 sm:p-3 shadow-xl flex items-center gap-3">
        {/* Left: Latest 3D Ball */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div key={lastNumber || 'waiting'} className="animate-ball-pop flex items-center justify-center">
            {lastNumber ? (
              <BingoBall3D 
                number={lastNumber} 
                letter={lastLetter || undefined} 
                size="md" 
                isLatest={true} 
              />
            ) : (
              <div className="w-13 h-13 rounded-2xl bg-indigo-950/80 border-2 border-dashed border-indigo-500/40 flex items-center justify-center text-indigo-300 text-[10px] text-center p-1">
                Esperando...
              </div>
            )}
          </div>
          <span className="text-[9px] font-black uppercase text-amber-300 mt-0.5 tracking-wider">
            Última Bola
          </span>
        </div>

        {/* Right: History Sequence + Metadata Header */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#c7c4d8]">
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Bolas: <strong className="text-indigo-300 font-['Space_Grotesk']">{room.drawnNumbers.length}/75</strong></span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-300 bg-[#0b1326]/60 px-2 py-0.5 rounded-full border border-white/5">
              <GrainMarker type={selectedMarker} size="sm" />
              <span className="hidden sm:inline font-semibold">{marker.name}</span>
            </div>
          </div>

          {/* Sequential scrollable balls (Excluding the latest ball to avoid duplication) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {room.drawnNumbers.length <= 1 ? (
              <span className="text-[10px] text-zinc-500 italic py-1">
                {room.drawnNumbers.length === 1 ? 'Primera bola de la ronda.' : 'Aún no se han sacado bolas en esta ronda.'}
              </span>
            ) : (
              [...room.drawnNumbers].reverse().slice(1).map((num, i) => {
                return (
                  <div key={`${num}_${i}`} className="flex-shrink-0">
                    <BingoBall3D 
                      number={num} 
                      size="sm" 
                      isLatest={false} 
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 2. Reserved Fixed-Height Notification Slot (Zero Layout Shift) */}
      <div className="w-full h-11 flex-shrink-0 flex items-center">
        {claimStatus ? (
          <div className={`w-full h-full px-3 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-md ${
            claimStatus.success 
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200'
              : 'bg-rose-500/20 border border-rose-500/50 text-rose-200'
          }`}>
            <div className="flex items-center gap-2 truncate">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{claimStatus.message}</span>
            </div>
            <button 
              type="button"
              onClick={() => setClaimStatus(null)}
              className="p-1 hover:bg-white/10 rounded-md transition-colors flex-shrink-0"
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : winningStatus.isWinner && room.status !== 'FINISHED' ? (
          <div className="w-full h-full px-3 bg-gradient-to-r from-amber-500/30 via-yellow-400/30 to-amber-500/30 border-2 border-amber-400 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin flex-shrink-0" />
              <span className="text-xs font-black text-amber-100 font-['Outfit'] tracking-wider uppercase truncate">
                ¡PATRÓN GANADOR COMPLETADO! 🎉
              </span>
            </div>
            <span className="text-[10px] text-amber-300 font-black shrink-0 uppercase bg-amber-500/30 px-2 py-0.5 rounded-full border border-amber-400/50">
              ¡Canta abajo!
            </span>
          </div>
        ) : nearStatus.isNear && room.status !== 'FINISHED' ? (
          <div className="w-full h-full px-3 bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-amber-500/20 border border-amber-400/80 rounded-xl shadow-[0_0_18px_rgba(245,158,11,0.35)] flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2 min-w-0">
              <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
              <span className="text-xs font-black text-white font-['Outfit'] tracking-wide truncate">
                ¡A 1 NÚMERO DE GANAR! 🔥
                {nearStatus.missingNumbers.length > 0 && (
                  <span className="text-amber-300 ml-1 font-['Space_Grotesk'] font-bold">
                    (Falta: {nearStatus.missingNumbers.map(n => `${getLetterForNumber(n)}-${n}`).join(', ')})
                  </span>
                )}
              </span>
            </div>
          </div>
        ) : matchNotification ? (
          <div className="w-full h-full px-3 bg-gradient-to-r from-emerald-500/25 via-emerald-600/20 to-teal-500/25 border border-emerald-400/80 rounded-xl shadow-[0_0_18px_rgba(16,185,129,0.35)] flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2 min-w-0">
              <BellRing className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-bounce" />
              <span className="text-xs font-black text-white font-['Outfit'] tracking-wide truncate">
                {matchNotification}
              </span>
            </div>
            <button 
              type="button"
              onClick={() => setMatchNotification(null)}
              className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-md transition-colors flex-shrink-0"
              title="Cerrar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-full h-full px-3 rounded-xl border border-white/5 bg-[#131b2e]/50 flex items-center justify-between text-xs text-[#c7c4d8]">
            <div className="flex items-center gap-2 min-w-0">
              <Trophy className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />
              <span className="truncate text-slate-300">
                Ronda {room.currentRound}: <strong className="text-amber-300 font-['Outfit'] font-black">{getPatternDisplayName(room.config.winningPattern)}</strong>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
              <span>Atento al bombo</span>
            </span>
          </div>
        )}
      </div>

      {/* 3. Card Switcher Tabs */}
      {cards.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {cards.map((c, idx) => {
            const isCurrentActive = activeCardIndex === idx;
            const numIdx = lastNumber ? c.matrix?.indexOf(lastNumber) : -1;
            const cMarks = getCardMarks(c.id);
            // Only alerts if the card has the number AND it has NOT been marked yet!
            const cardNeedsMarking = numIdx !== -1 && !cMarks[numIdx];

            return (
              <button
                key={c.id || idx}
                onClick={() => setActiveCardIndex(idx)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 relative ${
                  isCurrentActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-[#171f33] text-[#c7c4d8] border border-white/5 hover:border-white/20'
                } ${cardNeedsMarking && !isCurrentActive ? 'border-emerald-400 ring-2 ring-emerald-400/80 animate-pulse text-emerald-300 font-black' : ''}`}
              >
                <span>Cartón #{idx + 1}</span>
                {cardNeedsMarking && !isCurrentActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            );
          })}
          {cards.length < 4 && (
            <button
              onClick={handleAddCard}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo</span>
            </button>
          )}
        </div>
      )}

      {/* The 5x5 BINGO Card with Side Navigation Arrows & Organic Grain Markers */}
      {activeCard ? (
        <div className="flex flex-col gap-2 max-w-sm sm:max-w-md mx-auto w-full relative px-7 sm:px-9">
          <div className="relative flex items-center justify-center">
            {/* Left Navigation Arrow - Separated from the card */}
            {cards.length > 1 && (
              <button
                type="button"
                onClick={handlePrevCard}
                aria-label="Cartón anterior"
                className="absolute -left-1 sm:-left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#171f33] hover:bg-indigo-600 border border-white/20 hover:border-indigo-400 text-white shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                title="Ir al cartón anterior"
              >
                <ChevronLeft className="w-5 h-5 text-indigo-200" />
              </button>
            )}

            {/* 5x5 Card Container */}
            <div className="bg-[#171f33] border border-white/10 rounded-3xl p-3 shadow-2xl flex flex-col gap-2 w-full">
              {/* Header B - I - N - G - O */}
              <div className="grid grid-cols-5 gap-1.5 text-center font-['Outfit'] font-black text-lg text-white">
                <div className="py-1 rounded-xl bg-rose-500/30 text-rose-300">B</div>
                <div className="py-1 rounded-xl bg-amber-500/30 text-amber-300">I</div>
                <div className="py-1 rounded-xl bg-indigo-500/30 text-indigo-300">N</div>
                <div className="py-1 rounded-xl bg-emerald-500/30 text-emerald-300">G</div>
                <div className="py-1 rounded-xl bg-sky-500/30 text-sky-300">O</div>
              </div>

              {/* 5x5 Grid Cells */}
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 25 }, (_, idx) => {
                  const isCenter = idx === 12;
                  const val = activeCard.matrix[idx];
                  const marks = getCardMarks(activeCard.id);
                  const isMarked = marks[idx];
                  const wasDrawn = isCenter || drawnSet.has(val);
                  const isLatestMatch = !isCenter && val === lastNumber && !isMarked;
                  const isWinningCell = winningCellsSet.has(idx);
                  const isInvalidMark = isMarked && !wasDrawn; // Marked but has NOT come out yet!

                  return (
                    <button
                      key={idx}
                      onClick={() => toggleMark(activeCard.id, idx)}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative font-['Space_Grotesk'] font-bold transition-all active:scale-95 ${
                        isWinningCell
                          ? 'bg-gradient-to-br from-amber-500/50 via-yellow-400/40 to-amber-600/50 border-2 border-amber-400 text-amber-100 scale-105 z-20 shadow-[0_0_22px_rgba(251,191,36,0.9)] animate-pulse'
                          : isCenter
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-amber-300 text-xs shadow-md'
                          : isInvalidMark
                          ? 'bg-[#2b120c] border-2 border-orange-500 text-orange-200 shadow-[0_0_18px_rgba(249,115,22,0.8)] ring-2 ring-orange-500/30'
                          : isMarked
                          ? 'bg-[#222a3d] border-2 border-indigo-400 text-white shadow-inner'
                          : isLatestMatch
                          ? 'bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300 animate-match-glow z-10'
                          : wasDrawn
                          ? 'bg-[#131b2e] border border-emerald-500/40 text-emerald-200'
                          : 'bg-[#0b1326] border border-white/5 text-[#dae2fd] hover:border-white/20'
                      }`}
                    >
                      {isCenter ? (
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          ★ LIBRE
                        </span>
                      ) : (
                        <>
                          <span className={`text-base font-bold ${isMarked ? 'opacity-30' : ''}`}>
                            {val}
                          </span>

                          {/* Organic Bean / Grain Marker Overlay with cell-specific seed for unique angle & jitter */}
                          {isMarked && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <GrainMarker 
                                type={selectedMarker} 
                                size="md" 
                                seed={`${activeCard.id}_${idx}`}
                                className="transform hover:scale-110 transition-transform" 
                              />
                            </div>
                          )}

                          {/* Warning badge if grain was placed on a number that hasn't been drawn */}
                          {isInvalidMark && (
                            <span 
                              className="absolute -top-1 -right-1 text-[8px] bg-orange-500 text-black px-1.5 py-0.2 rounded-full font-black uppercase shadow-md animate-bounce"
                              title="¡Atención! Este número aún no ha salido en el bombo"
                            >
                              ¡Ojo!
                            </span>
                          )}

                          {/* Flashing badge on the newly drawn matching number */}
                          {isLatestMatch && (
                            <span className="absolute -top-1.5 -right-1 text-[8px] bg-emerald-400 text-black px-1 rounded-full font-black uppercase shadow-sm">
                              ¡Pon!
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Navigation Arrow - Separated from the card */}
            {cards.length > 1 && (
              <button
                type="button"
                onClick={handleNextCard}
                aria-label="Siguiente cartón"
                className="absolute -right-1 sm:-right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#171f33] hover:bg-indigo-600 border border-white/20 hover:border-indigo-400 text-white shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                title="Ir al siguiente cartón"
              >
                <ChevronRight className="w-5 h-5 text-indigo-200" />
              </button>
            )}
          </div>

          {/* Marks Progress Legend Below Card: (Llevas X/25 • Faltan Y para cartón lleno) */}
          {(() => {
            const marks = getCardMarks(activeCard.id);
            const markedCount = marks.filter(Boolean).length;
            const remainingCount = 25 - markedCount;
            return (
              <div className="flex items-center justify-center text-center mt-1">
                <span className="text-xs text-[#c7c4d8] bg-[#171f33]/90 border border-white/10 px-3.5 py-1.5 rounded-full font-medium shadow-md">
                  (Llevas <strong className="text-amber-300 font-['Space_Grotesk'] font-bold">{markedCount}/25</strong> • Faltan <strong className="text-indigo-300 font-['Space_Grotesk'] font-bold">{remainingCount}</strong> para cartón lleno)
                </span>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xs text-[#c7c4d8]">No tienes cartones aún en esta sala.</p>
          <button
            onClick={handleAddCard}
            className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Generar Mi Primer Cartón
          </button>
        </div>
      )}

      {/* Prominent CANTAR BINGO Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#060e20]/95 backdrop-blur-md border-t border-white/10 z-40 max-w-lg mx-auto">
        <button
          onClick={handleClaim}
          disabled={isClaiming || room.status === 'FINISHED'}
          className={`w-full py-3.5 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 uppercase tracking-wider font-['Outfit'] ${
            winningStatus.isWinner
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-black shadow-[0_0_35px_rgba(245,158,11,0.9)] scale-[1.02] animate-bounce ring-4 ring-amber-300/50'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95'
          }`}
        >
          <Sparkles className="w-5 h-5 fill-current" />
          <span>¡CANTAR BINGO!</span>
        </button>
      </div>

      {/* Winner Ceremony Modal for Players */}
      {room.status === 'FINISHED' && showCeremonyModal && (
        <WinnerCeremonyModal
          room={room}
          isHost={false}
          onNextRound={() => {}}
          onClose={() => setShowCeremonyModal(false)}
        />
      )}

      {/* Real-time Room Chat for Players */}
      <GameChat
        roomId={room.id}
        userId={userId}
        userName={userName}
        isHost={false}
        chatEnabled={room.config.chatEnabled !== false}
        voiceNotesEnabled={room.config.voiceNotesEnabled !== false}
      />
    </div>
  );
};
