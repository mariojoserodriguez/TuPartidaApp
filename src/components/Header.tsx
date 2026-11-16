import React, { useState } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { MarkerType, MARKERS } from '../types';
import { GrainMarker } from './GrainMarker';
import { LogIn, LogOut, Edit3, Check, X, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  guestName: string;
  selectedMarker: MarkerType;
  onSelectMarker: (marker: MarkerType) => void;
  onUpdateGuestName: (name: string) => void;
  onLogin: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  guestName,
  selectedMarker,
  onSelectMarker,
  onUpdateGuestName,
  onLogin,
  onLogout,
  onGoHome,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState(user?.displayName || guestName || 'Jugador Criollo');

  const marker = MARKERS[selectedMarker];
  const displayName = user?.displayName || guestName || 'Invitado';

  const handleSaveName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = newNameInput.trim();
    if (!cleanName) return;

    onUpdateGuestName(cleanName);
    localStorage.setItem('tupartida_guest_name', cleanName);

    // Update Firebase Auth displayName if currentUser is active
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: cleanName });
      } catch {}
    }

    setIsEditingName(false);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#060e20]/90 backdrop-blur-md border-b border-white/5">
        <div className="h-16 px-4 max-w-lg mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <button 
            onClick={onGoHome}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4f46e5] to-[#ffb95f] flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <span className="material-symbols-outlined text-[20px] text-white">sports_esports</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-[#dae2fd] tracking-tight leading-none font-['Outfit']">
                  TuPartida
                </span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 text-[10px] font-bold tracking-wider uppercase">
                  CLUB
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] text-[#c7c4d8] font-medium">Bingo & Rifas Criollas</span>
              </div>
            </div>
          </button>

          {/* User / Marker controls */}
          <div className="flex items-center gap-2">
            {/* Marker Selector button */}
            <div className="relative group">
              <button 
                title="Cambiar marcador tradicional"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#171f33] border border-white/10 text-xs font-semibold hover:border-indigo-400/50 transition-colors"
              >
                <GrainMarker type={selectedMarker} size="sm" />
                <span className="hidden sm:inline text-[#dae2fd]">{marker.name}</span>
              </button>
              
              {/* Dropdown with markers */}
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#171f33] border border-white/10 rounded-2xl shadow-2xl p-2 hidden group-hover:block z-50">
                <div className="text-[10px] uppercase font-bold text-[#c7c4d8] px-2 py-1">Marcador de Mesa</div>
                {(Object.keys(MARKERS) as MarkerType[]).map((key) => {
                  const m = MARKERS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => onSelectMarker(key)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        selectedMarker === key ? 'bg-indigo-600 text-white shadow-md' : 'text-[#dae2fd] hover:bg-white/5'
                      }`}
                    >
                      <GrainMarker type={key} size="sm" />
                      <span>{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Profile / Name */}
            <div className="flex items-center gap-1.5 bg-[#171f33] border border-white/5 rounded-2xl px-2.5 py-1">
              <button
                onClick={() => {
                  setNewNameInput(displayName);
                  setIsEditingName(true);
                }}
                title="Toca para cambiar tu nombre en la mesa"
                className="flex flex-col text-right hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#dae2fd] max-w-[85px] truncate">
                    {displayName}
                  </span>
                  <Edit3 className="w-3 h-3 text-indigo-400 opacity-70" />
                </div>
                <span className="text-[9px] text-emerald-400 font-semibold">Online</span>
              </button>

              {user && !user.isAnonymous ? (
                <button 
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="p-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#c7c4d8] hover:text-rose-300 transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onLogin}
                  title="Iniciar sesión con Google para guardar tus partidas en cualquier PC"
                  className="p-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 transition-colors ml-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal to Edit Player Name */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs bg-[#171f33] border-2 border-indigo-500/40 rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white font-['Outfit']">
                  Tu Nombre en la Mesa
                </span>
              </div>
              <button 
                onClick={() => setIsEditingName(false)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-[#c7c4d8]">
              Este nombre aparecerá en tus cartones, en la cantadera y en el podio si ganas:
            </p>

            <form onSubmit={handleSaveName} className="flex flex-col gap-3">
              <input 
                type="text"
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                maxLength={30}
                placeholder="Ej. Mario, Tía Carmen, Juan..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1326] border border-white/10 text-white font-bold text-sm focus:border-indigo-400 focus:outline-none"
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#c7c4d8] text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
