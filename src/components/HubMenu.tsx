import React, { useState } from 'react';
import { GameMode, GameType, BingoWinningPattern, BingoCardsPolicy } from '../types';
import { 
  Sparkles, 
  Users, 
  HeartHandshake, 
  Ticket, 
  Plus, 
  ArrowRight,
  Hash,
  Play
} from 'lucide-react';

interface HubMenuProps {
  userName: string;
  onJoinByPin: (pin: string) => void;
  onCreateRoom: (params: {
    title: string;
    gameType: GameType;
    mode: GameMode;
    cardsPolicy: BingoCardsPolicy;
    winningPattern: BingoWinningPattern;
    pricePerCard?: number;
    targetAmount?: number;
    causeDescription?: string;
  }) => void;
  onSelectGameDirect: (type: GameType) => void;
}

export const HubMenu: React.FC<HubMenuProps> = ({
  userName,
  onJoinByPin,
  onCreateRoom,
  onSelectGameDirect,
}) => {
  const [mode, setMode] = useState<GameMode>('AMISTOSO');
  const [pinInput, setPinInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Room Form State
  const [roomTitle, setRoomTitle] = useState('Gran Bingo Comunitario');
  const [gameType, setGameType] = useState<GameType>('BINGO');
  const [winningPattern, setWinningPattern] = useState<BingoWinningPattern>('LINE');
  const [cardsPolicy, setCardsPolicy] = useState<BingoCardsPolicy>('REUSABLE');
  const [pricePerCard, setPricePerCard] = useState(1);
  const [causeDescription, setCauseDescription] = useState('Pro-Fondos de la comunidad');

  const handleJoinPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().length === 6) {
      onJoinByPin(pinInput.trim());
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom({
      title: roomTitle,
      gameType,
      mode,
      cardsPolicy,
      winningPattern,
      pricePerCard: mode === 'PRO_FONDOS' ? pricePerCard : 0,
      causeDescription: mode === 'PRO_FONDOS' ? causeDescription : undefined,
    });
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col gap-5 pb-16">
      {/* 1. Hero & Mode Toggle */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#dae2fd] font-['Outfit'] tracking-tight flex items-center gap-1.5">
              <span>¡Hola, {userName || 'Amigo'}!</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs text-[#c7c4d8] font-medium">
              ¿Qué jugamos hoy en la comunidad?
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Sala</span>
          </button>
        </div>

        {/* Mode Selector Pill */}
        <div className="p-1 rounded-2xl bg-[#060e20] border border-white/5 shadow-inner">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setMode('AMISTOSO')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                mode === 'AMISTOSO'
                  ? 'bg-[#222a3d] text-white shadow-md'
                  : 'text-[#c7c4d8] hover:text-white'
              }`}
            >
              <span>🎉</span>
              <span>Amistoso</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] uppercase font-bold">
                Gratis
              </span>
            </button>
            <button
              onClick={() => setMode('PRO_FONDOS')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                mode === 'PRO_FONDOS'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-md'
                  : 'text-[#c7c4d8] hover:text-white'
              }`}
            >
              <span>🎗️</span>
              <span>Pro-Fondos</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-[9px] uppercase font-bold">
                Causas
              </span>
            </button>
          </div>
          <div className="px-3 py-2 flex items-center gap-2 text-[11px] text-[#c7c4d8]">
            <HeartHandshake className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="truncate">
              {mode === 'AMISTOSO' 
                ? 'Juega sin costo con amigos y familia en mesas abiertas o privadas.' 
                : 'Recaudación benéfica, vendimias o promociones (Libro contable Non-Custodial).'}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Join by PIN Box */}
      <section className="bg-[#171f33] border border-white/10 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            <span>Unirse a una Sala</span>
          </span>
          <span className="text-[10px] text-[#c7c4d8]">Código de 6 dígitos</span>
        </div>
        <form onSubmit={handleJoinPin} className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            placeholder="Ej. 482910"
            className="flex-1 bg-[#0b1326] border border-white/10 rounded-xl px-4 py-2.5 text-center font-['Space_Grotesk'] text-lg font-bold tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={pinInput.length !== 6}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-indigo-600/30"
          >
            <span>Entrar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </section>

      {/* 3. Game Catalog */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#c7c4d8] px-1">
          Juegos Disponibles
        </h2>

        {/* Bingo Card */}
        <div 
          onClick={() => {
            setGameType('BINGO');
            setShowCreateModal(true);
          }}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#171f33] to-[#222a3d] border border-indigo-500/30 p-4 shadow-lg hover:border-indigo-400/60 cursor-pointer transition-all active:scale-[0.99]"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-2xl shadow-md shadow-indigo-500/30">
                🎱
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Bingo en Vivo
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    EN VIVO
                  </span>
                </div>
                <p className="text-xs text-[#c7c4d8] mt-0.5">
                  El bombo tradicional (1-75), marcadores criollos y verificación instantánea.
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#c7c4d8]">
            <span>Línea • 4 Esquinas • Cartón Lleno</span>
            <span className="text-indigo-300 font-semibold">Tocar para jugar →</span>
          </div>
        </div>

        {/* Micro-Rifas Card */}
        <div 
          onClick={() => {
            setGameType('RAFFLE');
            setShowCreateModal(true);
          }}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#171f33] to-[#222a3d] border border-amber-500/30 p-4 shadow-lg hover:border-amber-400/60 cursor-pointer transition-all active:scale-[0.99]"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-2xl shadow-md shadow-amber-500/30">
                🎟️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Micro-Rifas Rápidas
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    PRO-FONDOS
                  </span>
                </div>
                <p className="text-xs text-[#c7c4d8] mt-0.5">
                  Talonarios de 100 y 1000 números con reserva atómica y comprobante Pago Móvil.
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-amber-300 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#c7c4d8]">
            <span>100 Números (00-99) • 1000 Números</span>
            <span className="text-amber-300 font-semibold">Tocar para jugar →</span>
          </div>
        </div>

        {/* Future Games (Coming Soon) */}
        <div className="grid grid-cols-3 gap-2 opacity-65">
          <div className="bg-[#171f33] border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center">
            <span className="text-2xl mb-1">🀄</span>
            <span className="text-xs font-bold text-white">Dominó</span>
            <span className="text-[9px] text-[#c7c4d8] mt-0.5">Cochinada/Tranca</span>
            <span className="mt-1 px-1.5 py-0.2 bg-white/5 rounded text-[8px] text-zinc-400 uppercase font-semibold">Pronto</span>
          </div>
          <div className="bg-[#171f33] border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center">
            <span className="text-2xl mb-1">🎲</span>
            <span className="text-xs font-bold text-white">Ludo</span>
            <span className="text-[9px] text-[#c7c4d8] mt-0.5">4 Jugadores</span>
            <span className="mt-1 px-1.5 py-0.2 bg-white/5 rounded text-[8px] text-zinc-400 uppercase font-semibold">Pronto</span>
          </div>
          <div className="bg-[#171f33] border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center">
            <span className="text-2xl mb-1">♟️</span>
            <span className="text-xs font-bold text-white">Ajedrez</span>
            <span className="text-[9px] text-[#c7c4d8] mt-0.5">Blitz / Rápido</span>
            <span className="mt-1 px-1.5 py-0.2 bg-white/5 rounded text-[8px] text-zinc-400 uppercase font-semibold">Pronto</span>
          </div>
        </div>
      </section>

      {/* 4. Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#171f33] border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-white font-['Outfit']">
                  Crear Nueva Sala
                </h3>
                <span className="text-xs text-[#c7c4d8]">
                  Modo {mode === 'AMISTOSO' ? 'Amistoso (Gratuito)' : 'Pro-Fondos'}
                </span>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#c7c4d8] uppercase">Nombre de la Sala</label>
                <input
                  type="text"
                  required
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  className="w-full mt-1 bg-[#0b1326] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {gameType === 'BINGO' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#c7c4d8] uppercase">Patrón Ganador</label>
                      <select
                        value={winningPattern}
                        onChange={(e) => setWinningPattern(e.target.value as BingoWinningPattern)}
                        className="w-full mt-1 bg-[#0b1326] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="LINE">Cualquier Línea</option>
                        <option value="FOUR_CORNERS">Cuatro Esquinas</option>
                        <option value="FULL_HOUSE">Cartón Lleno</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#c7c4d8] uppercase">Política Cartones</label>
                      <select
                        value={cardsPolicy}
                        onChange={(e) => setCardsPolicy(e.target.value as BingoCardsPolicy)}
                        className="w-full mt-1 bg-[#0b1326] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="REUSABLE">Reutilizables (Se limpian)</option>
                        <option value="DISPOSABLE">Desechables (Nuevos)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {mode === 'PRO_FONDOS' && (
                <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl p-3 flex flex-col gap-2">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <span>🎗️</span>
                    <span>Parámetros de Recaudación</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#c7c4d8]">Causa / Beneficiario</label>
                    <input
                      type="text"
                      value={causeDescription}
                      onChange={(e) => setCauseDescription(e.target.value)}
                      placeholder="Ej. Vendimia Médica o Promoción 2026"
                      className="w-full mt-0.5 bg-[#171f33] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-[#c7c4d8]">Precio por Cartón ($ o Bs)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={pricePerCard}
                        onChange={(e) => setPricePerCard(Number(e.target.value))}
                        className="w-full mt-0.5 bg-[#171f33] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#c7c4d8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
                >
                  ¡Crear Sala Ahora!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
