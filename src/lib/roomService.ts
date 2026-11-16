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
  addDoc,
  deleteField
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
  callerVoiceGender?: 'female' | 'male';
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
      callerVoiceGender: params.callerVoiceGender || 'female',
      pricePerCard: params.pricePerCard || 0,
      targetAmount: params.targetAmount || 0,
      causeDescription: params.causeDescription || '',
      paymentInfo: params.paymentInfo || {},
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
 * Real-time listener for rooms hosted by the user
 */
export function subscribeToHostedRooms(userId: string, onUpdate: (rooms: Room[]) => void) {
  const q = query(collection(db, 'rooms'), where('hostId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const rooms: Room[] = [];
    snapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() } as Room);
    });
    // Sort by createdAt descending
    rooms.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    onUpdate(rooms);
  });
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

  // Query existing cards count so card numbers are sequential (#1, #2, #3...)
  const existingSnap = await getDocs(
    query(cardsCol, where('userId', '==', userId))
  );
  const existingCount = existingSnap.size;

  for (let i = 0; i < count; i++) {
    const cardData: Omit<BingoCard, 'id'> = {
      roomId,
      userId,
      userName,
      cardIndex: existingCount + i + 1,
      matrix: generateBingoMatrix(),
      marked: Array(25).fill(false),
      isWinner: false,
    };
    // Center is free (index 12: row 2, col 2)
    cardData.marked[12] = true;

    const docRef = await addDoc(cardsCol, cardData);
    cards.push({ id: docRef.id, ...cardData });
  }

  return cards;
}

/**
 * Gets existing cards for a player in a room
 */
export async function getPlayerCards(roomId: string, userId: string): Promise<BingoCard[]> {
  const q = query(
    collection(db, 'rooms', roomId, 'cards'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  const cards: BingoCard[] = [];
  snap.forEach((doc) => {
    cards.push({ id: doc.id, ...doc.data() } as BingoCard);
  });
  cards.sort((a, b) => a.cardIndex - b.cardIndex);
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
  card: BingoCard,
  claimerName?: string
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
      message: '¡Atención! Aún no completas el patrón de la ronda. Revisa bien las bolas cantadas.' 
    };
  }

  const winningName = claimerName?.trim() || card.userName || 'Jugador Criollo';

  // Valid winner! Update room status
  const roomRef = doc(db, 'rooms', room.id);
  await updateDoc(roomRef, {
    status: 'FINISHED',
    winnerUserId: card.userId,
    winnerUserName: winningName,
  });

  return { 
    success: true, 
    message: `¡BINGO VÁLIDO! ${winningName} ha ganado la ronda.` 
  };
}

/**
 * Updates caller voice gender (female vs male)
 */
export async function updateCallerVoiceGender(
  roomId: string, 
  callerVoiceGender: 'female' | 'male'
): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    'config.callerVoiceGender': callerVoiceGender,
  });
}

/**
 * Updates winning pattern for the room
 */
export async function updateRoomWinningPattern(
  roomId: string,
  winningPattern: BingoWinningPattern
): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    'config.winningPattern': winningPattern,
  });
}

/**
 * Updates host display name on the room
 */
export async function updateRoomHostName(
  roomId: string,
  hostName: string
): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    hostName: hostName.trim(),
  });
}

/**
 * Updates player name across all their cards in a room
 */
export async function updatePlayerCardsUserName(
  roomId: string, 
  userId: string, 
  newUserName: string
): Promise<void> {
  try {
    const cardsCol = collection(db, 'rooms', roomId, 'cards');
    const q = query(cardsCol, where('userId', '==', userId));
    const snap = await getDocs(q);
    const updates = snap.docs.map((docSnap) => 
      updateDoc(doc(cardsCol, docSnap.id), { userName: newUserName.trim() })
    );
    await Promise.all(updates);
  } catch (err) {
    console.error('Error updating player cards user name:', err);
  }
}

/**
 * Advances to the next round in the room, resetting the bombo
 * and optionally setting the new winning pattern
 */
export async function startNextRound(
  roomId: string, 
  currentRound: number,
  winningPattern?: BingoWinningPattern
): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  const updateData: Record<string, unknown> = {
    currentRound: currentRound + 1,
    drawnNumbers: [],
    lastDrawnNumber: deleteField(),
    status: 'LOBBY',
    winnerUserId: deleteField(),
    winnerUserName: deleteField(),
  };

  if (winningPattern) {
    updateData['config.winningPattern'] = winningPattern;
  }

  await updateDoc(roomRef, updateData);
}

/**
 * Closes / marks room game session as finished
 */
export async function finishRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    status: 'FINISHED',
  });
}
