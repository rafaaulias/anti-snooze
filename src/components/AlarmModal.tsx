import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alarm, ChallengeType, DayOfWeek, MathDifficulty } from '../types';
import { soundService } from '../services/soundService';
import { X, Check, Calculator, Smartphone, Bell, Vibrate, Trash2, PenLine, Zap, Flame, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alarmData: Omit<Alarm, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  initialAlarm?: Alarm | null;
  customRingtone?: { name: string; dataUrl: string } | null;
}

const REPEAT_DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'sun', label: 'S' },
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0 to 59

const ITEM_HEIGHT = 64; // height of each scroll item in px

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialAlarm,
  customRingtone,
}) => {
  // Time states
  const [hour12, setHour12] = useState<number>(6);
  const [minute, setMinute] = useState<number>(30);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  const [label, setLabel] = useState<string>('Wake Up');
  const [days, setDays] = useState<DayOfWeek[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [challengeType, setChallengeType] = useState<ChallengeType>('math');
  const [mathDifficulty, setMathDifficulty] = useState<MathDifficulty>('medium');
  const [mathProblemCount, setMathProblemCount] = useState<number>(3);
  const [shakeCountTarget, setShakeCountTarget] = useState<number>(30);

  const [vibrate, setVibrate] = useState(true);
  const [soundType, setSoundType] = useState<'radar' | 'siren' | 'digital' | 'custom'>('radar');
  const [volume, setVolume] = useState<number>(80);

  // Wheel scroll refs
  const hoursContainerRef = useRef<HTMLDivElement>(null);
  const minutesContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialTime = initialAlarm ? initialAlarm.time : '06:30';
      const [initH, initM] = initialTime.split(':').map(Number);
      const h12 = initH % 12 === 0 ? 12 : initH % 12;
      const m = initM || 0;
      const p = initH >= 12 ? 'PM' : 'AM';

      setHour12(h12);
      setMinute(m);
      setPeriod(p);
      setLabel(initialAlarm ? initialAlarm.label : 'Wake Up');
      setDays(initialAlarm ? initialAlarm.days : ['mon', 'tue', 'wed', 'thu', 'fri']);
      setChallengeType(initialAlarm ? initialAlarm.challengeType : 'math');
      setMathDifficulty(initialAlarm?.mathDifficulty || 'medium');
      setMathProblemCount(initialAlarm?.mathProblemCount || 3);
      setShakeCountTarget(initialAlarm?.shakeCountTarget || 30);
      setVolume(initialAlarm?.volume !== undefined ? initialAlarm.volume : 80);
      setSoundType(initialAlarm?.soundType || 'radar');

      // Scroll wheels to initial position after render
      setTimeout(() => {
        isProgrammaticScrollRef.current = true;
        const hIdx = HOURS.indexOf(h12);
        if (hoursContainerRef.current && hIdx >= 0) {
          hoursContainerRef.current.scrollTop = hIdx * ITEM_HEIGHT;
        }
        if (minutesContainerRef.current) {
          minutesContainerRef.current.scrollTop = m * ITEM_HEIGHT;
        }
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 100);
      }, 50);
    }
  }, [isOpen, initialAlarm]);

  // Handle Hour Scroll Snap
  const handleHoursScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current || !hoursContainerRef.current) return;
    const top = hoursContainerRef.current.scrollTop;
    const index = Math.round(top / ITEM_HEIGHT);
    if (index >= 0 && index < HOURS.length) {
      setHour12(HOURS[index]);
    }
  }, []);

  // Handle Minute Scroll Snap
  const handleMinutesScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current || !minutesContainerRef.current) return;
    const top = minutesContainerRef.current.scrollTop;
    const index = Math.round(top / ITEM_HEIGHT);
    if (index >= 0 && index < MINUTES.length) {
      setMinute(MINUTES[index]);
    }
  }, []);

  const scrollToHour = (h: number) => {
    const idx = HOURS.indexOf(h);
    if (idx >= 0 && hoursContainerRef.current) {
      isProgrammaticScrollRef.current = true;
      setHour12(h);
      hoursContainerRef.current.scrollTo({
        top: idx * ITEM_HEIGHT,
        behavior: 'smooth',
      });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 300);
    }
  };

  const scrollToMinute = (m: number) => {
    if (minutesContainerRef.current) {
      isProgrammaticScrollRef.current = true;
      setMinute(m);
      minutesContainerRef.current.scrollTo({
        top: m * ITEM_HEIGHT,
        behavior: 'smooth',
      });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 300);
    }
  };

  const toggleDay = (dayKey: DayOfWeek) => {
    if (days.includes(dayKey)) {
      setDays(days.filter((d) => d !== dayKey));
    } else {
      setDays([...days, dayKey]);
    }
  };

  const handleCycleSound = () => {
    let next: 'radar' | 'siren' | 'digital' | 'custom';
    if (soundType === 'radar') {
      next = 'siren';
      soundService.playTone(950, 0.3, 'sawtooth', 0.2);
    } else if (soundType === 'siren') {
      next = 'digital';
      soundService.playTone(880, 0.3, 'square', 0.2);
    } else if (soundType === 'digital') {
      if (customRingtone) {
        next = 'custom';
        soundService.playPreview('custom', customRingtone.dataUrl);
      } else {
        next = 'radar';
        soundService.playTone(587, 0.3, 'sine', 0.25);
      }
    } else {
      next = 'radar';
      soundService.playTone(587, 0.3, 'sine', 0.25);
    }
    setSoundType(next);
  };

  const getSoundDisplayName = () => {
    switch (soundType) {
      case 'radar':
        return 'Radar Chime';
      case 'siren':
        return 'Emergency Siren';
      case 'digital':
        return 'Digital Clock';
      case 'custom':
        return customRingtone ? customRingtone.name : 'Custom Ringtone';
      default:
        return 'Radar Chime';
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
  };

  const handleVolumeMouseUp = () => {
    soundService.playTone(660, 0.15, 'sine', (volume / 100) * 0.4);
  };

  const handleSubmit = () => {
    let h24 = hour12 % 12;
    if (period === 'PM') h24 += 12;
    const time24 = `${h24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    onSave(
      {
        time: time24,
        label: label.trim() || 'Wake Up',
        days: days.length > 0 ? days : ['mon', 'tue', 'wed', 'thu', 'fri'],
        enabled: true,
        challengeType,
        mathDifficulty,
        mathProblemCount,
        shakeCountTarget,
        soundType,
        volume,
      },
      initialAlarm ? initialAlarm.id : undefined
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center select-none">
          {/* Backdrop with Fade Out Animation on Close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Container with Spring Slide Up & Slide Down Exit */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="relative w-full sm:max-w-[375px] max-h-[92vh] bg-[#FFFFFF] rounded-t-[32px] sm:rounded-[36px] overflow-hidden flex flex-col shadow-2xl border border-[#EAEAEA]"
          >
            {/* Liquid Glass Header */}
            <div
              className="h-16 px-5 border-b border-white/60 flex items-center justify-between shrink-0 bg-white/75 backdrop-blur-2xl z-10 sticky top-0"
              style={{
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backdropFilter: 'blur(20px) saturate(180%)',
              }}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-black/10 bg-white/50 flex items-center justify-center text-[#000000] hover:bg-black/5 active:bg-black/10 transition-colors shadow-2xs"
                title="Cancel"
              >
                <X className="w-5 h-5 text-[#000000]" />
              </motion.button>

              <h2 className="text-base font-bold text-[#000000]">
                {initialAlarm ? 'Edit Alarm' : 'Add Alarm'}
              </h2>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSubmit}
                className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center hover:bg-black active:bg-black/90 transition-colors shadow-xs"
                title="Save Alarm"
              >
                <Check className="w-5 h-5 text-white stroke-[2.5]" />
              </motion.button>
            </div>

            {/* Form Scroll Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 no-scrollbar">
              {/* 1. Scrollable & Snapped Time Wheel Picker */}
              <div className="relative py-2 px-2 rounded-[24px] bg-[#F9F9F9] border border-[#EEEEEE] flex items-center justify-center overflow-hidden">
                {/* Horizontal Center Selection Bar Highlight */}
                <div className="pointer-events-none absolute left-3 right-16 top-1/2 -translate-y-1/2 h-16 rounded-[16px] bg-white border border-[#E5E5E5]/80 shadow-2xs z-0" />

                <div className="relative z-10 flex items-center justify-center space-x-1 w-full pr-14">
                  {/* Hours Wheel */}
                  <div
                    ref={hoursContainerRef}
                    onScroll={handleHoursScroll}
                    className="h-48 w-20 overflow-y-auto snap-y snap-mandatory no-scrollbar text-center select-none py-[64px]"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {HOURS.map((h) => {
                      const isSelected = h === hour12;
                      return (
                        <div
                          key={`hour-${h}`}
                          onClick={() => scrollToHour(h)}
                          className={`h-16 flex items-center justify-center cursor-pointer snap-center transition-all ${
                            isSelected
                              ? 'text-5xl font-black text-[#000000] scale-100'
                              : 'text-2xl font-bold text-[#C5C5C5] hover:text-[#999999] scale-90'
                          }`}
                        >
                          {h.toString().padStart(2, '0')}
                        </div>
                      );
                    })}
                  </div>

                  {/* Colon Separator */}
                  <div className="text-3xl font-extrabold text-[#000000] select-none pb-1">:</div>

                  {/* Minutes Wheel */}
                  <div
                    ref={minutesContainerRef}
                    onScroll={handleMinutesScroll}
                    className="h-48 w-20 overflow-y-auto snap-y snap-mandatory no-scrollbar text-center select-none py-[64px]"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {MINUTES.map((m) => {
                      const isSelected = m === minute;
                      return (
                        <div
                          key={`min-${m}`}
                          onClick={() => scrollToMinute(m)}
                          className={`h-16 flex items-center justify-center cursor-pointer snap-center transition-all ${
                            isSelected
                              ? 'text-5xl font-black text-[#000000] scale-100'
                              : 'text-2xl font-bold text-[#C5C5C5] hover:text-[#999999] scale-90'
                          }`}
                        >
                          {m.toString().padStart(2, '0')}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Vertical AM / PM Capsule Toggle */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[14px] bg-[#EFEFEF] p-1 flex flex-col gap-1 z-10">
                  <button
                    type="button"
                    onClick={() => setPeriod('AM')}
                    className={`py-2 px-3 rounded-[10px] text-xs font-bold transition-all ${
                      period === 'AM'
                        ? 'bg-[#1A1A1A] text-white shadow-xs'
                        : 'text-[#7A7A7A] hover:text-[#000000]'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('PM')}
                    className={`py-2 px-3 rounded-[10px] text-xs font-bold transition-all ${
                      period === 'PM'
                        ? 'bg-[#1A1A1A] text-white shadow-xs'
                        : 'text-[#7A7A7A] hover:text-[#000000]'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* 2. REPEAT Section */}
              <div>
                <p className="text-[11px] font-bold tracking-wider text-[#8E8E8E] uppercase mb-2">
                  REPEAT
                </p>
                <div className="flex items-center justify-between">
                  {REPEAT_DAYS.map(({ key, label: dayLetter }) => {
                    const isSelected = days.includes(key);
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleDay(key)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#1A1A1A] text-white shadow-2xs'
                            : 'bg-[#F5F5F5] text-[#8E8E8E] hover:bg-[#EAEAEA]'
                        }`}
                      >
                        {dayLetter}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* 3. LABEL Section */}
              <div>
                <p className="text-[11px] font-bold tracking-wider text-[#8E8E8E] uppercase mb-2">
                  LABEL
                </p>
                <div className="rounded-[16px] bg-[#F8F8F8] border border-[#EEEEEE] px-4 py-3 flex items-center space-x-3 focus-within:border-[#000000]/40 transition-colors">
                  <PenLine className="w-4 h-4 text-[#7A7A7A] shrink-0" />
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Wake Up"
                    className="bg-transparent text-sm font-semibold text-[#000000] focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* 4. CHALLENGE TYPE Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold tracking-wider text-[#8E8E8E] uppercase">
                    CHALLENGE
                  </p>
                  <span className="px-2 py-0.5 rounded-[6px] bg-[#F3F3F3] text-[10px] font-bold text-[#555555]">
                    Required
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Math Puzzle Card */}
                  <div
                    onClick={() => setChallengeType('math')}
                    className={`p-4 rounded-[20px] border cursor-pointer flex items-center justify-between transition-all ${
                      challengeType === 'math'
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                        : 'bg-[#F8F8F8] text-[#000000] border-[#EEEEEE] hover:bg-[#F2F2F2]'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
                          challengeType === 'math'
                            ? 'bg-white/15 text-white'
                            : 'bg-[#ECECEC] text-[#000000]'
                        }`}
                      >
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-tight">Math Puzzle</p>
                        <p
                          className={`text-xs mt-0.5 ${
                            challengeType === 'math' ? 'text-white/70' : 'text-[#7A7A7A]'
                          }`}
                        >
                          Solve {mathProblemCount} {mathDifficulty} equations
                        </p>
                      </div>
                    </div>

                    {challengeType === 'math' && (
                      <div className="w-6 h-6 rounded-full bg-white text-[#1A1A1A] flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Shake Phone Card */}
                  <div
                    onClick={() => setChallengeType('shake')}
                    className={`p-4 rounded-[20px] border cursor-pointer flex items-center justify-between transition-all ${
                      challengeType === 'shake'
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                        : 'bg-[#F8F8F8] text-[#000000] border-[#EEEEEE] hover:bg-[#F2F2F2]'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
                          challengeType === 'shake'
                            ? 'bg-white/15 text-white'
                            : 'bg-[#ECECEC] text-[#000000]'
                        }`}
                      >
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-tight">Shake Phone</p>
                        <p
                          className={`text-xs mt-0.5 ${
                            challengeType === 'shake' ? 'text-white/70' : 'text-[#7A7A7A]'
                          }`}
                        >
                          {shakeCountTarget} vigorous shakes required
                        </p>
                      </div>
                    </div>

                    {challengeType === 'shake' && (
                      <div className="w-6 h-6 rounded-full bg-white text-[#1A1A1A] flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. CHALLENGE DIFFICULTY & INTENSITY OPTIONS */}
              <div className="p-4 rounded-[20px] bg-[#F8F8F8] border border-[#EEEEEE] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#000000] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#000000]" />
                    Difficulty & Intensity
                  </span>
                  <span className="text-[11px] font-semibold text-[#7A7A7A] capitalize">
                    {challengeType === 'math' ? `${mathDifficulty} mode` : `${shakeCountTarget} shakes`}
                  </span>
                </div>

                {/* If Math is chosen: Difficulty selector + Equation count */}
                {challengeType === 'math' ? (
                  <div className="space-y-3">
                    {/* Math Difficulty Segmented Control */}
                    <div>
                      <span className="text-[11px] font-medium text-[#7A7A7A] block mb-1.5">
                        Math Complexity
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-[14px] bg-[#EAEAEA]">
                        {(['easy', 'medium', 'hard'] as MathDifficulty[]).map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setMathDifficulty(diff)}
                            className={`py-1.5 rounded-[10px] text-xs font-bold capitalize transition-all ${
                              mathDifficulty === diff
                                ? 'bg-white text-[#000000] shadow-xs'
                                : 'text-[#7A7A7A] hover:text-[#000000]'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Equation Count Segmented Control */}
                    <div>
                      <span className="text-[11px] font-medium text-[#7A7A7A] block mb-1.5">
                        Number of Problems
                      </span>
                      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-[14px] bg-[#EAEAEA]">
                        {[1, 2, 3, 5].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setMathProblemCount(cnt)}
                            className={`py-1.5 rounded-[10px] text-xs font-bold transition-all ${
                              mathProblemCount === cnt
                                ? 'bg-white text-[#000000] shadow-xs'
                                : 'text-[#7A7A7A] hover:text-[#000000]'
                            }`}
                          >
                            {cnt} {cnt === 1 ? 'prob' : 'probs'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* If Shake is chosen: Intensity target */
                  <div>
                    <span className="text-[11px] font-medium text-[#7A7A7A] block mb-1.5">
                      Target Shakes
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-[14px] bg-[#EAEAEA]">
                      {[
                        { target: 15, label: '15 (Light)' },
                        { target: 30, label: '30 (Standard)' },
                        { target: 50, label: '50 (Intense)' },
                      ].map((item) => (
                        <button
                          key={item.target}
                          type="button"
                          onClick={() => setShakeCountTarget(item.target)}
                          className={`py-1.5 px-1 rounded-[10px] text-[11px] font-bold transition-all ${
                            shakeCountTarget === item.target
                              ? 'bg-white text-[#000000] shadow-xs'
                              : 'text-[#7A7A7A] hover:text-[#000000]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Sound, Volume & Vibrate Preferences */}
              <div className="rounded-[18px] bg-[#F8F8F8] border border-[#EEEEEE] overflow-hidden divide-y divide-[#EEEEEE]">
                {/* Per-Alarm Volume Slider */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-[#000000]" />
                      <span className="font-semibold text-[#000000]">Alarm Volume</span>
                    </div>
                    <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#000000] text-[11px]">
                      {volume}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 pt-1">
                    <span className="text-[11px] font-bold text-[#888888]">5%</span>
                    <input
                      type="range"
                      id="per-alarm-volume-slider"
                      min="5"
                      max="100"
                      step="1"
                      value={volume}
                      onChange={handleVolumeChange}
                      onMouseUp={handleVolumeMouseUp}
                      onTouchEnd={handleVolumeMouseUp}
                      className="flex-1 h-2 bg-[#E2E2E2] rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
                      aria-label="Alarm Volume Slider"
                    />
                    <span className="text-[11px] font-bold text-[#000000]">100%</span>
                  </div>
                </div>

                {/* Sound Ringtone Selector */}
                <div
                  onClick={handleCycleSound}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#F0F0F0] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="w-4 h-4 text-[#000000]" />
                    <span className="text-sm font-semibold text-[#000000]">Sound</span>
                  </div>
                  <span className="text-xs font-semibold text-[#7A7A7A] flex items-center gap-1">
                    {getSoundDisplayName()} &rsaquo;
                  </span>
                </div>

                <div className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Vibrate className="w-4 h-4 text-[#000000]" />
                    <span className="text-sm font-semibold text-[#000000]">Vibrate</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVibrate(!vibrate)}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                      vibrate ? 'bg-[#1A1A1A]' : 'bg-[#E5E5E5]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        vibrate ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Delete button if editing */}
              {initialAlarm && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(initialAlarm.id);
                    onClose();
                  }}
                  className="w-full py-3 rounded-[16px] border border-red-200 bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center space-x-1.5 hover:bg-red-100 active:scale-98 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Alarm</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
