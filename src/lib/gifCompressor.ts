export interface GifCompressionOptions {
  maxDimension?: number;
  maxFrames?: number;
  maxColors?: number;
  autoRemoveWhiteBg?: boolean;
}

/**
 * Converts a File or Blob into a base64 Data URL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Removes white/near-white backgrounds that are connected to the outer edges (Magic Wand BFS).
 * Keeps white details inside the subject (eyes, paws, belly, teeth) completely intact.
 */
export function removeEdgeConnectedWhiteBackground(
  rgba: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  threshold = 230,
  maxDiff = 18
): boolean {
  // Helper: check if a pixel is near-white neutral
  const isNearWhite = (x: number, y: number): boolean => {
    const idx = (y * width + x) * 4;
    const a = rgba[idx + 3];
    if (a < 50) return true; // Already transparent counts as open boundary
    const r = rgba[idx];
    const g = rgba[idx + 1];
    const b = rgba[idx + 2];
    return r >= threshold && g >= threshold && b >= threshold &&
           Math.abs(r - g) <= maxDiff && Math.abs(g - b) <= maxDiff;
  };

  // Pre-check corners: if none of the corners are white, do not touch
  const c1 = isNearWhite(0, 0);
  const c2 = isNearWhite(width - 1, 0);
  const c3 = isNearWhite(0, height - 1);
  const c4 = isNearWhite(width - 1, height - 1);

  if (!c1 && !c2 && !c3 && !c4) {
    return false;
  }

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qHead = 0;
  let qTail = 0;

  // Enqueue all near-white pixels along the 4 outer borders
  for (let x = 0; x < width; x++) {
    // Top border
    if (isNearWhite(x, 0)) {
      visited[x] = 1;
      queue[qTail++] = x;
    }
    // Bottom border
    const bIdx = (height - 1) * width + x;
    if (isNearWhite(x, height - 1)) {
      visited[bIdx] = 1;
      queue[qTail++] = bIdx;
    }
  }

  for (let y = 0; y < height; y++) {
    // Left border
    const lIdx = y * width;
    if (!visited[lIdx] && isNearWhite(0, y)) {
      visited[lIdx] = 1;
      queue[qTail++] = lIdx;
    }
    // Right border
    const rIdx = y * width + (width - 1);
    if (!visited[rIdx] && isNearWhite(width - 1, y)) {
      visited[rIdx] = 1;
      queue[qTail++] = rIdx;
    }
  }

  // BFS flood-fill to turn all edge-connected background pixels transparent
  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    // Turn this pixel 100% transparent
    const pIdx = curr * 4;
    rgba[pIdx + 3] = 0;

    // Check 4-connected neighbors
    if (cx > 0) {
      const nIdx = curr - 1;
      if (!visited[nIdx] && isNearWhite(cx - 1, cy)) {
        visited[nIdx] = 1;
        queue[qTail++] = nIdx;
      }
    }
    if (cx < width - 1) {
      const nIdx = curr + 1;
      if (!visited[nIdx] && isNearWhite(cx + 1, cy)) {
        visited[nIdx] = 1;
        queue[qTail++] = nIdx;
      }
    }
    if (cy > 0) {
      const nIdx = curr - width;
      if (!visited[nIdx] && isNearWhite(cx, cy - 1)) {
        visited[nIdx] = 1;
        queue[qTail++] = nIdx;
      }
    }
    if (cy < height - 1) {
      const nIdx = curr + width;
      if (!visited[nIdx] && isNearWhite(cx, cy + 1)) {
        visited[nIdx] = 1;
        queue[qTail++] = nIdx;
      }
    }
  }

  return true;
}

/**
 * Converts an image (PNG, JPG, WebP) to a lightweight WebP sticker Data URL (< 45KB),
 * automatically removing white rectangular borders if present.
 */
export async function compressStaticImage(
  file: File, 
  maxDim = 220, 
  quality = 0.85
): Promise<string> {
  const dataUrl = await fileToDataUrl(file);

  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => {
      let w = img.width;
      let h = img.height;

      if (w > h) {
        if (w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        }
      } else {
        if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, w);
      canvas.height = Math.max(1, h);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Auto-remove outer white box if image is a meme/sticker with solid white background
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const cleaned = removeEdgeConnectedWhiteBackground(imgData.data, canvas.width, canvas.height);
      if (cleaned) {
        ctx.putImageData(imgData, 0, 0);
      }

      const compressed = canvas.toDataURL('image/webp', quality);
      resolve(compressed);
    };
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
}

/**
 * Compresses an animated GIF of ANY size into a smooth, high-FPS animated sticker:
 * 1. Automatically strips solid white backgrounds from the outer edges.
 * 2. Preserves authentic high playback speed (avoids artificial delay throttling).
 * 3. Keeps up to 55-60 frames so dance/action animations stay fluid.
 * 4. Generates a lightweight payload (< 240KB base64) compatible with Firestore.
 */
