import React, { useEffect, useState } from 'react';
import { Alarm } from '../types';
import { BellRing, ArrowRight } from 'lucide-react';

interface RingingScreenProps {
  alarm: Alarm;
  onStartChallenge: () => void;
}

export const RingingScreen: React.FC<RingingScreenProps> = ({
  alarm,
  onStartChallenge,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const period = h >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    const blinkTimer = setInterval(() => setBlink((b) => !b), 600);
    return () => {
      clearInterval(timer);
      clearInterval(blinkTimer);
    };
  }, []);

  return (
    <div 
      id="screen-alarm-ringing"
      className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col items-center justify-between p-8 select-none"
    >
      {/* Top Status */}
      <div className="w-full flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/15">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/90">
            ALARM RINGING
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
            {currentTime.split(' ')[0]}
          </h1>
          <p className="text-lg font-bold text-white/70 uppercase tracking-widest mt-1">
            {currentTime.split(' ')[1]}
          </p>
        </div>

        {/* Alarm Label */}
        <div className="mt-6 text-center max-w-xs">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {alarm.label || 'Wake-up Call'}
          </h3>
          <p className="text-xs text-white/60 mt-1">
            {alarm.challengeType === 'math' 
              ? 'Complete the math arithmetic challenge to silence this alarm'
              : 'Complete physical phone shake challenge to silence this alarm'}
          </p>
        </div>

        {/* Explicit Anti-Snooze Notice */}
        <div className="mt-8 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span className="text-[11px] font-medium text-white/50">
            🔒 Snooze disabled • Challenge required
          </span>
        </div>
      </div>

      {/* Bottom: ONLY ONE BUTTON: "Start challenge" (Strictly no snooze or dismiss shortcut!) */}
      <div className="w-full max-w-sm pb-6">
        <button
          id="btn-start-challenge"
          onClick={onStartChallenge}
          className="w-full h-14 rounded-[16px] bg-white text-black font-extrabold text-base tracking-wide flex items-center justify-center space-x-2.5 hover:bg-[#F0F0F0] active:scale-[0.98] transition-all shadow-xl"
        >
          <span>Start challenge</span>
          <ArrowRight className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  );
};
