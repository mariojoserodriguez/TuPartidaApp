import React, { useState } from 'react';
import { Room, BingoCard, MarkerType, MARKERS } from '../types';
import { getLetterForNumber } from '../lib/bingoEngine';
import { claimBingo, generatePlayerCards } from '../lib/roomService';
import { sounds } from '../lib/audio';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Sparkles, 
  Trophy, 
  Plus, 
  AlertCircle,
  Volume2
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
  const [markedState, setMarkedState] = useState<Record<string, boolean[][]>>({});
  const [claimStatus, setClaimStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const marker = MARKERS[selectedMarker];
  const drawnSet = new Set(room.drawnNumbers);
  const lastNumber = room.lastDrawnNumber;
  const lastLetter = lastNumber ? getLetterForNumber(lastNumber) : null;

  // Active card
  const activeCard = cards[activeCardIndex] || cards[0];

  // Initialize marked matrix if not in state
  const getCardMarks = (cardId: string): boolean[][] => {
    if (markedState[cardId]) return markedState[cardId];
    const initial = Array(5).fill(null).map(() => Array(5).fill(false));
    initial[2][2] = true; // Center free
    return initial;
  };

  const toggleMark = (cardId: string, row: number, col: number) => {
    if (row === 2 && col === 2) return; // Free center
    sounds.playBeanClick();

    setMarkedState((prev) => {
      const current = prev[cardId] ? prev[cardId].map(r => [...r]) : getCardMarks(cardId).map(r => [...r]);
      current[row][col] = !current[row][col];
      return { ...prev, [cardId]: current };
    });
  };

  const handleClaim = async () => {
    if (!activeCard) return;
    setIsClaiming(true);
    setClaimStatus(null);

    const result = await claimBingo(room, activeCard);
    setClaimStatus(result);
    setIsClaiming(false);

    if (result.success) {
      sounds.playBingoFanfare();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  };

  const handleAddCard = async () => {
    if (cards.length >= 4) return;
    await generatePlayerCards(room.id, userId, userName, 1);
    setActiveCardIndex(cards.length);
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between bg-[#171f33] border border-white/10 rounded-2xl p-3 shadow-md">
        <button 
          onClick={onLeave}
          className="flex items-center gap-1 text-xs text-[#c7c4d8] hover:text-white font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Salir</span>
        </button>

        <div className="text-center">
          <div className="text-xs font-bold text-white font-['Outfit']">
            {room.title}
          </div>
          <span className="text-[10px] text-indigo-300 font-semibold">
            Ronda {room.currentRound} • {room.config.winningPattern}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs bg-[#0b1326] px-2.5 py-1 rounded-xl border border-white/5">
          <span className="text-zinc-400">PIN:</span>
          <span className="font-bold text-white font-['Space_Grotesk']">{room.pinCode}</span>
        </div>
      </div>

      {/* Live Ball Extracted from the Bombo */}
      <div className="bg-gradient-to-r from-indigo-950 via-[#171f33] to-indigo-950 border border-indigo-500/30 rounded-3xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 border-2 border-white/20 shadow-[0_0_20px_rgba(79,70,229,0.5)] flex flex-col items-center justify-center text-white">
            {lastNumber ? (
              <>
                <span className="text-[10px] font-black text-amber-300 tracking-wider">
                  {lastLetter}
                </span>
                <span className="text-2xl font-black font-['Space_Grotesk'] leading-none">
                  {lastNumber}
                </span>
              </>
            ) : (
              <span className="text-[10px] text-center text-indigo-200">
                Esperando...
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-white">Última Bola Cantada</span>
            </div>
            <p className="text-[11px] text-[#c7c4d8] mt-0.5">
              {room.drawnNumbers.length} balotas cantadas en la ronda
            </p>
          </div>
        </div>

        {/* Selected Bean Marker indicator */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-[#c7c4d8]">Marcador:</span>
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <span>{marker.emoji}</span>
            <span className="hidden sm:inline">{marker.name}</span>
          </span>
        </div>
      </div>

      {/* Winner Banner if Finished */}
      {room.status === 'FINISHED' && (
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-2 border-amber-400 rounded-3xl p-4 text-center shadow-2xl flex flex-col items-center gap-2 animate-bounce">
          <Trophy className="w-8 h-8 text-amber-400" />
          <h3 className="text-lg font-black text-white font-['Outfit']">
            ¡{room.winnerUserName} Cantó BINGO!
          </h3>
          <p className="text-xs text-[#c7c4d8]">
            El anfitrión reiniciará la siguiente ronda en breve.
          </p>
        </div>
      )}

      {/* Claim Status Notification */}
      {claimStatus && (
        <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
          claimStatus.success 
            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
            : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{claimStatus.message}</span>
        </div>
      )}

      {/* Card Switcher (if user has multiple cards) */}
      {cards.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {cards.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setActiveCardIndex(idx)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeCardIndex === idx
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-[#171f33] text-[#c7c4d8] border border-white/5'
              }`}
            >
              <span>Cartón #{c.cardIndex}</span>
            </button>
          ))}
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

      {/* The 5x5 BINGO Card */}
      {activeCard ? (
        <div className="bg-[#171f33] border border-white/10 rounded-3xl p-3 shadow-2xl flex flex-col gap-2 max-w-sm mx-auto w-full">
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
            {activeCard.matrix.map((row, rIdx) =>
              row.map((val, cIdx) => {
                const isCenter = rIdx === 2 && cIdx === 2;
                const marks = getCardMarks(activeCard.id);
                const isMarked = marks[rIdx][cIdx];
                const wasDrawn = isCenter || drawnSet.has(val);

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => toggleMark(activeCard.id, rIdx, cIdx)}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative font-['Space_Grotesk'] font-bold transition-all active:scale-95 ${
                      isCenter
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-amber-300 text-xs shadow-md'
                        : isMarked
                        ? 'bg-[#222a3d] border-2 border-indigo-400 text-white shadow-inner'
                        : wasDrawn
                        ? 'bg-[#131b2e] border border-emerald-500/40 text-emerald-200 animate-pulse'
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

                        {/* Bean / Marker Overlay */}
                        {isMarked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl drop-shadow-md select-none transform hover:scale-110 transition-transform">
                              {marker.emoji}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })
            )}
          </div>
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
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-black text-base shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider font-['Outfit']"
        >
          <Sparkles className="w-5 h-5 fill-current" />
          <span>¡CANTAR BINGO!</span>
        </button>
      </div>
    </div>
  );
};
