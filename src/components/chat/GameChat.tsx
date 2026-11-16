import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../../types';
import { 
  sendChatMessage, 
  subscribeToRoomMessages, 
  deleteChatMessage, 
  updateRoomChatModeration 
} from '../../lib/chatService';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';
import { StickerPicker } from './StickerPicker';
import { 
  MessageSquare, 
  X, 
  Send, 
  Smile, 
  Shield, 
  Trash2, 
  Check, 
  VolumeX, 
  Volume2, 
  Sparkles,
  Users
} from 'lucide-react';

export interface GameChatProps {
  roomId: string;
  userId: string;
  userName: string;
  isHost: boolean;
  chatEnabled?: boolean;
  voiceNotesEnabled?: boolean;
}

export const GameChat: React.FC<GameChatProps> = ({
  roomId,
  userId,
  userName,
  isHost,
  chatEnabled = true,
  voiceNotesEnabled = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesCountRef = useRef(0);

  // Subscribe to real-time chat messages
  useEffect(() => {
    const unsubscribe = subscribeToRoomMessages(roomId, (list) => {
      setMessages(list);

      // Manage unread count when chat drawer is closed
      if (!isOpen && list.length > prevMessagesCountRef.current) {
        setUnreadCount((prev) => prev + (list.length - prevMessagesCountRef.current));
      }
      prevMessagesCountRef.current = list.length;
    });

    return () => unsubscribe();
  }, [roomId, isOpen]);

  // Reset unread count when user opens chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen]);

  // Scroll to latest message
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    await sendChatMessage({
      roomId,
      userId,
      userName,
      type: 'text',
      text: textToSend,
    });
  };

  const handleSendSticker = async (stickerText: string, mediaUrl?: string) => {
    await sendChatMessage({
      roomId,
      userId,
      userName,
      type: 'sticker',
      text: stickerText,
      mediaUrl,
    });
  };

  const handleSendVoiceNote = async (audioData: string, duration: number) => {
    await sendChatMessage({
      roomId,
      userId,
      userName,
      type: 'audio',
      audioData,
      audioDuration: duration,
    });
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteChatMessage(roomId, messageId);
  };

  const handleToggleChat = async () => {
    await updateRoomChatModeration(roomId, { chatEnabled: !chatEnabled });
  };

  const handleToggleVoiceNotes = async () => {
    await updateRoomChatModeration(roomId, { voiceNotesEnabled: !voiceNotesEnabled });
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* 1. Floating Circular WhatsApp-style Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-40 p-3.5 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
          title="Abrir Chat de la Partida"
        >
          <MessageSquare className="w-6 h-6 fill-current" />
          
          {/* Unread Counter Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black font-['Space_Grotesk'] shadow-md animate-bounce ring-2 ring-[#0b1326]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* 2. Chat Slide-Over Panel / WhatsApp Group View */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#0b1326] border-l border-white/10 shadow-2xl flex flex-col animate-slide-left">
          {/* Header */}
          <div className="p-3.5 bg-[#171f33] border-b border-white/10 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-base font-bold shadow-sm">
                💬
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-['Outfit'] flex items-center gap-1.5 leading-none">
                  <span>Chat de la Partida</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <span className="text-[10px] text-zinc-400 mt-1 inline-block">
                  {chatEnabled ? 'En vivo con la mesa' : 'Chat silenciado por el anfitrión'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Host Moderation Settings Button */}
              {isHost && (
                <button
                  type="button"
                  onClick={() => setShowModeration(!showModeration)}
                  className={`p-2 rounded-xl transition-colors ${
                    showModeration 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                  }`}
                  title="Moderar Chat"
                >
                  <Shield className="w-4 h-4" />
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Host Moderation Panel Dropdown */}
          {isHost && showModeration && (
            <div className="bg-[#131b2e] border-b border-amber-500/30 p-3 flex flex-col gap-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span>🛡️ Moderación del Anfitrión</span>
                <span className="text-[10px] text-zinc-400">Control de la sala</span>
              </div>

              <div className="flex items-center justify-between bg-[#0b1326] p-2 rounded-xl border border-white/5">
                <span className="text-xs text-white">Chat general activo</span>
                <button
                  type="button"
                  onClick={handleToggleChat}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chatEnabled 
                      ? 'bg-emerald-500 text-black' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {chatEnabled ? 'Activado' : 'Silenciado'}
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#0b1326] p-2 rounded-xl border border-white/5">
                <span className="text-xs text-white">Notas de voz (máx 5s)</span>
                <button
                  type="button"
                  onClick={handleToggleVoiceNotes}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    voiceNotesEnabled 
                      ? 'bg-emerald-500 text-black' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {voiceNotesEnabled ? 'Permitidas' : 'Bloqueadas'}
                </button>
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <span className="text-3xl mb-2">👋</span>
                <p className="text-xs font-semibold text-zinc-400">¡Sé el primero en saludar a la mesa!</p>
                <p className="text-[10px] text-zinc-500 mt-1">Escribe, manda un sticker criollo o una micro nota de voz.</p>
              </div>
            ) : (
              messages.map((m) => {
                const isSelf = m.userId === userId;

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col group ${isSelf ? 'items-end' : 'items-start'}`}
                  >
                    {/* Author Name for other participants */}
                    {!isSelf && (
                      <span className="text-[10px] font-bold text-indigo-300 ml-1 mb-0.5">
                        {m.userName}
                      </span>
                    )}

                    <div className="flex items-end gap-1.5 max-w-[85%] relative">
                      {/* Delete button (Visible for message author or host) */}
                      {(isSelf || isHost) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(m.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Eliminar mensaje"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}

                      {/* Message Bubble Body */}
                      <div
                        className={`rounded-2xl p-2.5 text-xs shadow-md ${
                          isSelf
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-xs'
                            : 'bg-[#171f33] text-[#dae2fd] border border-white/5 rounded-bl-xs'
                        }`}
                      >
                        {/* 1. Text Message */}
                        {m.type === 'text' && (
                          <p className="break-words font-medium leading-relaxed">
                            {m.text}
                          </p>
                        )}

                        {/* 2. Sticker / Image Message */}
                        {m.type === 'sticker' && (
                          <div className="flex flex-col gap-1">
                            {m.mediaUrl ? (
                              <img
                                src={m.mediaUrl}
                                alt={m.text || 'Sticker'}
                                className="max-w-[170px] max-h-[170px] rounded-xl object-contain shadow-sm"
                              />
                            ) : (
                              <div className="flex items-center gap-1.5 font-bold text-amber-200">
                                <Sparkles className="w-4 h-4" />
                                <span>{m.text}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. Audio Voice Note Message */}
                        {m.type === 'audio' && m.audioData && (
                          <VoiceNotePlayer
                            audioData={m.audioData}
                            duration={m.audioDuration}
                            isSelf={isSelf}
                          />
                        )}

                        {/* Timestamp */}
                        <div className={`text-[9px] mt-1 text-right font-['Space_Grotesk'] ${
                          isSelf ? 'text-emerald-200/80' : 'text-zinc-500'
                        }`}>
                          {formatTime(m.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sticker Drawer */}
          {showStickers && (
            <div className="p-2 border-t border-white/10 bg-[#131b2e]">
              <StickerPicker
                onSelectSticker={handleSendSticker}
                onClose={() => setShowStickers(false)}
              />
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-[#171f33] border-t border-white/10">
            {!chatEnabled && !isHost ? (
              <div className="text-center py-2 text-xs text-zinc-400 font-semibold bg-white/5 rounded-xl border border-white/5">
                🔇 El chat está silenciado temporalmente por el anfitrión.
              </div>
            ) : (
              <form onSubmit={handleSendText} className="flex items-center gap-1.5">
                {/* Sticker Drawer Toggle */}
                <button
                  type="button"
                  onClick={() => setShowStickers(!showStickers)}
                  className={`p-2.5 rounded-2xl transition-colors flex items-center justify-center ${
                    showStickers 
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                  }`}
                  title="Stickers y GIFs criollos"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Text Field */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe en la mesa..."
                  maxLength={500}
                  className="flex-1 bg-[#0b1326] border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />

                {/* 5-second Micro Voice Note Recorder */}
                {voiceNotesEnabled ? (
                  <VoiceNoteRecorder
                    onSendVoiceNote={handleSendVoiceNote}
                    onCancel={() => {}}
                    disabled={!chatEnabled && !isHost}
                  />
                ) : null}

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-30 disabled:cursor-not-allowed text-white shadow-md active:scale-95 transition-all flex items-center justify-center"
                  title="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
