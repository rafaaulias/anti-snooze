import React, { useEffect } from 'react';
import { CheckCircle2, Flame, ArrowRight, Clock, Award } from 'lucide-react';
import { hapticService } from '../services/hapticService';

interface SuccessScreenProps {
  timeDismissed: string;
  streak: number;
  durationSeconds: number;
  challengeType: 'math' | 'shake';
  alarmLabel: string;
  onDone: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  timeDismissed,
  streak,
  durationSeconds,
  challengeType,
  alarmLabel,
  onDone,
}) => {
  useEffect(() => {
    hapticService.dismissSuccess();
  }, []);

  const handleDoneClick = () => {
    hapticService.medium();
    onDone();
  };
  return (
    <div 
      id="screen-success"
      className="fixed inset-0 z-50 bg-[#FFFFFF] text-[#000000] flex flex-col justify-between p-6 select-none"
    >
      <div className="w-full pt-4 flex justify-center">
        <div className="px-3 py-1 rounded-full bg-[#F9F9F9] border border-[#E5E5E5] text-xs font-semibold text-[#5E5E5E]">
          {alarmLabel || 'Alarm Dismissed'}
        </div>
      </div>

      {/* Center Success Card */}
      <div className="my-auto flex flex-col items-center text-center max-w-xs mx-auto">
        {/* Animated Checkmark */}
        <div className="w-20 h-20 rounded-full bg-[#000000] text-white flex items-center justify-center mb-6 shadow-xl animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-[#000000]">
          Alarm dismissed
        </h1>

        <p className="text-sm font-semibold text-[#5E5E5E] mt-2 flex items-center justify-center space-x-1">
          <Clock className="w-4 h-4 text-[#5E5E5E]" />
          <span>Dismissed at {timeDismissed}</span>
        </p>

        {/* Streak Counter Pill (#FF7B00 reserved exclusively for the active-streak flame) */}
        <div className="mt-6 w-full p-4 rounded-[16px] bg-[#F9F9F9] border border-[#E5E5E5] flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center shadow-xs">
              {/* Active-streak flame color token #FF7B00 */}
              <Flame className="w-6 h-6 text-[#FF7B00] fill-[#FF7B00]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#000000] block">
                {streak} Day Streak
              </span>
              <span className="text-[11px] text-[#5E5E5E]">
                You defeated snooze again!
              </span>
            </div>
          </div>
          <div className="text-right">
            <Award className="w-5 h-5 text-[#000000] ml-auto" />
          </div>
        </div>

        {/* Performance metrics */}
        <div className="mt-3 w-full grid grid-cols-2 gap-2 text-left">
          <div className="p-3 rounded-[12px] bg-[#F9F9F9] border border-[#EBEBEB]">
            <span className="text-[10px] font-bold text-[#5E5E5E] uppercase tracking-wider block">
              Time to Wake
            </span>
            <span className="text-base font-extrabold font-mono text-[#000000]">
              {durationSeconds}s
            </span>
          </div>
          <div className="p-3 rounded-[12px] bg-[#F9F9F9] border border-[#EBEBEB]">
            <span className="text-[10px] font-bold text-[#5E5E5E] uppercase tracking-wider block">
              Challenge
            </span>
            <span className="text-sm font-bold text-[#000000] capitalize">
              {challengeType === 'math' ? 'Math Solved' : 'Phone Shaken'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Done Button */}
      <div className="w-full max-w-sm mx-auto pb-6">
        <button
          onClick={handleDoneClick}
          id="btn-dismiss-done"
          className="w-full h-14 rounded-[16px] bg-[#000000] text-white font-extrabold text-base tracking-wide flex items-center justify-center space-x-2 hover:bg-[#222222] active:scale-[0.98] transition-all shadow-md"
        >
          <span>Done</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
