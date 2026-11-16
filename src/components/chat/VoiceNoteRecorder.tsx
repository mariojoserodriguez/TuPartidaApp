import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, AlertCircle } from 'lucide-react';

interface VoiceNoteRecorderProps {
  onSendVoiceNote: (audioData: string, duration: number) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onSendVoiceNote,
  onCancel,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const MAX_SECONDS = 5;

  const startRecording = async () => {
    try {
      setError(null);
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      // Prefer compressed audio codecs for ultra-lightweight Firestore payloads
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(100);
      setIsRecording(true);
      startTimeRef.current = Date.now();
      setSeconds(0);

      // 5-second countdown timer
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        if (elapsed >= MAX_SECONDS) {
          stopAndFinish(true);
        } else {
          setSeconds(Math.min(MAX_SECONDS, Math.round(elapsed)));
        }
      }, 250);

    } catch (err: unknown) {
      console.error('Microphone error:', err);
      setError('Permiso de micrófono denegado');
      setIsRecording(false);
    }
  };

  const stopAndFinish = (send = true) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const duration = Math.min(MAX_SECONDS, Math.max(1, (Date.now() - startTimeRef.current) / 1000));
    setIsRecording(false);

    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      if (!send) onCancel();
      return;
    }

    mediaRecorderRef.current.onstop = () => {
      // Stop all tracks
      mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());

      if (send && chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0].type || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onSendVoiceNote(base64, duration);
        };
        reader.readAsDataURL(blob);
      } else {
        onCancel();
      }
    };

    mediaRecorderRef.current.stop();
  };

  const cancelRecording = () => {
    stopAndFinish(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 px-2 py-1 rounded-xl">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{error}</span>
        <button onClick={onCancel} className="text-zinc-400 hover:text-white text-[10px] underline ml-1">Cerrar</button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center justify-between gap-2 w-full bg-rose-950/70 border border-rose-500/40 rounded-2xl px-3 py-1.5 animate-pulse">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-bold text-rose-200 font-['Space_Grotesk']">
            Grabando {seconds}s / {MAX_SECONDS}s
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cancelRecording}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-900 text-zinc-300 hover:text-white transition-colors"
            title="Cancelar nota de voz"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
          </button>

          <button
            type="button"
            onClick={() => stopAndFinish(true)}
            className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1 shadow-md"
            title="Enviar nota de voz"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      disabled={disabled}
      className="p-2.5 rounded-2xl bg-white/5 hover:bg-indigo-600/40 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 hover:text-indigo-300 transition-all flex items-center justify-center active:scale-95"
      title="Grabar micro nota de voz (máx 5s)"
    >
      <Mic className="w-4 h-4" />
    </button>
  );
};
