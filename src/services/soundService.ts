// Pure Web Audio API Sound Synthesizer for Anti-Snooze
// Offline-first, zero-latency, realistic escalating alarm siren & challenge feedback

class SoundService {
  private ctx: AudioContext | null = null;
  private isAlarmPlaying = false;
  private alarmInterval: number | null = null;
  private escalationInterval: number | null = null;
  private currentVolume = 0.3;
  private gainNode: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a brief single synthesized beep/tone
  playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.2) {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Sound playTone error', e);
    }
  }

  // Start continuous urgent escalating alarm siren
  startAlarm() {
    if (this.isAlarmPlaying) return;
    this.isAlarmPlaying = true;
    this.currentVolume = 0.35;

    const ctx = this.initContext();
    if (!ctx) return;

    // Pulse pattern: Beep-Beep-Beep-Pause
    let step = 0;
    const playPulse = () => {
      if (!this.isAlarmPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      
      // Dual oscillator for alarming dissonance (800Hz + 860Hz)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      // Pitch shifts slightly each beat
      const baseFreq = step % 2 === 0 ? 880 : 988;
      osc1.frequency.setValueAtTime(baseFreq, t);
      osc2.frequency.setValueAtTime(baseFreq * 1.5, t);

      const pulseDuration = 0.18;
      gain.gain.setValueAtTime(this.currentVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + pulseDuration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + pulseDuration);
      osc2.stop(t + pulseDuration);

      // Trigger mobile vibration if available
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([150, 100]);
      }

      step++;
    };

    // Play immediately, then repeat rapid bursts
    playPulse();
    this.alarmInterval = window.setInterval(playPulse, 400);

    // Volume escalates every 3 seconds up to max 0.85
    this.escalationInterval = window.setInterval(() => {
      if (this.currentVolume < 0.85) {
        this.currentVolume = Math.min(0.85, this.currentVolume + 0.08);
      }
    }, 3000);
  }

  // Stop the alarm siren
  stopAlarm() {
    this.isAlarmPlaying = false;
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (this.escalationInterval !== null) {
      clearInterval(this.escalationInterval);
      this.escalationInterval = null;
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(0);
    }
  }

  // Keypad click for math challenge
  playKeyClick() {
    this.playTone(600, 0.04, 'sine', 0.12);
  }

  // Correct answer / shake increment sound
  playCorrect() {
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.12); // E5
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Error buzz for incorrect math answer
  playError() {
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.setValueAtTime(130, t + 0.08);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  // Success fanfare when alarm is dismissed
  playSuccess() {
    const ctx = this.initContext();
    if (!ctx) return;
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      }, idx * 90);
    });
  }
}

export const soundService = new SoundService();
