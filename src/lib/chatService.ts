import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatMessage, ChatMessageType } from '../types';

/**
 * Sends a message in the room chat
 */
export async function sendChatMessage(params: {
  roomId: string;
  userId: string;
  userName: string;
  type: ChatMessageType;
  text?: string;
  mediaUrl?: string;
  audioData?: string;
  audioDuration?: number;
  system?: boolean;
}): Promise<void> {
  const messagesCol = collection(db, 'rooms', params.roomId, 'messages');
  
  const msgData: Record<string, unknown> = {
    roomId: params.roomId,
    userId: params.userId,
    userName: params.userName,
    type: params.type,
    createdAt: Date.now(),
  };

  if (params.text) msgData.text = params.text.trim();
  if (params.mediaUrl) msgData.mediaUrl = params.mediaUrl;
  if (params.audioData) msgData.audioData = params.audioData;
  if (params.audioDuration !== undefined) msgData.audioDuration = params.audioDuration;
  if (params.system) msgData.system = true;

  await addDoc(messagesCol, msgData);
}

/**
 * Real-time listener for messages in a room (latest 100 messages)
 */
export function subscribeToRoomMessages(
  roomId: string, 
  onUpdate: (messages: ChatMessage[]) => void
) {
  const q = query(
    collection(db, 'rooms', roomId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const list: ChatMessage[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as ChatMessage);
    });
    onUpdate(list);
  });
}

/**
 * Moderation: Delete a message (Host or author)
 */
export async function deleteChatMessage(roomId: string, messageId: string): Promise<void> {
  const msgRef = doc(db, 'rooms', roomId, 'messages', messageId);
  await deleteDoc(msgRef);
}

/**
 * Host Moderation: Toggle room chat settings
 */
export async function updateRoomChatModeration(
  roomId: string, 
  settings: { chatEnabled?: boolean; voiceNotesEnabled?: boolean }
): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  const updateData: Record<string, unknown> = {};
  if (settings.chatEnabled !== undefined) {
    updateData['config.chatEnabled'] = settings.chatEnabled;
  }
  if (settings.voiceNotesEnabled !== undefined) {
    updateData['config.voiceNotesEnabled'] = settings.voiceNotesEnabled;
  }
  await updateDoc(roomRef, updateData);
}
