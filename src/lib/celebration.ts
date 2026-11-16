import confetti from 'canvas-confetti';
import { sounds, triggerBingoWinVibrate } from './audio';

/**
 * Triggers full fireworks and confetti animation using canvas-confetti
 */
export function triggerFireworksAndConfetti() {
  const duration = 4 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 35, spread: 360, ticks: 75, zIndex: 120 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // Initial center blast
  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#fbbf24', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#ef4444'],
  });

  // Repeating firework rocket bursts from left and right
  const interval: ReturnType<typeof setInterval> = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 45 * (timeLeft / duration);

    // Left cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.35), y: Math.random() - 0.2 },
      colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6', '#ef4444'],
    });

    // Right cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.65, 0.9), y: Math.random() - 0.2 },
      colors: ['#fbbf24', '#f43f5e', '#a855f7', '#34d399', '#60a5fa', '#f97316'],
    });
  }, 280);
}

/**
 * Executes full Grand Victory Celebration:
 * 1. Synthesized Crowd Applause & Cheers + Whistle
 * 2. Firework launch whistles and deep explosions
 * 3. Phone celebration vibration rhythm
 * 4. Spectacular fireworks & confetti bursts
 */
export function triggerVictoryCelebration() {
  sounds.playApplauseAndCheer();
  sounds.playFireworkSound();
  triggerBingoWinVibrate();
  triggerFireworksAndConfetti();
}
