import React from 'react';
import { Flame, Bell, Code, Smartphone, Monitor } from 'lucide-react';

interface HeaderProps {
  streak: number;
  onQuickTest: () => void;
  onOpenExpoExport: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  alarmCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  onQuickTest,
  onOpenExpoExport,
  isMobileFrame,
  onToggleFrame,
}) => {
  return (
    <header className="px-5 pt-5 pb-4 bg-[#FFFFFF] border-b border-[#E5E5E5]/70 flex items-center justify-between sticky top-0 z-20">
      {/* Brand & Placeholder Logo */}
      <div className="flex items-center space-x-3">
        {/* Minimalist Monochrome Logo Placeholder */}
        <div 
          id="brand-logo-badge"
          className="w-9 h-9 rounded-[10px] bg-[#000000] flex items-center justify-center text-white shadow-sm"
          title="Anti-Snooze Logo (Customizable)"
        >
          <span className="font-bold text-xs tracking-tighter font-mono">AS</span>
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-[#000000] leading-none">
            Anti-Snooze
          </h1>
          <p className="text-[11px] font-medium text-[#5E5E5E] mt-0.5">
            Forced Wake-up
          </p>
        </div>
      </div>

      {/* Right controls: Streak Pill + Quick Test + Expo Code + Frame View */}
      <div className="flex items-center space-x-2">
        {/* Active Streak Counter with exclusive #FF7B00 Flame */}
        <div 
          id="streak-badge"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#F9F9F9] border border-[#E5E5E5] transition-transform active:scale-95"
          title={`${streak} Day Wake-up Streak`}
        >
          {/* #FF7B00 is reserved exclusively for the active-streak flame */}
          <Flame className="w-4 h-4 text-[#FF7B00] fill-[#FF7B00] animate-bounce" />
          <span className="text-xs font-bold text-[#000000]">
            {streak}d
          </span>
        </div>

        {/* Quick Test Alarm Trigger */}
        <button
          id="btn-quick-test-alarm"
          onClick={onQuickTest}
          className="h-8 px-2.5 rounded-[8px] bg-[#000000] text-white text-[11px] font-semibold flex items-center space-x-1 hover:bg-[#222222] active:scale-95 transition-all shadow-sm"
          title="Test Alarm Ringing Flow Now"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Test</span>
        </button>

        {/* Expo Go Code Export */}
        <button
          id="btn-expo-export"
          onClick={onOpenExpoExport}
          className="h-8 w-8 rounded-[8px] bg-[#F9F9F9] border border-[#E5E5E5] text-[#000000] flex items-center justify-center hover:bg-[#EEEEEE] active:scale-95 transition-all"
          title="View React Native Expo Go Code"
        >
          <Code className="w-4 h-4 text-[#000000]" />
        </button>

        {/* Frame Toggle (Mobile Frame vs Full Viewport) */}
        <button
          id="btn-toggle-frame"
          onClick={onToggleFrame}
          className="h-8 w-8 rounded-[8px] bg-[#F9F9F9] border border-[#E5E5E5] text-[#5E5E5E] hover:text-[#000000] flex items-center justify-center hover:bg-[#EEEEEE] active:scale-95 transition-all"
          title={isMobileFrame ? "Switch to Full Screen Layout" : "Switch to 375x812 Phone Frame"}
        >
          {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
