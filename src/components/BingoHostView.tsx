import React, { useState, useEffect } from 'react';
import { Room, BingoWinningPattern } from '../types';
import { drawNextBall, startNextRound, finishRoom, updateCallerVoiceGender, updateRoomWinningPattern } from '../lib/roomService';
import { getLetterForNumber, getPatternDisplayName, getDefaultPatternForRound } from '../lib/bingoEngine';
import { sounds, speakBingoCallout, getActiveVoiceName } from '../lib/audio';
import { shareInvite, openWhatsAppDirect } from '../lib/share';
import { BingoBall3D } from './BingoBall3D';
import { RecentBallsHistory } from './RecentBallsHistory';
import { WinnerCeremonyModal } from './WinnerCeremonyModal';
import { GameChat } from './chat/GameChat';
import { triggerVictoryCelebration } from '../lib/celebration';
import { 
  Play, 
  Pause, 
  Share2, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  UserCheck,
  Check,
  RotateCcw,
  Target
} from 'lucide-react';

interface BingoHostViewProps {
  room: Room;
  userName?: string;
  onLeave: () => void;
  onNextRound?: () => void;
}

export const BingoHostView: React.FC<BingoHostViewProps> = ({
  room,
  userName,
  onLeave,
}) => {
  const [isAutoDrawing, setIsAutoDrawing] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCeremonyModal, setShowCeremonyModal] = useState(true);
  const [callerVoiceGender, setCallerVoiceGender] = useState<'female' | 'male'>(
    room.config.callerVoiceGender || 'female'
  );

  useEffect(() => {
    if (room.config.callerVoiceGender) {
      setCallerVoiceGender(room.config.callerVoiceGender);
    }
  }, [room.config.callerVoiceGender]);

  const lastNumber = room.lastDrawnNumber;
  const lastLetter = lastNumber ? getLetterForNumber(lastNumber) : null;
  const drawnSet = new Set(room.drawnNumbers);

  // Announce ball via Venezuelan Cantadera speech
  const announceBall = (letter: string, num: number) => {
    if (!speechEnabled) return;
    speakBingoCallout(letter, num, callerVoiceGender);
  };

  const handleManualDraw = async () => {
    sounds.playBallDrop();
    const num = await drawNextBall(room);
    if (num) {
      const letter = getLetterForNumber(num);
      announceBall(letter, num);
    }
  };

  const handleVoiceGenderChange = async (gender: 'female' | 'male') => {
    setCallerVoiceGender(gender);
    // Instant test preview so the host hears the change immediately!
    speakBingoCallout('B', 12, gender);
    await updateCallerVoiceGender(room.id, gender);
  };

  const handlePatternChange = async (newPattern: BingoWinningPattern) => {
    await updateRoomWinningPattern(room.id, newPattern);
  };

  const handleStartNextRound = async (nextPattern?: BingoWinningPattern) => {
    const patternToUse = nextPattern || getDefaultPatternForRound(room.currentRound + 1);
    await startNextRound(room.id, room.currentRound, patternToUse);
    setShowCeremonyModal(false);
  };

  const handleFinishRoom = async () => {
    await finishRoom(room.id);
    onLeave();
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
          announceBall(letter, num);
        } else {
          setIsAutoDrawing(false);
        }
      }, 7000); // 7s between draws
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoDrawing, room, speechEnabled, callerVoiceGender]);

  // Grand victory celebration when BINGO is won (Applause, Fireworks, Confetti, Vibration)
  useEffect(() => {
    if (room.status === 'FINISHED') {
      setIsAutoDrawing(false);
      setShowCeremonyModal(true);
      if (room.winnerUserName) {
        triggerVictoryCelebration();
      }
    }
  }, [room.status, room.winnerUserName]);

  // Multiplatform share link (Phone: App Picker sheet / PC: Copy to Clipboard)
  const handleShare = async () => {
    const url = `${window.location.origin}?pin=${room.pinCode}`;
    const text = `¡Únete a la partida de Bingo en Vivo! 🎱\nSala: ${room.title}\nCódigo PIN: *${room.pinCode}*\nEntra a jugar aquí:`;

    const res = await shareInvite({
      title: `Únete a ${room.title} en TuPartida`,
      text,
      url,
    });

    if (res.method === 'clipboard' && res.success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
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
          className="flex items-center gap-1 text-xs text-[#c7c4d8] hover:text-white font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Salir</span>
        </button>

        {/* PIN Code Box & Multiplatform Share */}
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
            onClick={handleShare}
            className="p-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-500/40 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1"
            title="Compartir sala (WhatsApp, Telegram, etc.)"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span className="text-[10px] font-bold hidden sm:inline">Compartir</span>
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

      {/* Voice Gender Selector for Cantadera (Hombre vs Mujer) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#171f33] border border-white/10 rounded-2xl px-4 py-2.5 shadow-sm gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[#c7c4d8]">
          <UserCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="font-semibold">Voz de la Cantadera:</span>
          <span className="text-[10px] text-zinc-500 hidden sm:inline">
            ({getActiveVoiceName(callerVoiceGender)})
          </span>
        </div>
        <div className="flex items-center gap-1 bg-[#0b1326] p-1 rounded-xl border border-white/5 self-end sm:self-auto">
          <button
            onClick={() => handleVoiceGenderChange('female')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              callerVoiceGender === 'female'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            👩 Cantadora
          </button>
          <button
            onClick={() => handleVoiceGenderChange('male')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              callerVoiceGender === 'male'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            👨 Cantador
          </button>
        </div>
      </div>

      {/* Large Bombo / Current 3D Ball Display with Pop Animation */}
      <div className="bg-gradient-to-b from-[#171f33] to-[#0b1326] border border-white/10 rounded-3xl p-6 text-center shadow-xl flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-3 left-4 text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 z-10">
          <span>Ronda {room.currentRound}</span>
          <span>•</span>
          <select
            value={room.config.winningPattern}
            onChange={(e) => handlePatternChange(e.target.value as BingoWinningPattern)}
            className="bg-[#0b1326] border border-indigo-500/40 text-amber-300 text-[10px] rounded-lg px-2 py-0.5 font-bold cursor-pointer hover:border-indigo-400 focus:outline-none"
            title="Cambiar patrón ganador de la ronda"
          >
            <option value="LINE">1. Líneas (H/V)</option>
            <option value="DIAGONAL">2. Diagonales (X)</option>
            <option value="FOUR_CORNERS">3. 4 Esquinas</option>
            <option value="FULL_HOUSE">4. Cartón Lleno</option>
          </select>
        </div>
        <div className="absolute top-3 right-4 text-[11px] text-[#c7c4d8]">
          {room.drawnNumbers.length} / 75 Bolas
        </div>

        {/* 3D Ball Sphere Visual with Key for Re-triggering Pop */}
        <div className="my-3 relative flex items-center justify-center">
          <div key={lastNumber || 'ready'} className="animate-ball-pop flex items-center justify-center">
            {lastNumber ? (
              <BingoBall3D 
                number={lastNumber} 
                letter={lastLetter || undefined} 
                size="xl" 
                isLatest={true} 
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-950 via-[#171f33] to-[#0b1326] border-4 border-dashed border-indigo-500/30 flex flex-col items-center justify-center text-indigo-200">
                <span className="text-2xl mb-1">🎱</span>
                <span className="text-xs font-bold text-indigo-200">¡Listo para girar!</span>
              </div>
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

      {/* Sequential History Strip of recent drawn balls */}
      <RecentBallsHistory drawnNumbers={room.drawnNumbers} />

      {/* 1-75 Master Board Grid */}
      <div className="bg-[#171f33] border border-white/10 rounded-3xl p-4 shadow-lg flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#c7c4d8] px-1">
          <span>Tablero Maestro (1-75)</span>
          <span className="text-indigo-300 font-['Space_Grotesk']">
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

      {/* Winner Ceremony Modal for Host */}
      {room.status === 'FINISHED' && showCeremonyModal && (
        <WinnerCeremonyModal
          room={room}
          isHost={true}
          onNextRound={handleStartNextRound}
          onClose={() => setShowCeremonyModal(false)}
          onFinishGame={handleFinishRoom}
        />
      )}

      {/* Real-time Room Chat for Host */}
      <GameChat
        roomId={room.id}
        userId={room.hostId}
        userName={userName || room.hostName || 'Anfitrión'}
        isHost={true}
        chatEnabled={room.config.chatEnabled !== false}
        voiceNotesEnabled={room.config.voiceNotesEnabled !== false}
      />
    </div>
  );
};
