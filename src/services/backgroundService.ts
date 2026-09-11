// Background Execution & Wake Lock Service for Web Anti-Snooze Alarm
// Solves browser background throttling using Web Workers, Screen Wake Lock API, and Browser Notifications

class BackgroundService {
  private wakeLockSentinel: any = null;
  private worker: Worker | null = null;
  private isKeepAwakeEnabled = true;
  private onTickCallback: (() => void) | null = null;
  private titleInterval: number | null = null;
  private originalTitle: string = document.title;

  constructor() {
    this.initWorker();
    this.setupVisibilityListener();
  }

  // 1. Initialize inline Web Worker for unthrottled background timer
  // Browsers aggressively throttle setInterval in background tabs to 1min or 0Hz.
  // Dedicated Web Workers are exempt from window visibility throttling!
  private initWorker() {
    try {
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (!timer) {
              timer = setInterval(function() {
                self.postMessage('tick');
              }, 1000);
            }
          } else if (e.data === 'stop') {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
      this.worker.onmessage = () => {
        if (this.onTickCallback) {
          this.onTickCallback();
        }
      };
      this.worker.postMessage('start');
    } catch (e) {
      console.warn('Web Worker background timer fallback to interval', e);
    }
  }

  // Register callback for every second tick (unthrottled)
  registerTick(callback: () => void) {
    this.onTickCallback = callback;
  }

  // 2. Screen Wake Lock API - prevents mobile/desktop screen from sleeping
  // This keeps the phone display awake on nightstand mode without locking the browser
  async requestWakeLock(): Promise<boolean> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        this.wakeLockSentinel.addEventListener('release', () => {
          this.wakeLockSentinel = null;
        });
        return true;
      } catch (err) {
        console.warn('Screen WakeLock error:', err);
        return false;
      }
    }
    return false;
  }

  releaseWakeLock() {
    if (this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel.release();
      } catch (e) {
        console.warn('WakeLock release error:', e);
      }
      this.wakeLockSentinel = null;
    }
  }

  isWakeLockSupported(): boolean {
    return 'wakeLock' in navigator;
  }

  hasActiveWakeLock(): boolean {
    return this.wakeLockSentinel !== null;
  }

  // Auto-reacquire wake lock when tab becomes visible again if enabled
  private setupVisibilityListener() {
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && this.isKeepAwakeEnabled) {
        await this.requestWakeLock();
      }
    });
  }

  setKeepAwake(enabled: boolean) {
    this.isKeepAwakeEnabled = enabled;
    if (enabled) {
      this.requestWakeLock();
    } else {
      this.releaseWakeLock();
    }
  }

  // 3. Browser System Notifications for Background / Minimized Tab
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // Trigger rich system notification when alarm fires while app is in background
  sendAlarmNotification(alarmLabel: string, onClick?: () => void) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification('🚨 WAKE UP! Anti-Snooze Alarm', {
          body: `${alarmLabel || 'Morning Alarm'} is ringing! Complete the challenge to dismiss.`,
          icon: '/favicon.ico',
          tag: 'anti-snooze-active-alarm',
          requireInteraction: true, // Notification stays on screen until dismissed or clicked
          silent: false,
        });

        notif.onclick = () => {
          window.focus();
          if (onClick) onClick();
          notif.close();
        };
      } catch (e) {
        console.warn('Notification trigger error:', e);
      }
    }

    // Flash browser tab title to alert user if looking at another tab
    this.startTitleFlashing();
  }

  private startTitleFlashing() {
    if (this.titleInterval) return;
    this.originalTitle = document.title;
    let toggle = false;
    this.titleInterval = window.setInterval(() => {
      document.title = toggle ? '🚨 WAKE UP! 🚨' : '⏰ ALARM RINGING! ⏰';
      toggle = !toggle;
    }, 600);
  }

  stopTitleFlashing() {
    if (this.titleInterval) {
      clearInterval(this.titleInterval);
      this.titleInterval = null;
      document.title = this.originalTitle || 'Anti-Snooze Alarm';
    }
  }
}

export const backgroundService = new BackgroundService();
