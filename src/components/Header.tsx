import React from 'react';
import { User } from 'firebase/auth';
import { MarkerType, MARKERS } from '../types';
import { LogIn, LogOut, Sparkles } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  guestName: string;
  selectedMarker: MarkerType;
  onSelectMarker: (marker: MarkerType) => void;
  onLogin: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  guestName,
  selectedMarker,
  onSelectMarker,
  onLogin,
  onLogout,
  onGoHome,
}) => {
  const marker = MARKERS[selectedMarker];
  const displayName = user?.displayName || guestName || 'Invitado';

  return (
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
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#171f33] border border-white/10 text-xs font-semibold hover:border-indigo-400/50 transition-colors"
            >
              <span>{marker.emoji}</span>
              <span className="hidden sm:inline text-[#dae2fd]">{marker.name}</span>
            </button>
            
            {/* Dropdown with markers */}
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#171f33] border border-white/10 rounded-xl shadow-xl p-1.5 hidden group-hover:block z-50">
              <div className="text-[10px] uppercase font-bold text-[#c7c4d8] px-2 py-1">Marcador Criollo</div>
              {(Object.keys(MARKERS) as MarkerType[]).map((key) => {
                const m = MARKERS[key];
                return (
                  <button
                    key={key}
                    onClick={() => onSelectMarker(key)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedMarker === key ? 'bg-indigo-600 text-white' : 'text-[#dae2fd] hover:bg-white/5'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-[#dae2fd] max-w-[80px] truncate">{displayName}</span>
                <span className="text-[9px] text-emerald-400 font-semibold">Online</span>
              </div>
              <button 
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#c7c4d8] hover:text-rose-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acceder</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
