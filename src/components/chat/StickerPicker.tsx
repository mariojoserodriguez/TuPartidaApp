import React, { useRef } from 'react';
import { Image, Sparkles, Upload } from 'lucide-react';

interface StickerPickerProps {
  onSelectSticker: (stickerText: string, mediaUrl?: string) => void;
  onClose: () => void;
}

const CRIOLLO_STICKERS = [
  { emoji: '🫘', title: '¡Pon la caraota!', tag: 'caraota' },
  { emoji: '🌽', title: '¡Maíz pa los pollos!', tag: 'maiz' },
  { emoji: '🎯', title: '¡A tiro de BINGO!', tag: 'atiro' },
  { emoji: '😱', title: '¡No me sale ni una!', tag: 'salao' },
  { emoji: '🔥', title: '¡Pónganle azúcar al bombo!', tag: 'bombo' },
  { emoji: '🤣', title: '¡Trampa de la buena!', tag: 'trampa' },
  { emoji: '💸', title: '¡Ese premio es mío!', tag: 'premio' },
  { emoji: '☕', title: '¡Un cafecito mientras cantan!', tag: 'cafe' },
  { emoji: '🏆', title: '¡Mente de campeón!', tag: 'campeon' },
  { emoji: '🎉', title: '¡BINGO BINGO BINGO!', tag: 'bingo' },
  { emoji: '⚡', title: '¡Mueve esa bola rápido!', tag: 'rapido' },
  { emoji: '👀', title: '¡Revisen bien ese cartón!', tag: 'ojo' },
];

export const StickerPicker: React.FC<StickerPickerProps> = ({
  onSelectSticker,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Resize and compress custom sticker from player's device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 240;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Export as lightweight WebP/JPEG data URL
        const compressedBase64 = canvas.toDataURL('image/webp', 0.85);
        onSelectSticker('Sticker', compressedBase64);
        onClose();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#171f33] border border-white/10 rounded-2xl p-3 shadow-xl flex flex-col gap-2.5 animate-fade-in">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stickers Criollos de Partida</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-5 h-5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 flex items-center justify-center text-[10px]"
        >
          ✕
        </button>
      </div>

      {/* Preset Criollo Stickers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
        {CRIOLLO_STICKERS.map((stk, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              onSelectSticker(stk.title);
              onClose();
            }}
            className="flex items-center gap-2 p-2 rounded-xl bg-[#0b1326] border border-white/5 hover:border-amber-400/40 hover:bg-amber-400/10 text-left transition-all active:scale-95 group"
          >
            <span className="text-xl group-hover:scale-125 transition-transform">{stk.emoji}</span>
            <span className="text-[11px] font-bold text-[#dae2fd] leading-tight line-clamp-2">
              {stk.title}
            </span>
          </button>
        ))}
      </div>

      {/* Upload Custom Sticker / GIF from phone or PC */}
      <div className="border-t border-white/5 pt-2 flex items-center justify-between">
        <span className="text-[10px] text-zinc-400">¿Tienes un sticker o meme?</span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors"
        >
          <Upload className="w-3 h-3" />
          <span>Subir de tu tlf</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};
