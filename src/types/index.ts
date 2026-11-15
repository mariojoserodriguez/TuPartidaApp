export type GameType = 'BINGO' | 'RAFFLE' | 'DOMINO' | 'LUDO' | 'CHESS';
export type GameMode = 'AMISTOSO' | 'PRO_FONDOS';
export type MarkerType = 'CARAOTA' | 'MAIZ' | 'LENTEJA' | 'NEON';
export type RoomStatus = 'LOBBY' | 'PLAYING' | 'PAUSED' | 'FINISHED';
export type BingoWinningPattern = 'LINE' | 'FOUR_CORNERS' | 'FULL_HOUSE';
export type BingoCardsPolicy = 'REUSABLE' | 'DISPOSABLE';

export interface MarkerConfig {
  id: MarkerType;
  name: string;
  emoji: string;
  color: string;
  bgClass: string;
  borderClass: string;
}

export const MARKERS: Record<MarkerType, MarkerConfig> = {
  CARAOTA: {
    id: 'CARAOTA',
    name: 'Caraota Negra',
    emoji: '🫘',
    color: '#1a1a1a',
    bgClass: 'bg-zinc-900 shadow-inner border border-zinc-700',
    borderClass: 'border-zinc-800',
  },
  MAIZ: {
    id: 'MAIZ',
    name: 'Grano de Maíz',
    emoji: '🌽',
    color: '#facc15',
    bgClass: 'bg-amber-400 shadow-inner border border-amber-300',
    borderClass: 'border-amber-500',
  },
  LENTEJA: {
    id: 'LENTEJA',
    name: 'Lenteja Marrón',
    emoji: '🟤',
    color: '#8d5b4c',
    bgClass: 'bg-amber-800 shadow-inner border border-amber-700',
    borderClass: 'border-amber-900',
  },
  NEON: {
    id: 'NEON',
    name: 'Sello Arcade Neón',
    emoji: '✨',
    color: '#4edea3',
    bgClass: 'bg-emerald-400 shadow-[0_0_12px_#4edea3] border border-emerald-200',
    borderClass: 'border-emerald-400',
  },
};

export interface Room {
  id: string;
  pinCode: string;
  hostId: string;
  hostName: string;
  gameType: GameType;
  mode: GameMode;
  title: string;
  status: RoomStatus;
  createdAt: number;
  config: {
    targetAmount?: number;
    pricePerCard?: number;
    causeDescription?: string;
    paymentInfo?: {
      pagoMovilBank?: string;
      pagoMovilPhone?: string;
      pagoMovilId?: string;
      zelleEmail?: string;
      binanceId?: string;
    };
    cardsPolicy: BingoCardsPolicy;
    winningPattern: BingoWinningPattern;
  };
  currentRound: number;
  drawnNumbers: number[];
  lastDrawnNumber?: number;
  winnerUserId?: string;
  winnerUserName?: string;
}

export interface BingoCard {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  cardIndex: number;
  matrix: number[][]; // 5x5 numbers, 0 at center (2,2)
  marked: boolean[][]; // 5x5 booleans
  isWinner: boolean;
}

export type TicketStatus = 'AVAILABLE' | 'RESERVED' | 'PAID';

export interface RaffleTicket {
  ticketNumber: number; // e.g. 0 to 99 or 0 to 999
  formattedNumber: string; // "07" or "045"
  status: TicketStatus;
  buyerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  paymentRef?: string;
  reservedAt?: number;
  reservedUntil?: number; // TTL
}
