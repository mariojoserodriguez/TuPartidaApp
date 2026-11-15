import React, { useState } from 'react';
import { Room, RaffleTicket } from '../types';
import { 
  ArrowLeft, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  Share2, 
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface RaffleViewProps {
  room: Room;
  userId: string;
  isHost: boolean;
  onLeave: () => void;
}

export const RaffleView: React.FC<RaffleViewProps> = ({
  room,
  userId,
  isHost,
  onLeave,
}) => {
  const ticketCount = 100; // 00 to 99
  const pricePerTicket = room.config.pricePerCard || 1;

  // Mock initial state of tickets (to be synced with Firestore raffle subcollection)
  const [tickets, setTickets] = useState<RaffleTicket[]>(() => {
    return Array.from({ length: ticketCount }, (_, i) => ({
      ticketNumber: i,
      formattedNumber: i.toString().padStart(2, '0'),
      status: i === 7 ? 'PAID' : i === 23 ? 'RESERVED' : 'AVAILABLE',
      buyerName: i === 7 ? 'Carlos M.' : i === 23 ? 'María P.' : undefined,
      paymentRef: i === 7 ? 'PM-8921' : undefined,
    }));
  });

  const [selectedTicket, setSelectedTicket] = useState<RaffleTicket | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  // Statistics
  const paidCount = tickets.filter(t => t.status === 'PAID').length;
  const reservedCount = tickets.filter(t => t.status === 'RESERVED').length;
  const availableCount = tickets.filter(t => t.status === 'AVAILABLE').length;

  const totalCollected = paidCount * pricePerTicket;
  const targetTotal = ticketCount * pricePerTicket;
  const netFunds = Math.max(0, totalCollected - (room.config.targetAmount || 0));

  const handleTicketClick = (ticket: RaffleTicket) => {
    if (ticket.status === 'PAID') return;
    setSelectedTicket(ticket);
    setBuyerName(ticket.buyerName || '');
    setPaymentRef(ticket.paymentRef || '');
  };

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setTickets(prev => prev.map(t => {
      if (t.ticketNumber === selectedTicket.ticketNumber) {
        return {
          ...t,
          status: isHost ? 'PAID' : 'RESERVED',
          buyerId: userId,
          buyerName,
          buyerPhone,
          paymentRef,
          reservedAt: Date.now(),
          reservedUntil: Date.now() + 15 * 60 * 1000,
        };
      }
      return t;
    }));

    setSelectedTicket(null);
  };

  const handleShareBalance = () => {
    const text = `📊 *BALANCE PÚBLICO PRO-FONDOS*\nCausa: ${room.config.causeDescription || room.title}\n` +
      `🎟️ Boletos Pagados: ${paidCount} / ${ticketCount}\n` +
      `💰 Total Recaudado: $${totalCollected}\n` +
      `🎯 Meta de Recaudación: $${targetTotal}\n` +
      `¡Gracias por tu apoyo comunitario!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-[#171f33] border border-white/10 rounded-2xl p-3 shadow-md">
        <button 
          onClick={onLeave}
          className="flex items-center gap-1 text-xs text-[#c7c4d8] hover:text-white font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="text-center">
          <div className="text-xs font-bold text-white font-['Outfit']">
            {room.title}
          </div>
          <span className="text-[10px] text-amber-300 font-semibold">
            Talonario de 100 Números (00-99)
          </span>
        </div>

        <button
          onClick={handleShareBalance}
          className="p-2 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/50"
          title="Compartir balance público por WhatsApp"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Pro-Fondos Accounting Card */}
      <div className="bg-gradient-to-br from-[#171f33] to-[#222a3d] border border-amber-500/30 rounded-3xl p-4 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
              Libro Contable Comunitario
            </span>
            <h3 className="text-sm font-bold text-white mt-0.5">
              {room.config.causeDescription || 'Fondo Benéfico Comunitario'}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400 font-['Space_Grotesk'] text-base">
              ${totalCollected}
            </span>
            <span className="text-[10px] text-[#c7c4d8] block">de ${targetTotal}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#0b1326] rounded-full h-2 overflow-hidden border border-white/5">
          <div 
            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
            style={{ width: `${(paidCount / ticketCount) * 100}%` }}
          />
        </div>

        {/* Status Chips */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-[#0b1326] rounded-xl p-2 border border-white/5 text-center">
            <span className="text-[10px] text-[#c7c4d8] block">Disponibles</span>
            <span className="font-bold text-sm text-emerald-400 font-['Space_Grotesk']">{availableCount}</span>
          </div>
          <div className="bg-[#0b1326] rounded-xl p-2 border border-white/5 text-center">
            <span className="text-[10px] text-[#c7c4d8] block">En Espera</span>
            <span className="font-bold text-sm text-amber-300 font-['Space_Grotesk']">{reservedCount}</span>
          </div>
          <div className="bg-[#0b1326] rounded-xl p-2 border border-white/5 text-center">
            <span className="text-[10px] text-[#c7c4d8] block">Confirmados</span>
            <span className="font-bold text-sm text-indigo-300 font-['Space_Grotesk']">{paidCount}</span>
          </div>
        </div>
      </div>

      {/* 100 Numbers Grid (00 to 99) */}
      <div className="bg-[#171f33] border border-white/10 rounded-3xl p-4 shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#c7c4d8] px-1">
          <span>Selecciona tu número de la suerte</span>
          <span className="text-amber-300">${pricePerTicket} c/u</span>
        </div>

        <div className="grid grid-cols-10 gap-1.5">
          {tickets.map((t) => {
            const isAvailable = t.status === 'AVAILABLE';
            const isReserved = t.status === 'RESERVED';
            const isPaid = t.status === 'PAID';

            return (
              <button
                key={t.ticketNumber}
                onClick={() => handleTicketClick(t)}
                disabled={isPaid}
                className={`aspect-square rounded-xl flex items-center justify-center font-['Space_Grotesk'] text-xs font-bold transition-all active:scale-95 ${
                  isPaid
                    ? 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 cursor-not-allowed opacity-60'
                    : isReserved
                    ? 'bg-amber-500/30 border border-amber-500 text-amber-200 animate-pulse'
                    : 'bg-[#0b1326] border border-white/5 text-white hover:border-emerald-400/50 hover:bg-emerald-500/10'
                }`}
                title={`Número ${t.formattedNumber} - ${t.status}`}
              >
                {t.formattedNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket Reservation Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#171f33] border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-['Space_Grotesk'] font-black text-lg">
                  {selectedTicket.formattedNumber}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Reservar Número #{selectedTicket.formattedNumber}
                  </h3>
                  <span className="text-xs text-amber-300 font-semibold">${pricePerTicket}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-7 h-7 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReserveSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#c7c4d8]">Nombre del Participante</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pedro Pérez"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full mt-1 bg-[#0b1326] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#c7c4d8]">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 0414-1234567"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full mt-1 bg-[#0b1326] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#c7c4d8]">Referencia de Pago Móvil / Efectivo</label>
                <input
                  type="text"
                  placeholder="Ej. Ref #8921 o Efectivo"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full mt-1 bg-[#0b1326] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#c7c4d8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/30"
                >
                  {isHost ? 'Confirmar Pago' : 'Reservar Número'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
