import React from 'react';
import { Alarm, DayOfWeek } from '../types';
import { Play, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { hapticService } from '../services/hapticService';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  onTestThisAlarm: (alarm: Alarm) => void;
}

// In Home.png, the 7 day chips are displayed as M T W T F S S
const DAYS_ORDER: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

export const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  onToggle,
  onEdit,
  onTestThisAlarm,
}) => {
  // Format 24h to 12h display
  const [hoursStr, minutesStr] = alarm.time.split(':');
  const hoursNum = parseInt(hoursStr, 10);
  const period = hoursNum >= 12 ? 'PM' : 'AM';
  const displayHours = hoursNum % 12 === 0 ? 12 : hoursNum % 12;
  const displayTime = `${displayHours.toString().padStart(2, '0')}:${minutesStr}`;

  const challengeLabel =
    alarm.challengeType === 'math'
      ? `Math (${alarm.mathDifficulty || 'med'})`
      : `Shake (${alarm.shakeCountTarget || 30}x)`;
  const subTitle = `${alarm.label || 'Alarm'} • ${challengeLabel}`;

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !alarm.enabled;
    if (nextState) {
      hapticService.medium();
    } else {
      hapticService.selection();
    }
    onToggle(alarm.id, nextState);
  };

  return (
    <motion.div
      layout
      id={`alarm-card-${alarm.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: alarm.enabled ? 1 : 0.62,
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileTap={{ scale: 0.99 }}
      transition={{
        layout: { type: 'spring', stiffness: 380, damping: 30 },
        opacity: { duration: 0.25 },
      }}
      className={`relative p-4 rounded-[22px] border transition-colors duration-200 select-none overflow-hidden ${
        alarm.enabled
          ? 'bg-[#FFFFFF] border-[#F0F0F0] shadow-xs'
          : 'bg-[#FAFAFA] border-[#E8E8E8]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Left: Time & Subtitle (clickable to edit) */}
        <div
          onClick={() => onEdit(alarm)}
          className="cursor-pointer flex-1 min-w-0 pr-1"
        >
          {/* Large Digit Time with AM/PM beside it */}
          <div className="flex items-baseline space-x-1.5">
            <motion.span
              animate={{ color: alarm.enabled ? '#000000' : '#444444' }}
              className="text-[34px] sm:text-[38px] font-extrabold tracking-tight leading-none"
            >
              {displayTime}
            </motion.span>
            <span className="text-[12px] font-bold text-[#7A7A7A] tracking-tight">
              {period}
            </span>
          </div>

          {/* Subtitle: e.g. "School Time • Shake (30x)" and Volume */}
          <div className="flex items-center space-x-1.5 text-[12px] font-medium text-[#7A7A7A] mt-1 truncate">
            <span className="truncate">{subTitle}</span>
            <span className="text-[#CCCCCC]">•</span>
            <span className="inline-flex items-center space-x-0.5 shrink-0 text-[#666666]">
              <Volume2 className="w-3 h-3" />
              <span className="font-mono text-[11px]">{alarm.volume !== undefined ? alarm.volume : 80}%</span>
            </span>
          </div>

          {/* Bottom Row: Day Chips (M T W T F S S) & Quick Test Button */}
          <div className="flex items-center justify-between mt-3.5 gap-2">
            <div className="flex items-center space-x-1">
              {DAYS_ORDER.map(({ key, label }, idx) => {
                const isActive = alarm.days.includes(key);
                return (
                  <motion.span
                    key={`${alarm.id}-${key}-${idx}`}
                    animate={{
                      backgroundColor: isActive
                        ? alarm.enabled
                          ? '#1A1A1A'
                          : '#555555'
                        : '#ECECEC',
                      color: isActive ? '#FFFFFF' : '#9A9A9A',
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  >
                    {label}
                  </motion.span>
                );
              })}
            </div>

            {/* Test Alarm Button in each alarm card */}
            <motion.button
              type="button"
              id={`btn-test-alarm-${alarm.id}`}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={(e) => {
                e.stopPropagation();
                hapticService.light();
                onTestThisAlarm(alarm);
              }}
              className="h-6 px-2 rounded-full bg-[#F3F3F3] hover:bg-[#EBEBEB] active:bg-[#E0E0E0] text-[#000000] text-[10px] font-semibold flex items-center space-x-1 transition-colors border border-[#E5E5E5]/60 shadow-2xs shrink-0"
              title="Test this alarm ring and challenge"
            >
              <Play className="w-2.5 h-2.5 fill-[#000000] text-[#000000]" />
              <span>Test</span>
            </motion.button>
          </div>
        </div>

        {/* Right: iOS Style Switch with Smooth Animation and Zero Overflow */}
        <div className="pt-0.5 shrink-0">
          <button
            type="button"
            role="switch"
            aria-checked={alarm.enabled}
            id={`toggle-alarm-${alarm.id}`}
            onClick={handleToggleClick}
            className={`relative w-12 h-7 rounded-full transition-colors duration-250 focus:outline-none p-[2px] block shrink-0 ${
              alarm.enabled ? 'bg-[#1A1A1A]' : 'bg-[#E5E5E5]'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className={`w-6 h-6 rounded-full bg-white shadow-sm ${
                alarm.enabled ? 'ml-auto' : 'mr-auto'
              }`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
