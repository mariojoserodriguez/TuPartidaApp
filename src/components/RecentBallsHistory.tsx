import React from 'react';
import { BingoBall3D } from './BingoBall3D';
import { History } from 'lucide-react';

interface RecentBallsHistoryProps {
  drawnNumbers: number[];
  className?: string;
  maxDisplay?: number;
}

export const RecentBallsHistory: React.FC<RecentBallsHistoryProps> = ({
  drawnNumbers,
  className = '',
  maxDisplay = 15,
}) => {
  if (drawnNumbers.length === 0) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-[#0b1326] border border-white/5 rounded-2xl text-[11px] text-[#c7c4d8] ${className}`}>
        <History className="w-3.5 h-3.5 text-indigo-400" />
        <span>Historial: Aún no se han sacado bolas en esta ronda.</span>
      </div>
    );
  }

  // Reverse list so latest drawn appears first on the left
  const reversed = [...drawnNumbers].reverse().slice(0, maxDisplay);

  return (
    <div className={`flex flex-col gap-1.5 bg-[#0b1326] border border-white/10 rounded-2xl p-2.5 shadow-inner ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-bold text-[#c7c4d8] px-1">
        <div className="flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-indigo-400" />
          <span>Secuencia de Salida (Últimas {reversed.length})</span>
        </div>
        <span className="text-[10px] text-indigo-300 font-['Space_Grotesk']">
          Total: {drawnNumbers.length}/75
        </span>
      </div>

      {/* Horizontal scrolling strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 px-0.5 scrollbar-thin scrollbar-thumb-white/10">
        {reversed.map((num, idx) => (
          <div key={`${num}_${idx}`} className="flex flex-col items-center flex-shrink-0">
            <BingoBall3D 
              number={num} 
              size={idx === 0 ? 'sm' : 'xs'} 
              isLatest={idx === 0} 
            />
            <span className="text-[9px] text-zinc-500 font-mono mt-0.5">
              #{drawnNumbers.length - idx}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
