import React, { useState } from 'react';
import { Room, BingoWinningPattern } from '../types';
import { getPatternDisplayName, getDefaultPatternForRound } from '../lib/bingoEngine';
import { shareInvite, openWhatsAppDirect } from '../lib/share';
import { 
  Trophy, 
  CheckCircle, 
  Share2, 
  RotateCcw, 
  Flag,
  Sparkles,
  Layers,
  Clock,
  Copy,
  Check
} from 'lucide-react';

interface WinnerCeremonyModalProps {
  room: Room;
  isHost: boolean;
  onNextRound: (pattern?: BingoWinningPattern) => void;
  onClose: () => void;
  onFinishGame?: () => void;
}

export const WinnerCeremonyModal: React.FC<WinnerCeremonyModalProps> = ({
  room,
  isHost,
  onNextRound,
  onClose,
  onFinishGame,
}) => {
  const [copied, setCopied] = useState(false);
  const nextRoundNumber = room.currentRound + 1;
  const [nextPattern, setNextPattern] = useState<BingoWinningPattern>(
    getDefaultPatternForRound(nextRoundNumber)
  );

  const winnerName = room.winnerUserName || 'Jugador Afortunado';
  const patternName = getPatternDisplayName(room.config.winningPattern);

  const shareText = `🏆 *¡HAY GANADOR DE BINGO EN TUPARTIDA!* 🎱\n` +
    `Sala: *${room.title}*\n` +
    `Ganador: *${winnerName}* 👏\n` +
    `Ronda: ${room.currentRound} (${patternName})\n` +
    `Total Bolas Cantadas: ${room.drawnNumbers.length} de 75\n` +
    `¡Felicitaciones al campeón! 🎉`;

  const shareUrl = `${window.location.origin}?pin=${room.pinCode}`;

  const handleShare = async () => {
    const res = await shareInvite({
      title: `¡Ganador de Bingo en TuPartida: ${winnerName}!`,
      text: shareText,
      url: shareUrl,
    });

    if (res.method === 'clipboard' && res.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsApp = () => {
    openWhatsAppDirect(`${shareText}\n${shareUrl}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-[#171f33] via-[#0b1326] to-[#060e20] border-2 border-amber-400/60 rounded-3xl p-5 shadow-[0_0_50px_rgba(251,191,36,0.25)] flex flex-col gap-4 relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Badge */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 font-['Space_Grotesk']">
              ¡BINGO VERIFICADO!
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        {/* Winner Hero Card */}
        <div className="flex flex-col items-center text-center gap-2 pt-1">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-1 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
              <div className="w-full h-full rounded-full bg-[#171f33] flex items-center justify-center text-3xl">
                🏆
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <CheckCircle className="w-4 h-4 fill-current text-white" />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-amber-300/80 uppercase font-bold tracking-wider">
              Campeón de la Ronda {room.currentRound}
            </span>
            <h2 className="text-2xl font-black text-white font-['Outfit'] mt-0.5">
              {winnerName}
            </h2>
            <p className="text-xs text-[#c7c4d8] mt-0.5">
              Validación algorítmica completada con éxito
            </p>
          </div>
        </div>

        {/* Verification Details Grid */}
        <div className="grid grid-cols-2 gap-2 bg-[#0b1326] border border-white/5 rounded-2xl p-3 text-left">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-[#c7c4d8]">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Patrón Ganador</span>
            </div>
            <div className="text-xs font-bold text-white mt-0.5 truncate">
              {patternName}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[10px] text-[#c7c4d8]">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Bolas Cantadas</span>
            </div>
            <div className="text-xs font-bold text-amber-300 mt-0.5 font-['Space_Grotesk']">
              {room.drawnNumbers.length} de 75
            </div>
          </div>
        </div>

        {/* Next Round Configuration for Host */}
        {isHost && (
          <div className="bg-[#0b1326] border border-indigo-500/30 rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-indigo-200">
              <span>🎯 Patrón para Ronda {nextRoundNumber}:</span>
              <span className="text-amber-400 font-normal text-[10px]">
                {nextPattern === 'LINE' ? 'Líneas (H/V)' : nextPattern === 'DIAGONAL' ? 'Diagonales (X)' : nextPattern === 'FOUR_CORNERS' ? '4 Esquinas' : 'Cartón Lleno'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'LINE', label: '1. Líneas' },
                  { id: 'DIAGONAL', label: '2. Diagonales' },
                  { id: 'FOUR_CORNERS', label: '3. 4 Esquinas' },
                  { id: 'FULL_HOUSE', label: '4. Cartón Lleno' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setNextPattern(p.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                    nextPattern === p.id
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md ring-1 ring-indigo-400'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Compartir Ganador'}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              title="Abrir WhatsApp directo"
              className="px-3.5 py-3 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/50 flex items-center justify-center"
            >
              <span className="text-xs font-bold">WhatsApp</span>
            </button>
          </div>

          {isHost && (
            <div className="flex gap-2">
              <button
                onClick={() => onNextRound(nextPattern)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Iniciar Ronda {nextRoundNumber}</span>
              </button>

              {onFinishGame && (
                <button
                  onClick={onFinishGame}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#c7c4d8] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Cerrar Sala</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
