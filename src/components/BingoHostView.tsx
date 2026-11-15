import React, { useState, useEffect } from 'react';
import { Room } from '../types';
import { drawNextBall } from '../lib/roomService';
import { getLetterForNumber } from '../lib/bingoEngine';
import { sounds } from '../lib/audio';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  Share2, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Trophy,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface BingoHostViewProps {
  room: Room;
  onLeave: () => void;
  onNextRound: () => void;
}

export const BingoHostView: React.FC<BingoHostViewProps> = ({
  room,
  onLeave,
  onNextRound,
}) => {
  const [isAutoDrawing, setIsAutoDrawing] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const lastNumber = room.lastDrawnNumber;
  const lastLetter = lastNumber ? getLetterForNumber(lastNumber) : null;
  const drawnSet = new Set(room.drawnNumbers);

  // Announce ball via SpeechSynthesis
  const speakNumber = (letter: string, num: number) => {
    if (!speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${letter}... ${num}`);
      utterance.lang = 'es-LA';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const handleManualDraw = async () => {
    sounds.playBallDrop();
    const num = await drawNextBall(room);
    if (num) {
      const letter = getLetterForNumber(num);
      speakNumber(letter, num);
    }
  };

  // Auto-drawing timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isAutoDrawing && room.status !== 'FINISHED') {
      timer = setInterval(async () => {
        sounds.playBallDrop();
        const num = await drawNextBall(room);
        if (num) {
          const letter = getLetterForNumber(num);
          speakNumber(letter, num);
        } else {
          setIsAutoDrawing(false);
        }
      }, 7000); // 7s between draws
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoDrawing, room]);

  // Confetti when BINGO is won
  useEffect(() => {
    if (room.status === 'FINISHED' && room.winnerUserName) {
      sounds.playBingoFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [room.status, room.winnerUserName]);

  // WhatsApp share link
  const handleShareWhatsApp = () => {
    const url = `${window.location.origin}?pin=${room.pinCode}`;
    const text = `¡Únete a la partida de Bingo en Vivo! 🎱\nSala: ${room.title}\nCódigo PIN: *${room.pinCode}*\nEntra a jugar aquí: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(room.pinCode);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Top Bar with PIN & Controls */}
      <div className="flex items-center justify-between bg-[#171f33] border border-white/10 rounded-2xl p-3 shadow-md">
        <button 
          onClick={onLeave}
          className="flex items-center gap-1 text-xs text-[#c7c4d8] hover:text-white font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Salir</span>
        </button>

        {/* PIN Code Box */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1326] border border-indigo-500/30 text-white font-['Space_Grotesk'] text-sm font-bold tracking-widest hover:border-indigo-400"
          >
            <span>PIN: {room.pinCode}</span>
            <span className="text-[10px] text-indigo-300 font-sans font-normal">
              {copiedLink ? '¡Copiado!' : 'Copiar'}
            </span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="p-2 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/50"
            title="Compartir por WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Voice toggle */}
        <button
          onClick={() => setSpeechEnabled(!speechEnabled)}
          className={`p-2 rounded-xl border transition-colors ${
            speechEnabled 
              ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-300' 
              : 'bg-white/5 border-white/10 text-zinc-500'
          }`}
          title={speechEnabled ? 'Voz activada' : 'Voz silenciada'}
        >
          {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Winner Alert Modal */}
      {room.status === 'FINISHED' && (
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-2 border-amber-400 rounded-3xl p-5 text-center shadow-2xl flex flex-col items-center gap-3 animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-black flex items-center justify-center text-3xl shadow-lg shadow-amber-400/40">
            🏆
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">
              ¡TENEMOS GANADOR DE LA RONDA!
            </span>
            <h2 className="text-2xl font-black text-white font-['Outfit']">
              {room.winnerUserName || 'Un afortunado jugador'}
            </h2>
            <p className="text-xs text-[#c7c4d8] mt-0.5">
              ¡Ha cantado y verificado BINGO con éxito!
            </p>
          </div>
          <button
            onClick={onNextRound}
            className="mt-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/30 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Iniciar Siguiente Ronda</span>
          </button>
        </div>
      )}

      {/* Large Bombo / Current Ball Display */}
      <div className="bg-gradient-to-b from-[#171f33] to-[#0b1326] border border-white/10 rounded-3xl p-6 text-center shadow-xl flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-3 left-4 text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
          Ronda {room.currentRound} • {room.config.winningPattern}
        </div>
        <div className="absolute top-3 right-4 text-[11px] text-[#c7c4d8]">
          {room.drawnNumbers.length} / 75 Bolas
        </div>

        {/* Ball Sphere Visual */}
        <div className="my-3 relative flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-900 border-4 border-white/20 shadow-[0_0_40px_rgba(79,70,229,0.5)] flex flex-col items-center justify-center text-white">
            {lastNumber ? (
              <>
                <span className="text-xs font-black tracking-widest text-amber-300">
                  {lastLetter}
                </span>
                <span className="text-5xl font-black font-['Space_Grotesk'] leading-none">
                  {lastNumber}
                </span>
              </>
            ) : (
              <span className="text-xs text-indigo-200 font-semibold">
                ¡Listo para girar!
              </span>
            )}
          </div>
        </div>

        {/* Ball Drawing Action Buttons */}
        <div className="flex gap-3 w-full max-w-xs mt-2">
          <button
            onClick={handleManualDraw}
            disabled={room.status === 'FINISHED' || room.drawnNumbers.length >= 75}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>¡Sacar Bola!</span>
          </button>

          <button
            onClick={() => setIsAutoDrawing(!isAutoDrawing)}
            disabled={room.status === 'FINISHED' || room.drawnNumbers.length >= 75}
            className={`px-4 py-3 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
              isAutoDrawing
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
          >
            {isAutoDrawing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isAutoDrawing ? 'Pausar' : 'Automático'}</span>
          </button>
        </div>
      </div>

      {/* 1-75 Master Board Grid */}
      <div className="bg-[#171f33] border border-white/10 rounded-3xl p-4 shadow-lg flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#c7c4d8] px-1">
          <span>Tablero Maestro (1-75)</span>
          <span className="text-indigo-300">
            {75 - room.drawnNumbers.length} restantes
          </span>
        </div>

        {/* Rows B - I - N - G - O */}
        {(['B', 'I', 'N', 'G', 'O'] as const).map((letter, rowIdx) => {
          const rowStart = rowIdx * 15 + 1;
          const rowNumbers = Array.from({ length: 15 }, (_, i) => rowStart + i);

          return (
            <div key={letter} className="flex items-center gap-1">
              {/* Row Header Letter */}
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {letter}
              </div>

              {/* 15 numbers per row */}
              <div className="grid grid-cols-15 gap-1 flex-1">
                {rowNumbers.map((num) => {
                  const isDrawn = drawnSet.has(num);
                  const isLast = num === lastNumber;

                  return (
                    <div
                      key={num}
                      className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-bold font-['Space_Grotesk'] transition-all ${
                        isLast
                          ? 'bg-amber-400 text-black shadow-[0_0_10px_#facc15] font-black scale-110 z-10'
                          : isDrawn
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-[#0b1326] text-zinc-600 border border-white/5'
                      }`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
