import React, { useEffect, useState } from 'react';
import { Alarm } from '../types';
import { BellRing, ArrowRight } from 'lucide-react';
import { AppLanguage, formatTimeString, t } from '../services/i18n';

interface RingingScreenProps {
  alarm: Alarm;
  onStartChallenge: () => void;
  use24HourFormat?: boolean;
  language?: AppLanguage;
}

export const RingingScreen: React.FC<RingingScreenProps> = ({
  alarm,
  onStartChallenge,
  use24HourFormat = false,
  language = 'en',
}) => {
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>('');
  const [period, setPeriod] = useState<string | undefined>(undefined);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hStr = now.getHours().toString().padStart(2, '0');
      const mStr = now.getMinutes().toString().padStart(2, '0');
      const res = formatTimeString(`${hStr}:${mStr}`, use24HourFormat);
      setCurrentTimeFormatted(res.timeFormatted);
      setPeriod(res.period);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [use24HourFormat]);

  return (
    <div
      id="screen-alarm-ringing"
      className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col items-center justify-between p-6 sm:p-8 select-none"
    >
      {/* Top Status */}
      <div className="w-full flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/15">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/90">
            {t('alarmRinging', language)}
          </span>
        </div>
        <span className="text-xs font-mono text-white/60">
          Anti-Snooze Shield Active
        </span>
      </div>

      {/* Center: Large Time & Urgency Animation */}
      <div className="flex flex-col items-center justify-center my-auto relative">
        {/* Pulsing Acoustic Visual Rings */}
        <div className="absolute w-72 h-72 rounded-full border border-white/10 animate-ping pointer-events-none opacity-40"></div>
        <div className="absolute w-56 h-56 rounded-full border border-white/20 animate-pulse pointer-events-none opacity-50"></div>

        {/* Alarm Bell Icon */}
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 shadow-lg border border-white/20">
          <BellRing className="w-8 h-8 text-white animate-bounce" />
        </div>

        {/* Current Time Display */}
        <div className="text-center">
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-white font-mono">
            {currentTimeFormatted}
          </h1>
          {period && (
            <p className="text-lg font-bold text-white/70 uppercase tracking-widest mt-1">
              {period}
            </p>
          )}
        </div>

        {/* Alarm Label */}
        <div className="mt-6 text-center max-w-xs">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {alarm.label || t('alarms', language)}
          </h3>
          <p className="text-xs text-white/60 mt-1">
            {alarm.challengeType === 'math'
              ? t('mathDesc', language)
              : t('shakeDesc', language)}
          </p>
        </div>

        {/* Explicit Anti-Snooze Notice */}
        <div className="mt-8 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span className="text-[11px] font-medium text-white/50">
            🔒 Snooze disabled • Challenge required
          </span>
        </div>
      </div>

      {/* Bottom: ONLY ONE BUTTON: "Start challenge" */}
      <div className="w-full max-w-sm pb-6">
        <button
          id="btn-start-challenge"
          onClick={onStartChallenge}
          className="w-full h-14 rounded-[16px] bg-white text-black font-extrabold text-base tracking-wide flex items-center justify-center space-x-2.5 hover:bg-[#F0F0F0] active:scale-[0.98] transition-all shadow-xl cursor-pointer"
        >
          <span>{t('startChallenge', language)}</span>
          <ArrowRight className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  );
};
