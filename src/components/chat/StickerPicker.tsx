import React, { useState, useRef, useEffect } from 'react';
import { CRIOLLO_STICKERS, CriolloStickerDef } from '../../lib/stickers';
import { Sparkles, Upload, Wand2, Trash2, Plus, Image as ImageIcon, Video } from 'lucide-react';
import { compressAnimatedGif, compressStaticImage } from '../../lib/gifCompressor';
import { AppAlertModal, AlertType } from '../common/AppAlertModal';

interface StickerPickerProps {
  onSelectSticker: (stickerText: string, mediaUrl?: string) => void;
  onClose: () => void;
}

interface SavedSticker {
  id: string;
  title: string;
  mediaUrl: string;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  onSelectSticker,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'criollos' | 'saved'>('criollos');
  const [myStickers, setMyStickers] = useState<SavedSticker[]>([]);
  const [showMakerModal, setShowMakerModal] = useState(false);
  const [makerCaption, setMakerCaption] = useState('');
  const [makerPreviewUrl, setMakerPreviewUrl] = useState<string | null>(null);
  const [makerLoading, setMakerLoading] = useState(false);

  // Criollo Alert Modal State (replaces ugly browser alerts)
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type?: AlertType;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const makerFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved stickers from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('tupartida_my_stickers');
      if (raw) {
        setMyStickers(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const saveStickerToStorage = (sticker: SavedSticker) => {
    try {
      const updated = [sticker, ...myStickers.filter(s => s.id !== sticker.id)].slice(0, 30);
      setMyStickers(updated);
      localStorage.setItem('tupartida_my_stickers', JSON.stringify(updated));
    } catch {}
  };

  const deleteSavedSticker = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = myStickers.filter(s => s.id !== id);
    setMyStickers(updated);
    localStorage.setItem('tupartida_my_stickers', JSON.stringify(updated));
  };

  // Direct upload from device (Image or animated GIF of ANY size, auto-compressed)
  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be re-selected if desired
    e.target.value = '';

    // Validate type
    if (!file.type.startsWith('image/')) {
      setAlertState({
        isOpen: true,
        type: 'warning',
        title: '¡Formato no válido!',
        message: 'Por favor selecciona una imagen (PNG, JPG, WebP) o un GIF animado para la mesa.',
      });
      return;
    }

    // 1. If it's an animated GIF (even 5MB or 10MB!)
    if (file.type === 'image/gif') {
      try {
        setAlertState({
          isOpen: true,
          type: 'loading',
          title: 'Optimizando GIF Animado...',
          message: 'Comprimiendo fotogramas para que vuele en la mesa y en el chat en tiempo real...',
        });

        const compressedDataUrl = await compressAnimatedGif(file);

        setAlertState({ isOpen: false, title: '', message: '' });

        const newSticker: SavedSticker = {
          id: `stk_${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          mediaUrl: compressedDataUrl,
        };
        saveStickerToStorage(newSticker);
        onSelectSticker(newSticker.title, compressedDataUrl);
        onClose();
      } catch (err) {
        console.error('Error compressing GIF:', err);
        setAlertState({
          isOpen: true,
          type: 'error',
          title: 'No se pudo procesar el GIF',
          message: 'El archivo GIF parece estar dañado o tiene una estructura no estándar. Intenta con otro o con una foto.',
        });
      }
      return;
    }

    // 2. If it's a static image (PNG, JPG, WebP) of ANY size
    try {
      const compressed = await compressStaticImage(file, 220, 0.82);
      const newSticker: SavedSticker = {
        id: `stk_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        mediaUrl: compressed,
      };
      saveStickerToStorage(newSticker);
      onSelectSticker(newSticker.title, compressed);
      onClose();
    } catch (err) {
      console.error('Error compressing image:', err);
      setAlertState({
        isOpen: true,
        type: 'error',
        title: 'Error al procesar imagen',
        message: 'No pudimos optimizar la imagen seleccionada. Por favor prueba con otra.',
      });
    }
  };

  // Sticker Maker: select image or video
  const handleMakerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      // Extract video frame
      setMakerLoading(true);
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.src = URL.createObjectURL(file);

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, video.duration / 2);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, 240, 240);
        setMakerPreviewUrl(canvas.toDataURL('image/webp', 0.85));
        setMakerLoading(false);
      };
    } else {
      // Process image
      const reader = new FileReader();
      reader.onload = (evt) => {
        setMakerPreviewUrl(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Render sticker with WhatsApp white border & text caption
  const handleFinishStickerMaker = () => {
    if (!makerPreviewUrl) return;

    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 240;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw white sticker rounded background
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(8, 8, size - 16, size - 16, 24);
      ctx.fill();

      // Draw image inside with padding
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(14, 14, size - 28, size - 28, 18);
      ctx.clip();
      ctx.drawImage(img, 14, 14, size - 28, size - 28);
      ctx.restore();

      // Draw caption text if present
      if (makerCaption.trim()) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(14, size - 55, size - 28, 38);

        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'center';
        ctx.fillText(makerCaption.trim().toUpperCase(), size / 2, size - 30);
      }

      const finalStickerUrl = canvas.toDataURL('image/webp', 0.85);
      const newSticker: SavedSticker = {
        id: `stk_${Date.now()}`,
        title: makerCaption.trim() || 'Sticker Creado',
        mediaUrl: finalStickerUrl,
      };

      saveStickerToStorage(newSticker);
      onSelectSticker(newSticker.title, finalStickerUrl);
      setShowMakerModal(false);
      onClose();
    };
    img.src = makerPreviewUrl;
  };

  return (
    <div className="bg-[#171f33] border border-white/10 rounded-2xl p-3 shadow-xl flex flex-col gap-2.5 animate-fade-in relative">
      {/* Top Header & Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1 bg-[#0b1326] p-0.5 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('criollos')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'criollos'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🇻🇪 Criollos ({CRIOLLO_STICKERS.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Mis Stickers</span>
            {myStickers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9px]">
                {myStickers.length}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 flex items-center justify-center text-xs"
        >
          ✕
        </button>
      </div>

      {/* Tab 1: Criollo Animated SVG Stickers */}
      {activeTab === 'criollos' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
          {CRIOLLO_STICKERS.map((stk) => (
            <button
              key={stk.id}
              type="button"
              onClick={() => {
                onSelectSticker(stk.title, stk.svgDataUrl);
                onClose();
              }}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#0b1326] border border-white/5 hover:border-amber-400/50 hover:bg-amber-400/10 transition-all active:scale-95 group relative"
              title={stk.title}
            >
              <img
                src={stk.svgDataUrl}
                alt={stk.title}
                className="w-16 h-16 object-contain group-hover:scale-110 transition-transform drop-shadow-md"
              />
              <span className="text-[10px] font-bold text-[#dae2fd] text-center mt-1 truncate w-full">
                {stk.title}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Tab 2: User's Saved Stickers Library */}
      {activeTab === 'saved' && (
        <div className="max-h-52 overflow-y-auto pr-1">
          {myStickers.length === 0 ? (
            <div className="py-8 text-center text-zinc-400 flex flex-col items-center justify-center gap-1.5">
              <span className="text-2xl">📁</span>
              <p className="text-xs font-bold text-zinc-300">Aún no tienes stickers guardados</p>
              <p className="text-[10px] text-zinc-500">Sube imágenes, GIFs o crea uno nuevo abajo para guardarlos aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {myStickers.map((stk) => (
                <div
                  key={stk.id}
                  onClick={() => {
                    onSelectSticker(stk.title, stk.mediaUrl);
                    onClose();
                  }}
                  className="group relative flex flex-col items-center p-2 rounded-2xl bg-[#0b1326] border border-white/5 hover:border-emerald-400/50 hover:bg-emerald-400/10 cursor-pointer transition-all active:scale-95"
                >
                  <img
                    src={stk.mediaUrl}
                    alt={stk.title}
                    className="w-16 h-16 object-contain rounded-xl drop-shadow-md"
                  />
                  <span className="text-[9px] text-zinc-400 truncate w-full text-center mt-1">
                    {stk.title}
                  </span>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => deleteSavedSticker(e, stk.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] shadow-md transition-opacity"
                    title="Eliminar de mis stickers"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Footer: Subir desde dispositivo & Crear Sticker */}
      <div className="border-t border-white/5 pt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          title="Subir imagen o GIF animado desde tu dispositivo"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Subir desde tu dispositivo</span>
        </button>

        <button
          type="button"
          onClick={() => setShowMakerModal(true)}
          className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          title="Crear sticker con imagen o video"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Crear Sticker</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleDirectUpload}
        />
      </div>

      {/* Modal: Crear Sticker con Imagen o Video */}
      {showMakerModal && (
        <div className="absolute inset-0 z-50 bg-[#0b1326]/95 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between animate-fade-in border border-amber-400/40">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>Creador de Stickers</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowMakerModal(false);
                setMakerPreviewUrl(null);
                setMakerCaption('');
              }}
              className="text-zinc-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-2 my-2">
            {makerLoading ? (
              <div className="text-xs text-amber-300 font-bold animate-pulse">Procesando video...</div>
            ) : makerPreviewUrl ? (
              <div className="relative p-2 bg-white rounded-2xl shadow-xl flex flex-col items-center">
                <img
                  src={makerPreviewUrl}
                  alt="Preview"
                  className="w-28 h-28 object-contain rounded-xl"
                />
                {makerCaption && (
                  <span className="text-[10px] font-black uppercase text-amber-500 mt-1 bg-black/80 px-2 py-0.5 rounded-full">
                    {makerCaption}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-center flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => makerFileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Seleccionar Foto o Video Clip</span>
                </button>
                <span className="text-[10px] text-zinc-500">Soporta PNG, JPG, GIF y MP4</span>
              </div>
            )}

            <input
              ref={makerFileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleMakerFileSelect}
            />

            {makerPreviewUrl && (
              <div className="w-full mt-2">
                <input
                  type="text"
                  maxLength={25}
                  value={makerCaption}
                  onChange={(e) => setMakerCaption(e.target.value)}
                  placeholder="Escribe una frase (ej: ¡TRAMPA!)"
                  className="w-full bg-[#171f33] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-white/10 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowMakerModal(false);
                setMakerPreviewUrl(null);
                setMakerCaption('');
              }}
              className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-semibold"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={!makerPreviewUrl}
              onClick={handleFinishStickerMaker}
              className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-black text-xs font-black shadow-md transition-all"
            >
              Guardar y Enviar
            </button>
          </div>
        </div>
      )}

      {/* Criollo Alert Modal (Clean in-app feedback) */}
      <AppAlertModal
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
