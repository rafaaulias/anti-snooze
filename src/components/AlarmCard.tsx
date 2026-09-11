import React from 'react';
import { Alarm, DayOfWeek } from '../types';
import { Play, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { hapticService } from '../services/hapticService';
import { AppLanguage, formatTimeString, t } from '../services/i18n';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  onTestThisAlarm: (alarm: Alarm) => void;
  use24HourFormat?: boolean;
  language?: AppLanguage;
}

const DAYS_KEYS: { key: DayOfWeek; i18nKey: 'daysMon' | 'daysTue' | 'daysWed' | 'daysThu' | 'daysFri' | 'daysSat' | 'daysSun' }[] = [
  { key: 'mon', i18nKey: 'daysMon' },
  { key: 'tue', i18nKey: 'daysTue' },
  { key: 'wed', i18nKey: 'daysWed' },
  { key: 'thu', i18nKey: 'daysThu' },
  { key: 'fri', i18nKey: 'daysFri' },
  { key: 'sat', i18nKey: 'daysSat' },
  { key: 'sun', i18nKey: 'daysSun' },
];

export const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  onToggle,
  onEdit,
  onTestThisAlarm,
  use24HourFormat = false,
  language = 'en',
}) => {
  const { timeFormatted, period } = formatTimeString(alarm.time, use24HourFormat);

  const challengeLabel =
    alarm.challengeType === 'math'
      ? `${t('mathPuzzle', language)} (${alarm.mathDifficulty || 'med'})`
      : `${t('shakePhone', language)} (${alarm.shakeCountTarget || 30}x)`;
  const subTitle = `${alarm.label || t('alarms', language)} • ${challengeLabel}`;

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
              {timeFormatted}
            </motion.span>
            {period && (
              <span className="text-[12px] font-bold text-[#7A7A7A] tracking-tight">
                {period}
              </span>
            )}
          </div>

          {/* Subtitle: e.g. "Morning Alarm • Shake (30x)" and Volume */}
          <div className="flex items-center space-x-1.5 text-[12px] font-medium text-[#7A7A7A] mt-1 truncate">
            <span className="truncate">{subTitle}</span>
            <span className="text-[#CCCCCC]">•</span>
            <span className="inline-flex items-center space-x-0.5 shrink-0 text-[#666666]">
              <Volume2 className="w-3 h-3 text-[#777777]" />
              <span className="text-[11px] font-mono font-bold text-[#555555]">
                {alarm.volume ?? 80}%
              </span>
            </span>
          </div>
        </div>

        {/* Right: iOS-Style Smooth Toggle Switch */}
        <button
          type="button"
          role="switch"
          id={`toggle-alarm-${alarm.id}`}
          aria-checked={alarm.enabled}
          onClick={handleToggleClick}
          className={`relative w-[50px] h-[30px] rounded-full p-[2px] transition-colors duration-200 focus:outline-none shrink-0 self-center cursor-pointer ${
            alarm.enabled ? 'bg-[#000000]' : 'bg-[#E5E5E5]'
          }`}
        >
          <motion.div
            layout
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 32,
            }}
            className={`w-[26px] h-[26px] rounded-full bg-white shadow-xs ${
              alarm.enabled ? 'ml-auto' : 'mr-auto'
            }`}
          />
        </button>
      </div>

      {/* Bottom Row: Day-chips and Quick Test Button */}
      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-[#F2F2F2]">
        {/* 7 Day Chips (M T W T F S S) */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {DAYS_KEYS.map(({ key, i18nKey }) => {
            const isDayActive = alarm.days.includes(key);
            const dayLabel = t(i18nKey, language);
            return (
              <div
                key={key}
                className={`w-[23px] h-[23px] sm:w-[25px] sm:h-[25px] rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  isDayActive
                    ? alarm.enabled
                      ? 'bg-[#000000] text-white shadow-2xs'
                      : 'bg-[#555555] text-white'
                    : 'bg-[#F2F2F2] text-[#888888]'
                }`}
              >
                {dayLabel}
              </div>
            );
          })}
        </div>

        {/* Quick Test Alarm button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            hapticService.selection();
            onTestThisAlarm(alarm);
          }}
          className="text-[11px] font-bold text-[#666666] hover:text-[#000000] active:scale-95 px-2.5 py-1 rounded-[10px] bg-[#F5F5F5] hover:bg-[#EAEAEA] transition-all flex items-center space-x-1 cursor-pointer"
          title="Test this alarm with its volume and challenge"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{t('test', language)}</span>
        </button>
      </div>
    </motion.div>
  );
};
