/**
 * Multiplatform share utility:
 * - On Mobile (Android/iOS): Uses native Web Share API (navigator.share) to show
 *   the phone's app chooser (WhatsApp, Telegram, SMS, Instagram, etc.)
 * - On Desktop / PC: Copies the link & invite message to clipboard and returns status.
 */
export async function shareInvite(params: {
  title: string;
  text: string;
  url: string;
}): Promise<{ method: 'native' | 'clipboard'; success: boolean }> {
  // Mobile Native Share Check
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    navigator.canShare &&
    navigator.canShare({ url: params.url })
  ) {
    try {
      await navigator.share({
        title: params.title,
        text: params.text,
        url: params.url,
      });
      return { method: 'native', success: true };
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        // User dismissed the native dialog
        return { method: 'native', success: true };
      }
      // If error, fall through to clipboard
    }
  }

  // Desktop / Fallback: Copy to Clipboard
  try {
    const fullText = `${params.text}\n${params.url}`;
    await navigator.clipboard.writeText(fullText);
    return { method: 'clipboard', success: true };
  } catch {
    return { method: 'clipboard', success: false };
  }
}

/**
 * Direct WhatsApp Web / App opener for users who specifically request WhatsApp
 */
export function openWhatsAppDirect(text: string) {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
