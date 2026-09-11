import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alarm, ChallengeType, DayOfWeek, MathDifficulty } from '../types';
import { soundService } from '../services/soundService';
import { X, Check, Calculator, Smartphone, Bell, Vibrate, Trash2, PenLine, Zap, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, t } from '../services/i18n';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alarmData: Omit<Alarm, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  initialAlarm?: Alarm | null;
  customRingtone?: { name: string; dataUrl: string } | null;
  use24HourFormat?: boolean;
  language?: AppLanguage;
}

const REPEAT_DAYS: { key: DayOfWeek; i18nKey: 'daysSun' | 'daysMon' | 'daysTue' | 'daysWed' | 'daysThu' | 'daysFri' | 'daysSat' }[] = [
  { key: 'sun', i18nKey: 'daysSun' },
  { key: 'mon', i18nKey: 'daysMon' },
  { key: 'tue', i18nKey: 'daysTue' },
  { key: 'wed', i18nKey: 'daysWed' },
  { key: 'thu', i18nKey: 'daysThu' },
  { key: 'fri', i18nKey: 'daysFri' },
  { key: 'sat', i18nKey: 'daysSat' },
];

const ITEM_HEIGHT = 64; // height of each scroll item in px

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialAlarm,
  customRingtone,
  use24HourFormat = false,
  language = 'en',
}) => {
  // Hours array depends on format: 0..23 for 24h, 1..12 for 12h
  const HOURS = use24HourFormat
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);

  const MINUTES = Array.from({ length: 60 }, (_, i) => i);

  // Time states
  const [selectedHour, setSelectedHour] = useState<number>(use24HourFormat ? 6 : 6);
  const [minute, setMinute] = useState<number>(30);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  const [label, setLabel] = useState<string>('');
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
      const m = initM || 0;

      if (use24HourFormat) {
        setSelectedHour(initH || 0);
      } else {
        const h12 = (initH % 12 === 0) ? 12 : (initH % 12);
        setSelectedHour(h12);
        setPeriod(initH >= 12 ? 'PM' : 'AM');
      }

      setMinute(m);
      setLabel(initialAlarm ? initialAlarm.label : '');
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
        const targetH = use24HourFormat ? (initH || 0) : ((initH % 12 === 0) ? 12 : (initH % 12));
        const hIdx = HOURS.indexOf(targetH);
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
  }, [isOpen, initialAlarm, use24HourFormat]);

  // Handle Hour Scroll Snap
  const handleHoursScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current || !hoursContainerRef.current) return;
    const top = hoursContainerRef.current.scrollTop;
    const index = Math.round(top / ITEM_HEIGHT);
    if (index >= 0 && index < HOURS.length) {
      setSelectedHour(HOURS[index]);
    }
  }, [HOURS]);

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
      setSelectedHour(h);
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    soundService.setVolume(newVol);
  };

  const handleVolumeMouseUp = () => {
    soundService.playPreview(soundType, customRingtone?.dataUrl);
  };

  const handleCycleSound = () => {
    const soundOptions: ('radar' | 'siren' | 'digital' | 'custom')[] = ['radar', 'siren', 'digital'];
    if (customRingtone) {
      soundOptions.push('custom');
    }
    const currentIndex = soundOptions.indexOf(soundType);
    const nextIndex = (currentIndex + 1) % soundOptions.length;
    const nextSound = soundOptions[nextIndex];
    setSoundType(nextSound);
    soundService.playPreview(nextSound, customRingtone?.dataUrl);
  };

  const getSoundDisplayName = () => {
    switch (soundType) {
      case 'radar':
        return t('radarTone', language);
      case 'siren':
        return t('sirenTone', language);
      case 'digital':
        return t('digitalTone', language);
      case 'custom':
        return customRingtone?.name || t('customTone', language);
      default:
        return 'Radar';
    }
  };

  const handleSubmit = () => {
    let time24 = '';
    if (use24HourFormat) {
      time24 = `${selectedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else {
      let h24 = selectedHour % 12;
      if (period === 'PM') h24 += 12;
      time24 = `${h24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="relative w-full sm:max-w-[375px] max-h-[92vh] bg-[#FFFFFF] rounded-t-[32px] sm:rounded-[36px] overflow-hidden flex flex-col shadow-2xl border border-[#EAEAEA]"
          >
            {/* Header */}
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
                className="w-10 h-10 rounded-full border border-black/10 bg-white/50 flex items-center justify-center text-[#000000] hover:bg-black/5 active:bg-black/10 transition-colors shadow-2xs cursor-pointer"
                title={t('cancel', language)}
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </motion.button>

              <h2 className="text-base font-bold text-[#000000] tracking-tight">
                {initialAlarm ? t('editAlarm', language) : t('newAlarm', language)}
              </h2>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSubmit}
                className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white hover:bg-[#000000] active:scale-95 transition-all shadow-xs cursor-pointer"
                title={t('save', language)}
              >
                <Check className="w-5 h-5 text-white stroke-[2.5]" />
              </motion.button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 no-scrollbar">
              {/* 1. Time Selection Card */}
              <div className="relative py-2 bg-[#F9F9F9] rounded-[24px] border border-[#EEEEEE] overflow-hidden">
                {/* Center Highlight Bar */}
                <div className="absolute inset-x-2.5 sm:inset-x-3 top-1/2 -translate-y-1/2 h-[80px] rounded-[20px] bg-[#FFFFFF] border border-[#E8E8E8] shadow-xs pointer-events-none z-0" />

                {/* Wheels & AM/PM Container */}
                <div className="relative z-10 flex items-center justify-center h-[184px]">
                  {/* Hours Wheel */}
                  <div
                    ref={hoursContainerRef}
                    onScroll={handleHoursScroll}
                    className={`${
                      use24HourFormat ? 'w-[84px] sm:w-[90px]' : 'w-[70px] sm:w-[76px]'
                    } h-full overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory text-center py-[60px]`}
                  >
                    {HOURS.map((h) => {
                      const isSelected = selectedHour === h;
                      return (
                        <div
                          key={h}
                          onClick={() => scrollToHour(h)}
                          className={`h-[64px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? 'text-[44px] font-extrabold text-[#000000] scale-105'
                              : 'text-[28px] font-medium text-[#C0C0C0] scale-95 opacity-50'
                          }`}
                        >
                          {h.toString().padStart(2, '0')}
                        </div>
                      );
                    })}
                  </div>

                  {/* Colon Separator */}
                  <div className="text-[34px] font-extrabold text-[#000000] px-1 sm:px-1.5 select-none pointer-events-none -mt-1">
                    :
                  </div>

                  {/* Minutes Wheel */}
                  <div
                    ref={minutesContainerRef}
                    onScroll={handleMinutesScroll}
                    className={`${
                      use24HourFormat ? 'w-[84px] sm:w-[90px]' : 'w-[70px] sm:w-[76px]'
                    } h-full overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory text-center py-[60px]`}
                  >
                    {MINUTES.map((m) => {
                      const isSelected = minute === m;
                      return (
                        <div
                          key={m}
                          onClick={() => scrollToMinute(m)}
                          className={`h-[64px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? 'text-[44px] font-extrabold text-[#000000] scale-105'
                              : 'text-[28px] font-medium text-[#C0C0C0] scale-95 opacity-50'
                          }`}
                        >
                          {m.toString().padStart(2, '0')}
                        </div>
                      );
                    })}
                  </div>

                  {/* AM / PM Toggle (Shown exclusively in 12-Hour format, neatly fitted without overflow) */}
                  {!use24HourFormat && (
                    <div className="ml-4 sm:ml-5 z-20 pointer-events-auto shrink-0">
                      <div className="w-[46px] rounded-[13px] bg-[#ECECEC] p-1 flex flex-col items-center gap-1 shadow-2xs">
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.88 }}
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                          onClick={() => setPeriod('AM')}
                          className={`w-full h-[25px] flex items-center justify-center rounded-[9px] text-[11px] font-extrabold tracking-wider transition-colors cursor-pointer select-none ${
                            period === 'AM'
                              ? 'bg-[#1A1A1A] text-white shadow-xs'
                              : 'text-[#888888] hover:text-[#000000] hover:bg-black/5'
                          }`}
                        >
                          AM
                        </motion.button>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.88 }}
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                          onClick={() => setPeriod('PM')}
                          className={`w-full h-[25px] flex items-center justify-center rounded-[9px] text-[11px] font-extrabold tracking-wider transition-colors cursor-pointer select-none ${
                            period === 'PM'
                              ? 'bg-[#1A1A1A] text-white shadow-xs'
                              : 'text-[#888888] hover:text-[#000000] hover:bg-black/5'
                          }`}
                        >
                          PM
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Days Repeat Circles */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                  {t('repeat', language)}
                </div>
                <div className="flex items-center justify-between gap-1">
                  {REPEAT_DAYS.map(({ key, i18nKey }) => {
                    const isSelected = days.includes(key);
                    const dayLabel = t(i18nKey, language);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleDay(key)}
                        className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1A1A1A] text-white shadow-xs'
                            : 'bg-[#F4F4F4] text-[#888888] hover:bg-[#EAEAEA]'
                        }`}
                      >
                        {dayLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Alarm Label Input */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                  {t('label', language)}
                </div>
                <div className="flex items-center space-x-3 px-4 py-3.5 rounded-[18px] bg-[#F9F9F9] border border-[#EEEEEE] focus-within:border-[#1A1A1A] focus-within:bg-white transition-all">
                  <PenLine className="w-4 h-4 text-[#888888] shrink-0" />
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={t('labelPlaceholder', language)}
                    className="w-full bg-transparent border-none outline-hidden text-sm font-bold text-[#000000] placeholder:text-[#AAAAAA]"
                    maxLength={30}
                  />
                </div>
              </div>

              {/* 4. Challenge Selector Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                    {t('wakeUpChallenge', language)}
                  </span>
                  <span className="text-[10px] font-bold text-[#666666] bg-[#F0F0F0] px-2.5 py-0.5 rounded-full">
                    Required
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Math Puzzle Option */}
                  <div
                    onClick={() => setChallengeType('math')}
                    className={`p-4 rounded-[20px] cursor-pointer flex items-center justify-between transition-all ${
                      challengeType === 'math'
                        ? 'bg-[#1A1A1A] text-white shadow-xs'
                        : 'bg-[#F9F9F9] text-[#000000] border border-[#EEEEEE] hover:bg-[#F4F4F4]'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${
                          challengeType === 'math' ? 'bg-white/15 text-white' : 'bg-[#EAEAEA] text-[#000000]'
                        }`}
                      >
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-tight truncate">
                          {t('mathPuzzle', language)}
                        </p>
                        <p
                          className={`text-xs mt-0.5 truncate ${
                            challengeType === 'math' ? 'text-white/70' : 'text-[#7A7A7A]'
                          }`}
                        >
                          Solve {mathProblemCount} {mathDifficulty} equations
                        </p>
                      </div>
                    </div>
                    {challengeType === 'math' && (
                      <div className="w-6 h-6 rounded-full bg-white text-[#1A1A1A] flex items-center justify-center shrink-0 ml-2 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Shake Phone Option */}
                  <div
                    onClick={() => setChallengeType('shake')}
                    className={`p-4 rounded-[20px] cursor-pointer flex items-center justify-between transition-all ${
                      challengeType === 'shake'
                        ? 'bg-[#1A1A1A] text-white shadow-xs'
                        : 'bg-[#F9F9F9] text-[#000000] border border-[#EEEEEE] hover:bg-[#F4F4F4]'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${
                          challengeType === 'shake' ? 'bg-white/15 text-white' : 'bg-[#EAEAEA] text-[#000000]'
                        }`}
                      >
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-tight truncate">
                          {t('shakePhone', language)}
                        </p>
                        <p
                          className={`text-xs mt-0.5 truncate ${
                            challengeType === 'shake' ? 'text-white/70' : 'text-[#7A7A7A]'
                          }`}
                        >
                          {shakeCountTarget} vigorous shakes required
                        </p>
                      </div>
                    </div>
                    {challengeType === 'shake' && (
                      <div className="w-6 h-6 rounded-full bg-white text-[#1A1A1A] flex items-center justify-center shrink-0 ml-2 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. Difficulty & Intensity Matrix */}
              <div className="p-5 rounded-[24px] bg-[#F9F9F9] border border-[#EEEEEE] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#000000]">
                    <Zap className="w-4 h-4 stroke-[2.5]" />
                    <span>Difficulty & Intensity</span>
                  </div>
                  <span className="text-xs text-[#7A7A7A] font-medium">
                    {challengeType === 'math'
                      ? mathDifficulty === 'easy'
                        ? 'Easy Mode'
                        : mathDifficulty === 'medium'
                        ? 'Medium Mode'
                        : 'Hard Mode'
                      : `${shakeCountTarget} Shakes`}
                  </span>
                </div>

                {challengeType === 'math' ? (
                  <>
                    {/* Math Complexity */}
                    <div className="space-y-2">
                      <span className="text-xs text-[#7A7A7A] font-medium block">
                        Math Complexity
                      </span>
                      <div className="grid grid-cols-3 p-1 rounded-[14px] bg-[#ECECEC] gap-1">
                        {(['easy', 'medium', 'hard'] as MathDifficulty[]).map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setMathDifficulty(diff)}
                            className={`py-2 rounded-[10px] text-xs font-bold capitalize transition-all cursor-pointer ${
                              mathDifficulty === diff
                                ? 'bg-white text-black shadow-2xs'
                                : 'text-[#7A7A7A] hover:text-black font-medium'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number of Problems */}
                    <div className="space-y-2">
                      <span className="text-xs text-[#7A7A7A] font-medium block">
                        Number of Problems
                      </span>
                      <div className="grid grid-cols-4 p-1 rounded-[14px] bg-[#ECECEC] gap-1">
                        {[1, 2, 3, 5].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setMathProblemCount(cnt)}
                            className={`py-2 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
                              mathProblemCount === cnt
                                ? 'bg-white text-black shadow-2xs'
                                : 'text-[#7A7A7A] hover:text-black font-medium'
                            }`}
                          >
                            {cnt === 1 ? '1 prob' : `${cnt} probs`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <span className="text-xs text-[#7A7A7A] font-medium block">
                      Required Shakes
                    </span>
                    <div className="grid grid-cols-4 p-1 rounded-[14px] bg-[#ECECEC] gap-1">
                      {[15, 30, 50, 75].map((shk) => (
                        <button
                          key={shk}
                          type="button"
                          onClick={() => setShakeCountTarget(shk)}
                          className={`py-2 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
                            shakeCountTarget === shk
                              ? 'bg-white text-black shadow-2xs'
                              : 'text-[#7A7A7A] hover:text-black font-medium'
                          }`}
                        >
                          {shk} shakes
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Alarm Volume & Audio Options */}
              <div className="p-5 rounded-[24px] bg-[#F9F9F9] border border-[#EEEEEE] space-y-4">
                {/* Alarm Volume */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold text-[#000000]">
                      <Volume2 className="w-4 h-4 text-[#000000]" />
                      <span>{t('alarmVolume', language)}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ECECEC] text-xs font-bold text-[#000000]">
                      {volume}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-bold text-[#888888]">5%</span>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="1"
                      value={volume}
                      onChange={handleVolumeChange}
                      onMouseUp={handleVolumeMouseUp}
                      onTouchEnd={handleVolumeMouseUp}
                      className="flex-1 h-2 bg-[#DCDCDC] rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
                      aria-label="Alarm Volume"
                    />
                    <span className="text-[10px] font-bold text-[#000000]">100%</span>
                  </div>
                </div>

                {/* Sound Selection */}
                <div className="flex items-center justify-between pt-2 border-t border-[#EAEAEA] text-xs">
                  <div className="flex items-center space-x-2 font-bold text-[#000000]">
                    <Bell className="w-4 h-4 text-[#000000]" />
                    <span>{t('sound', language)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCycleSound}
                    className="text-xs font-bold text-[#666666] hover:text-[#000000] flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{getSoundDisplayName()}</span>
                    <span className="text-[#999999]">›</span>
                  </button>
                </div>

                {/* Vibrate Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-[#EAEAEA] text-xs">
                  <div className="flex items-center space-x-2 font-bold text-[#000000]">
                    <Vibrate className="w-4 h-4 text-[#000000]" />
                    <span>{t('vibration', language)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVibrate(!vibrate)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      vibrate ? 'bg-[#1A1A1A]' : 'bg-[#DCDCDC]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                        vibrate ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 7. Delete Button */}
              {initialAlarm && onDelete && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(initialAlarm.id);
                      onClose();
                    }}
                    className="w-full h-12 rounded-[16px] bg-[#FFF0F0] border border-red-200/80 text-red-600 font-bold text-xs flex items-center justify-center space-x-2 hover:bg-[#FFE5E5] transition-colors cursor-pointer active:scale-[0.99]"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span>{t('deleteAlarm', language)}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Spacer */}
            <div className="h-4 bg-white shrink-0" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
