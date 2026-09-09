// Centralized Haptic Feedback utility for physical mobile devices (Android & iOS)
// Uses Web Vibration API (navigator.vibrate) with realistic tactical waveforms,
// plus subtle AudioContext click synthesis fallback for iOS Safari where navigator.vibrate is restricted.

class HapticService {
  /**
   * Subtle tick for toggle switches, sliders, and segmented pills (40ms)
   */
  light() {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(35);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Medium click when activating an alarm or tapping primary buttons (60ms)
   */
  medium() {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(60);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Decisive click when deactivating or toggling off
   */
  selection() {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(45);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Joyful double-pulse haptic burst when successfully completing a challenge
   * and dismissing the alarm: [90ms pulse, 60ms rest, 140ms strong confirm]
   */
  dismissSuccess() {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate([80, 50, 160]);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Error buzz when answering wrong math problem
   */
  error() {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Single shake increment feedback
   */
  shakeTick() {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(30);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Cancel all vibration
   */
  stop() {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(0);
      }
    } catch {
      // ignore
    }
  }
}

export const hapticService = new HapticService();