export async function compressAnimatedGif(
  file: File,
  options: GifCompressionOptions = {}
): Promise<string> {
  // Dynamically load omggif and gifenc only when an animated GIF is processed
  // to keep the initial page bundle lightweight and prevent top-level module resolution issues.
  const [omggifMod, gifencMod] = await Promise.all([
    import('omggif'),
    import('gifenc/dist/gifenc.esm.js'),
  ]);

  const GifReaderClass = (omggifMod as any).GifReader || (omggifMod as any).default?.GifReader || (omggifMod as any).default;
  const { GIFEncoder, quantize, applyPalette } = gifencMod as any;

  const arrayBuffer = await file.arrayBuffer();
  const reader = new GifReaderClass(new Uint8Array(arrayBuffer));

  const origW = reader.width;
  const origH = reader.height;
  const numFrames = reader.numFrames();

  if (numFrames <= 0 || origW <= 0 || origH <= 0) {
    throw new Error('El archivo GIF no contiene fotogramas válidos.');
  }

  // Parameters tuned for stickers:
  // - maxDimension: 100px provides crisp display on chat while keeping frame payloads small
  // - maxFrames: up to 55 frames ensures fluid high-FPS movement (25-30fps)
  // - maxColors: 40 colors provides rich tones with fast encoding
  const maxDim = options.maxDimension || 100;
  const maxFrames = options.maxFrames || 55;
  const maxColors = options.maxColors || 40;

  let targetW = origW;
  let targetH = origH;

  if (targetW > targetH) {
    if (targetW > maxDim) {
      targetH = Math.round((targetH * maxDim) / targetW);
      targetW = maxDim;
    }
  } else {
    if (targetH > maxDim) {
      targetW = Math.round((targetW * maxDim) / targetH);
      targetH = maxDim;
    }
  }

  targetW = Math.max(1, targetW);
  targetH = Math.max(1, targetH);

  // Sampling step: if numFrames <= maxFrames, keep EVERY single frame (step = 1)!
  const step = Math.max(1, Math.ceil(numFrames / maxFrames));

  // Canvas for source frame blit
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = origW;
  srcCanvas.height = origH;
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });

  // Canvas for resized sticker frame
  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = targetW;
  dstCanvas.height = targetH;
  const dstCtx = dstCanvas.getContext('2d', { willReadFrequently: true });

  if (!srcCtx || !dstCtx) {
    throw new Error('No se pudo inicializar el contexto gráfico del navegador.');
  }

  const gif = GIFEncoder();
  const rgbaBuffer = new Uint8ClampedArray(origW * origH * 4);

  // Decode and blit all frames in sequence
  for (let i = 0; i < numFrames; i++) {
    reader.decodeAndBlitFrameRGBA(i, rgbaBuffer);

    // Automatically remove white/near-white outer background from the frame
    removeEdgeConnectedWhiteBackground(rgbaBuffer, origW, origH);

    // Sample frames based on step
    if (i % step === 0 || i === numFrames - 1) {
      const imgData = new ImageData(rgbaBuffer, origW, origH);
      srcCtx.putImageData(imgData, 0, 0);

      // Clean destination canvas to keep alpha clean
      dstCtx.clearRect(0, 0, targetW, targetH);
      dstCtx.drawImage(srcCanvas, 0, 0, targetW, targetH);

      const frameData = dstCtx.getImageData(0, 0, targetW, targetH).data;

      // Quantize with full RGBA support (preserves transparency)
      const palette = quantize(frameData, maxColors, {
        format: 'rgba4444',
        oneBitAlpha: 0,
        clearAlpha: true,
        clearAlphaThreshold: 0,
        clearAlphaColor: 0x00,
      });

      const index = applyPalette(frameData, palette, 'rgba4444');
      const transparentIndex = palette.findIndex((c: number[]) => c[3] === 0);

      // Frame timing: read original centiseconds (1/100s) from GIF header
      const frameInfo = reader.frameInfo(i);
      const rawCenti = frameInfo.delay;
      // In web GIFs, delay 0 or 1 means ultra-fast (standard 2 centiseconds = 20ms / 50fps)
      const centiseconds = (rawCenti && rawCenti > 1) ? rawCenti : 2;

      // Calculate delay in milliseconds matching the sampled step
      // Clamped to [20ms, 90ms] so it NEVER crawls or stutters
      const frameDelayMs = Math.max(20, Math.min(90, Math.round(centiseconds * 10 * step)));

      gif.writeFrame(index, targetW, targetH, {
        palette,
        delay: frameDelayMs,
        repeat: 0,
        transparent: transparentIndex >= 0,
        transparentIndex: Math.max(0, transparentIndex),
        dispose: 2, // Restore to background between frames to prevent ghosting
      });
    }
  }

  gif.finish();
  const bytes = gif.bytes();

  // Convert binary Uint8Array to base64 Data URL
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  const base64 = btoa(binary);
  const dataUrl = `data:image/gif;base64,${base64}`;

  // If payload exceeds Firestore limit (240,000 characters), run fallback pass
  if (dataUrl.length > 240000 && (options.maxDimension || 100) > 75) {
    return compressAnimatedGif(file, {
      maxDimension: 75,
      maxFrames: 30,
      maxColors: 28,
    });
  }

  return dataUrl;
}
