// Pure Web Audio API Sound Synthesizer for Anti-Snooze
// Offline-first, zero-latency, realistic escalating alarm siren & challenge feedback

class SoundService {
  private ctx: AudioContext | null = null;
  private isAlarmPlaying = false;
  private alarmInterval: number | null = null;
  private escalationInterval: number | null = null;
  private currentVolume = 0.35;
  private targetMaxVolume = 0.85;
  private customAudio: HTMLAudioElement | null = null;
  private currentVolumeSetting = 80; // 0 to 100

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

  // Set base volume level (0 to 100)
  setVolume(volumePercent: number) {
    this.currentVolumeSetting = Math.max(0, Math.min(100, volumePercent));
    if (this.customAudio) {
      this.customAudio.volume = this.currentVolumeSetting / 100;
    }
  }

  getVolume() {
    return this.currentVolumeSetting;
  }

  // Play a brief single synthesized beep/tone scaled by volume setting
  playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.2) {
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const effectiveVolume = volume * (this.currentVolumeSetting / 100);
      if (effectiveVolume <= 0.001) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(effectiveVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Sound playTone error', e);
    }
  }

  // Preview a custom ringtone or built-in sound
  playPreview(soundType: 'digital' | 'siren' | 'radar' | 'custom', customDataUrl?: string) {
    this.stopAlarm();
    const effectiveVol = Math.max(0.1, (this.currentVolumeSetting / 100) * 0.4);

    if (soundType === 'custom' && customDataUrl) {
      try {
        const audio = new Audio(customDataUrl);
        audio.volume = this.currentVolumeSetting / 100;
        audio.play().catch((e) => console.warn('Audio play error', e));
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 3000);
      } catch (e) {
        console.warn('Failed previewing custom audio', e);
      }
    } else if (soundType === 'digital') {
      this.playTone(880, 0.4, 'square', 0.25);
    } else if (soundType === 'radar') {
      this.playTone(587, 0.35, 'sine', 0.3);
    } else {
      this.playTone(950, 0.4, 'sawtooth', 0.25);
    }
  }

  // Start continuous urgent alarm (built-in or custom ringtone)
  startAlarm(options?: {
    soundType?: 'digital' | 'siren' | 'radar' | 'custom';
    customDataUrl?: string;
    volume?: number;
    volumeEscalation?: boolean;
  }) {
    if (this.isAlarmPlaying) return;
    this.isAlarmPlaying = true;

    const userVol = options?.volume !== undefined ? options.volume : this.currentVolumeSetting;
    this.currentVolumeSetting = userVol;
    const volRatio = Math.max(0.05, userVol / 100);

    const shouldEscalate = options?.volumeEscalation ?? true;
    const soundType = options?.soundType || 'radar';

    // 1. Custom Ringtone via HTMLAudioElement
    if (soundType === 'custom' && options?.customDataUrl) {
      try {
        this.customAudio = new Audio(options.customDataUrl);
        this.customAudio.loop = true;
        this.customAudio.volume = shouldEscalate ? Math.min(volRatio, 0.25) : volRatio;
        this.customAudio.play().catch((err) => {
          console.warn('Custom ringtone autoplay blocked, falling back to WebAudio', err);
          this.startSynthesizedAlarm(soundType, volRatio, shouldEscalate);
        });

        if (shouldEscalate) {
          this.escalationInterval = window.setInterval(() => {
            if (this.customAudio && this.customAudio.volume < volRatio) {
              this.customAudio.volume = Math.min(volRatio, this.customAudio.volume + 0.08);
            }
          }, 3000);
        }
        return;
      } catch (e) {
        console.warn('Error loading custom audio, falling back', e);
      }
    }

    // 2. Synthesized Alarm
    this.startSynthesizedAlarm(soundType, volRatio, shouldEscalate);
  }

  private startSynthesizedAlarm(
    soundType: 'digital' | 'siren' | 'radar' | 'custom',
    volRatio: number,
    shouldEscalate: boolean
  ) {
    const ctx = this.initContext();
    if (!ctx) return;

    this.targetMaxVolume = Math.min(0.95, volRatio * 0.9);
    this.currentVolume = shouldEscalate ? Math.min(this.targetMaxVolume, volRatio * 0.4) : this.targetMaxVolume;

    let step = 0;
    const playPulse = () => {
      if (!this.isAlarmPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (soundType === 'radar') {
        // Apple Radar chime inspired (chime chord)
        osc1.type = 'sine';
        osc2.type = 'sine';
        const chordBase = step % 2 === 0 ? 587.33 : 880; // D5 / A5
        osc1.frequency.setValueAtTime(chordBase, t);
        osc2.frequency.setValueAtTime(chordBase * 1.25, t); // Major 3rd
      } else if (soundType === 'digital') {
        // Crisp digital alarm double-beep
        osc1.type = 'square';
        osc2.type = 'square';
        const beepFreq = 880;
        osc1.frequency.setValueAtTime(beepFreq, t);
        osc2.frequency.setValueAtTime(beepFreq * 2, t);
      } else {
        // Emergency siren (sawtooth + square dissonant bite)
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        const baseFreq = step % 2 === 0 ? 880 : 988;
        osc1.frequency.setValueAtTime(baseFreq, t);
        osc2.frequency.setValueAtTime(baseFreq * 1.5, t);
      }

      const pulseDuration = soundType === 'radar' ? 0.28 : 0.18;
      gain.gain.setValueAtTime(this.currentVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + pulseDuration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + pulseDuration);
      osc2.stop(t + pulseDuration);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([150, 100]);
      }

      step++;
    };

    playPulse();
    const intervalMs = soundType === 'radar' ? 550 : 400;
    this.alarmInterval = window.setInterval(playPulse, intervalMs);

    if (shouldEscalate) {
      this.escalationInterval = window.setInterval(() => {
        if (this.currentVolume < this.targetMaxVolume) {
          this.currentVolume = Math.min(this.targetMaxVolume, this.currentVolume + 0.08);
        }
      }, 3000);
    }
  }

  // Stop the alarm siren or custom ringtone
  stopAlarm() {
    this.isAlarmPlaying = false;
    if (this.customAudio) {
      try {
        this.customAudio.pause();
        this.customAudio.currentTime = 0;
      } catch (e) {
        console.warn('Error pausing custom audio', e);
      }
      this.customAudio = null;
    }
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
