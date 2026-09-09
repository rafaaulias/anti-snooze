import React from 'react';
import { ShieldCheck, Bell, Zap, Clock } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div 
        id="onboarding-modal"
        className="w-full max-w-[390px] bg-[#FFFFFF] rounded-[24px] shadow-2xl p-6 border border-[#E5E5E5] flex flex-col justify-between"
      >
        <div>
          {/* Logo / Badge */}
          <div className="w-12 h-12 rounded-[12px] bg-[#000000] text-white flex items-center justify-center mb-5 shadow-sm">
            <span className="font-bold text-base font-mono">AS</span>
          </div>

          <h2 className="text-2xl font-extrabold text-[#000000] tracking-tight">
            We make sure you actually wake up.
          </h2>
          <p className="text-xs text-[#5E5E5E] mt-2 leading-relaxed">
            Anti-Snooze eliminates snoozing completely. To guarantee reliable wake-ups, our offline engine requires 3 essential device permissions:
          </p>

          {/* Permissions list */}
          <div className="mt-5 space-y-3.5">
            {/* 1. Exact Alarm */}
            <div className="flex items-start space-x-3 p-3 rounded-[12px] bg-[#F9F9F9] border border-[#EBEBEB]">
              <div className="w-8 h-8 rounded-[8px] bg-[#000000] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#000000]">Exact Alarm Timing</h4>
                <p className="text-[11px] text-[#5E5E5E] leading-tight mt-0.5">
                  Fires down to the exact second without system power-saving delays.
                </p>
              </div>
            </div>

            {/* 2. Notification */}
            <div className="flex items-start space-x-3 p-3 rounded-[12px] bg-[#F9F9F9] border border-[#EBEBEB]">
              <div className="w-8 h-8 rounded-[8px] bg-[#000000] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#000000]">Full-Screen Intent</h4>
                <p className="text-[11px] text-[#5E5E5E] leading-tight mt-0.5">
                  Overlays lock screen and rings over silent/Do-Not-Disturb modes.
                </p>
              </div>
            </div>

            {/* 3. Battery Exemption */}
            <div className="flex items-start space-x-3 p-3 rounded-[12px] bg-[#F9F9F9] border border-[#EBEBEB]">
              <div className="w-8 h-8 rounded-[8px] bg-[#000000] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#000000]">Battery Exemption</h4>
                <p className="text-[11px] text-[#5E5E5E] leading-tight mt-0.5">
                  Prevents Android/iOS background task killers from putting your alarm to sleep.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-2">
          <button
            onClick={onComplete}
            id="btn-grant-access"
            className="w-full h-12 rounded-[12px] bg-[#000000] text-white font-bold text-sm tracking-wide flex items-center justify-center space-x-2 hover:bg-[#222222] active:scale-[0.98] transition-all shadow-md"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Grant Access & Start</span>
          </button>
          <p className="text-center text-[10px] text-[#5E5E5E] mt-2 font-medium">
            100% Offline & Private • Zero Cloud Latency
          </p>
        </div>
      </div>
    </div>
  );
};
