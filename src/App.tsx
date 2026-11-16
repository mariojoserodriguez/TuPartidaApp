import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginAsGuest, loginWithGoogle, logoutUser } from './lib/firebase';
import { 
  Room, 
  BingoCard, 
  MarkerType, 
  GameType, 
  GameMode, 
  BingoCardsPolicy, 
  BingoWinningPattern 
} from './types';
import { 
  createRoom, 
  getRoomByPin, 
  subscribeToRoom, 
  subscribeToPlayerCards, 
  subscribeToHostedRooms,
  generatePlayerCards,
  getPlayerCards 
} from './lib/roomService';
import { Header } from './components/Header';
import { HubMenu } from './components/HubMenu';
import { BingoHostView } from './components/BingoHostView';
import { BingoPlayerView } from './components/BingoPlayerView';
import { RaffleView } from './components/RaffleView';

type ViewMode = 'HUB' | 'BINGO_HOST' | 'BINGO_PLAYER' | 'RAFFLE';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [guestName, setGuestName] = useState<string>(() => {
    return localStorage.getItem('tupartida_guest_name') || 'Jugador Criollo';
  });
  const [selectedMarker, setSelectedMarker] = useState<MarkerType>(() => {
    return (localStorage.getItem('tupartida_marker') as MarkerType) || 'CARAOTA';
  });

  const [currentView, setCurrentView] = useState<ViewMode>('HUB');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [playerCards, setPlayerCards] = useState<BingoCard[]>([]);
  const [hostedRooms, setHostedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Set up Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Auto sign-in as anonymous guest for zero-friction entry
        try {
          const guestUser = await loginAsGuest(guestName);
          setUser(guestUser);
        } catch {
          // In case auth is pending setup
        }
      }
    });
    return () => unsubscribe();
  }, [guestName]);

  // Check URL query parameters for ?pin=123456 (WhatsApp share auto-join)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pin = params.get('pin');
    if (pin && user) {
      handleJoinByPin(pin);
    }
  }, [user]);

  // Subscribe to active room changes
  useEffect(() => {
    if (!activeRoom?.id) return;
    const unsub = subscribeToRoom(activeRoom.id, (updatedRoom) => {
      if (updatedRoom) {
        setActiveRoom(updatedRoom);
      } else {
        // Room was closed or deleted
        setActiveRoom(null);
        setCurrentView('HUB');
      }
    });
    return () => unsub();
  }, [activeRoom?.id]);

  // Subscribe to player's cards in the active room
  useEffect(() => {
    if (!activeRoom?.id || !user?.uid) return;
    const unsub = subscribeToPlayerCards(activeRoom.id, user.uid, (cards) => {
      setPlayerCards(cards);
    });
    return () => unsub();
  }, [activeRoom?.id, user?.uid]);

  // Subscribe to rooms created by this user
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToHostedRooms(user.uid, (rooms) => {
      setHostedRooms(rooms);
    });
    return () => unsub();
  }, [user?.uid]);

  const handleSelectMarker = (marker: MarkerType) => {
    setSelectedMarker(marker);
    localStorage.setItem('tupartida_marker', marker);
  };

  const handleJoinByPin = async (pin: string) => {
    setLoading(true);
    setErrorToast(null);
    try {
      const room = await getRoomByPin(pin);
      if (!room) {
        setErrorToast('No encontramos ninguna sala con ese código PIN.');
        setLoading(false);
        return;
      }

      setActiveRoom(room);
      const isHost = user?.uid === room.hostId;

      if (room.gameType === 'RAFFLE') {
        setCurrentView('RAFFLE');
      } else if (isHost) {
        setCurrentView('BINGO_HOST');
      } else {
        // Only generate card if player does not have any cards in this room
        if (user) {
          const existing = await getPlayerCards(room.id, user.uid);
          if (existing.length === 0) {
            await generatePlayerCards(room.id, user.uid, guestName, 1);
          }
        }
        setCurrentView('BINGO_PLAYER');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorToast(error.message || 'Error al entrar a la sala.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (params: {
    title: string;
    gameType: GameType;
    mode: GameMode;
    cardsPolicy: BingoCardsPolicy;
    winningPattern: BingoWinningPattern;
    pricePerCard?: number;
    targetAmount?: number;
    causeDescription?: string;
  }) => {
    if (!user) return;
    setLoading(true);
    try {
      const newRoom = await createRoom({
        hostId: user.uid,
        hostName: user.displayName || guestName,
        gameType: params.gameType,
        mode: params.mode,
        title: params.title,
        cardsPolicy: params.cardsPolicy,
        winningPattern: params.winningPattern,
        pricePerCard: params.pricePerCard,
        targetAmount: params.targetAmount,
        causeDescription: params.causeDescription,
      });

      setActiveRoom(newRoom);
      if (params.gameType === 'RAFFLE') {
        setCurrentView('RAFFLE');
      } else {
        setCurrentView('BINGO_HOST');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorToast(error.message || 'Error al crear la sala.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextRound = async () => {
    if (!activeRoom) return;
    // Next round logic
    setActiveRoom({
      ...activeRoom,
      currentRound: activeRoom.currentRound + 1,
      drawnNumbers: [],
      lastDrawnNumber: undefined,
      status: 'LOBBY',
      winnerUserId: undefined,
      winnerUserName: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col">
      <Header
        user={user}
        guestName={guestName}
        selectedMarker={selectedMarker}
        onSelectMarker={handleSelectMarker}
        onUpdateGuestName={(name) => setGuestName(name)}
        onLogin={loginWithGoogle}
        onLogout={logoutUser}
        onGoHome={() => setCurrentView('HUB')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-20 pb-8 flex flex-col">
        {/* Error Toast */}
        {errorToast && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-between">
            <span>{errorToast}</span>
            <button onClick={() => setErrorToast(null)} className="text-sm">✕</button>
          </div>
        )}

        {/* View Router */}
        {currentView === 'HUB' && (
          <HubMenu
            userName={user?.displayName || guestName}
            hostedRooms={hostedRooms}
            onSelectHostedRoom={(room) => {
              setActiveRoom(room);
              if (room.gameType === 'RAFFLE') {
                setCurrentView('RAFFLE');
              } else {
                setCurrentView('BINGO_HOST');
              }
            }}
            onJoinByPin={handleJoinByPin}
            onCreateRoom={handleCreateRoom}
            onSelectGameDirect={(type) => {
              if (type === 'RAFFLE') {
                handleCreateRoom({
                  title: 'Gran Rifa Comunitaria',
                  gameType: 'RAFFLE',
                  mode: 'PRO_FONDOS',
                  cardsPolicy: 'REUSABLE',
                  winningPattern: 'LINE',
                  pricePerCard: 1,
                });
              }
            }}
          />
        )}

        {currentView === 'BINGO_HOST' && activeRoom && (
          <BingoHostView
            room={activeRoom}
            onLeave={() => setCurrentView('HUB')}
            onNextRound={handleNextRound}
          />
        )}

        {currentView === 'BINGO_PLAYER' && activeRoom && user && (
          <BingoPlayerView
            room={activeRoom}
            cards={playerCards}
            userId={user.uid}
            userName={user.displayName || guestName}
            selectedMarker={selectedMarker}
            onLeave={() => setCurrentView('HUB')}
          />
        )}

        {currentView === 'RAFFLE' && activeRoom && user && (
          <RaffleView
            room={activeRoom}
            userId={user.uid}
            isHost={user.uid === activeRoom.hostId}
            onLeave={() => setCurrentView('HUB')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
