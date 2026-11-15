import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  onSnapshot, 
  arrayUnion,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Room, 
  BingoCard, 
  GameType, 
  GameMode, 
  BingoWinningPattern, 
  BingoCardsPolicy 
} from '../types';
import { generateBingoMatrix, checkWinningBingo } from './bingoEngine';

// Generate 6-digit PIN
export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Creates a new Game Room
 */
export async function createRoom(params: {
  hostId: string;
  hostName: string;
  gameType: GameType;
  mode: GameMode;
  title: string;
  cardsPolicy?: BingoCardsPolicy;
  winningPattern?: BingoWinningPattern;
  pricePerCard?: number;
  targetAmount?: number;
  causeDescription?: string;
  paymentInfo?: Room['config']['paymentInfo'];
}): Promise<Room> {
  const pinCode = generatePin();
  const roomRef = doc(collection(db, 'rooms'));
  
  const newRoom: Room = {
    id: roomRef.id,
    pinCode,
    hostId: params.hostId,
    hostName: params.hostName,
    gameType: params.gameType,
    mode: params.mode,
    title: params.title,
    status: 'LOBBY',
    createdAt: Date.now(),
    config: {
      cardsPolicy: params.cardsPolicy || 'REUSABLE',
      winningPattern: params.winningPattern || 'LINE',
      pricePerCard: params.pricePerCard || 0,
      targetAmount: params.targetAmount || 0,
      causeDescription: params.causeDescription || '',
      paymentInfo: params.paymentInfo,
    },
    currentRound: 1,
    drawnNumbers: [],
  };

  await setDoc(roomRef, newRoom);
  return newRoom;
}

/**
 * Finds room by 6-digit PIN
 */
export async function getRoomByPin(pin: string): Promise<Room | null> {
  const q = query(collection(db, 'rooms'), where('pinCode', '==', pin.trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Room;
}

/**
 * Real-time listener for a room
 */
export function subscribeToRoom(roomId: string, onUpdate: (room: Room | null) => void) {
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate({ id: snapshot.id, ...snapshot.data() } as Room);
    } else {
      onUpdate(null);
    }
  });
}

/**
 * Draws the next ball in the Bingo (El Bombo)
 */
export async function drawNextBall(room: Room): Promise<number | null> {
  const drawn = new Set(room.drawnNumbers);
  const remaining: number[] = [];
  for (let i = 1; i <= 75; i++) {
    if (!drawn.has(i)) remaining.push(i);
  }

  if (remaining.length === 0) return null;

  const nextNumber = remaining[Math.floor(Math.random() * remaining.length)];
  const roomRef = doc(db, 'rooms', room.id);

  await updateDoc(roomRef, {
    drawnNumbers: arrayUnion(nextNumber),
    lastDrawnNumber: nextNumber,
    status: 'PLAYING',
  });

  return nextNumber;
}

/**
 * Creates/Generates Bingo Cards for a player in a room
 */
export async function generatePlayerCards(
  roomId: string, 
  userId: string, 
  userName: string, 
  count = 1
): Promise<BingoCard[]> {
  const cards: BingoCard[] = [];
  const cardsCol = collection(db, 'rooms', roomId, 'cards');

  for (let i = 0; i < count; i++) {
    const cardData: Omit<BingoCard, 'id'> = {
      roomId,
      userId,
      userName,
      cardIndex: i + 1,
      matrix: generateBingoMatrix(),
      marked: Array(5).fill(null).map(() => Array(5).fill(false)),
      isWinner: false,
    };
    // Center is free
    cardData.marked[2][2] = true;

    const docRef = await addDoc(cardsCol, cardData);
    cards.push({ id: docRef.id, ...cardData });
  }

  return cards;
}

/**
 * Real-time listener for player cards in a room
 */
export function subscribeToPlayerCards(
  roomId: string, 
  userId: string, 
  onUpdate: (cards: BingoCard[]) => void
) {
  const q = query(
    collection(db, 'rooms', roomId, 'cards'), 
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const cards: BingoCard[] = [];
    snapshot.forEach((doc) => {
      cards.push({ id: doc.id, ...doc.data() } as BingoCard);
    });
    // Sort by cardIndex
    cards.sort((a, b) => a.cardIndex - b.cardIndex);
    onUpdate(cards);
  });
}

/**
 * Claims BINGO and deterministically validates it
 */
export async function claimBingo(
  room: Room, 
  card: BingoCard
): Promise<{ success: boolean; message: string }> {
  // Deterministic validation: No human error, no false claims!
  const verification = checkWinningBingo(
    card.matrix, 
    room.drawnNumbers, 
    room.config.winningPattern
  );

  if (!verification.isWinner) {
    return { 
      success: false, 
      message: '¡Atención! Aún no completas el patrón de la ronda. Revisa bien las balotas cantadas.' 
    };
  }

  // Valid winner! Update room status
  const roomRef = doc(db, 'rooms', room.id);
  await updateDoc(roomRef, {
    status: 'FINISHED',
    winnerUserId: card.userId,
    winnerUserName: card.userName,
  });

  return { 
    success: true, 
    message: `¡BINGO VÁLIDO! ${card.userName} ha ganado la ronda.` 
  };
}
