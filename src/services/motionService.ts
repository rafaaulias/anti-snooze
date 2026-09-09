// Shake Detection Service for iOS / Android mobile devices + Web browser fallback

type ShakeCallback = (count: number, delta: number) => void;

class MotionService {
  private lastX = 0;
  private lastY = 0;
  private lastZ = 0;
  private lastTime = 0;
  private shakeCount = 0;
  private callback: ShakeCallback | null = null;
  private isListening = false;
  private threshold = 14; // Acceleration delta threshold

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check for iOS 13+ permission requirement
    const dme = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (dme && typeof dme.requestPermission === 'function') {
      try {
        const state = await dme.requestPermission();
        return state === 'granted';
      } catch (e) {
        console.warn('DeviceMotionEvent permission denied or failed', e);
        return false;
      }
    }
    // Android / browsers without explicit prompt
    return true;
  }

  startListening(callback: ShakeCallback) {
    this.callback = callback;
    this.shakeCount = 0;
    this.lastTime = Date.now();

    if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
      window.addEventListener('devicemotion', this.handleMotion, false);
      this.isListening = true;
    }
  }

  stopListening() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleMotion, false);
    }
    this.isListening = false;
    this.callback = null;
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const currentTime = Date.now();
    const diffTime = currentTime - this.lastTime;

    if (diffTime > 100) {
      const diffX = acc.x - this.lastX;
      const diffY = acc.y - this.lastY;
      const diffZ = acc.z - this.lastZ;

      const speed = Math.abs(diffX + diffY + diffZ) / diffTime * 10000;

      if (speed > this.threshold * 50) {
        this.shakeCount += 1;
        if (this.callback) {
          this.callback(this.shakeCount, speed);
        }
      }

      this.lastX = acc.x;
      this.lastY = acc.y;
      this.lastZ = acc.z;
      this.lastTime = currentTime;
    }
  };

  // Manual shake simulator for browser/desktop testing
  manualShake(amount = 1) {
    this.shakeCount += amount;
    if (this.callback) {
      this.callback(this.shakeCount, 25);
    }
  }

  reset() {
    this.shakeCount = 0;
  }
}

export const motionService = new MotionService();
