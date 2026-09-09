import React from 'react';
import { WakeUpStats, UserSettings } from '../types';
import { Flame, Clock, Puzzle, Zap, CheckCircle2, Award, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsViewProps {
  stats: WakeUpStats;
  settings: UserSettings;
  onQuickTestAlarm: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, settings, onQuickTestAlarm }) => {
  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* 1. Large Wake Streak Hero Card matching stats - streak on.png */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs flex flex-col items-center justify-center text-center"
      >
        {/* Active Streak Flame - #FF7B00 is reserved exclusively for the active-streak flame */}
        <div className="w-12 h-12 rounded-full bg-[#FFF4E8] flex items-center justify-center mb-1">
          <Flame className="w-7 h-7 text-[#FF7B00] fill-[#FF7B00]" />
        </div>

        <span className="text-[13px] font-medium text-[#7A7A7A] mt-1">
          Wake Streak
        </span>
        <h2 className="text-3xl font-extrabold text-[#000000] tracking-tight mt-0.5">
          {stats.streak} Days
        </h2>
      </motion.div>

      {/* 2. Two-Column Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left: Avg. Wake Time */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded-[20px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs flex flex-col justify-between"
        >
          <div className="w-7 h-7 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#555555] mb-4">
            <Clock className="w-4 h-4 text-[#000000]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#000000] tracking-tight leading-none">
              {stats.avgWakeTime}
            </h3>
            <p className="text-[11px] font-medium text-[#7A7A7A] mt-1.5">
              Avg. Wake Time
            </p>
          </div>
        </motion.div>

        {/* Right: Challenges Solved */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-[20px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs flex flex-col justify-between"
        >
          <div className="w-7 h-7 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#555555] mb-4">
            <Puzzle className="w-4 h-4 text-[#000000]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#000000] tracking-tight leading-none">
              {stats.totalChallengesSolved}
            </h3>
            <p className="text-[11px] font-medium text-[#7A7A7A] mt-1.5">
              Challenges Solved
            </p>
          </div>
        </motion.div>
      </div>

      {/* 3. Last 7 Days Activity Card matching stats - streak on.png */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#000000]">
            Last 7 Days
          </h3>
          <span className="text-[11px] font-medium text-[#7A7A7A] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#000000]" />
            100% On-time
          </span>
        </div>

        {/* Subtle Horizontal Grid lines with Day Columns */}
        <div className="relative pt-3 pb-2">
          {/* Background subtle divider lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="border-b border-[#EAEAEA] w-full h-0" />
            <div className="border-b border-[#EAEAEA] w-full h-0" />
            <div className="border-b border-[#EAEAEA] w-full h-0" />
            <div className="border-b border-[#EAEAEA] w-full h-0" />
          </div>

          {/* Activity Columns for each day */}
          <div className="relative z-10 flex items-end justify-between h-28 px-2">
            {stats.last7Days.map((day) => {
              // Height representing completion consistency
              const barHeight = day.completed ? 'h-20' : 'h-3';
              return (
                <div key={day.dayName} className="flex flex-col items-center flex-1">
                  {/* Visual Bar / Pill */}
                  <div className="w-6 h-20 flex items-end justify-center mb-2">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{ originY: 1 }}
                      className={`w-2.5 rounded-full transition-all ${
                        day.isToday
                          ? 'bg-[#000000] h-20 shadow-xs'
                          : day.completed
                          ? 'bg-[#222222] h-16'
                          : 'bg-[#E5E5E5] h-3'
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[11px] tracking-tight transition-colors ${
                      day.isToday
                        ? 'font-bold text-[#000000]'
                        : 'font-medium text-[#7A7A7A]'
                    }`}
                  >
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 4. Challenge Performance Breakdown (Avg Speed & Success Rate) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#000000]">
            Challenge Efficiency
          </h3>
          <div className="flex items-center space-x-1 text-[11px] font-semibold text-[#000000]">
            <Zap className="w-3.5 h-3.5 text-[#000000]" />
            <span>{stats.avgCompletionTimeSeconds}s Avg Time</span>
          </div>
        </div>

        {/* Math Puzzle Stats Row */}
        <div className="p-3.5 rounded-[16px] bg-[#F9F9F9] border border-[#EEEEEE] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#000000] text-white flex items-center justify-center text-xs font-mono font-bold">
              1+2
            </div>
            <div>
              <p className="text-xs font-bold text-[#000000]">Math Puzzle</p>
              <p className="text-[11px] text-[#7A7A7A]">{stats.mathSolvedCount} equations solved</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-extrabold text-[#000000]">{stats.mathSuccessRate}%</span>
            <p className="text-[10px] text-[#7A7A7A] font-medium">Success Rate</p>
          </div>
        </div>

        {/* Shake Phone Stats Row */}
        <div className="p-3.5 rounded-[16px] bg-[#F9F9F9] border border-[#EEEEEE] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#000000] text-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#000000]">Shake Phone</p>
              <p className="text-[11px] text-[#7A7A7A]">{stats.shakeSolvedCount} wake-up shakes</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-extrabold text-[#000000]">{stats.shakeSuccessRate}%</span>
            <p className="text-[10px] text-[#7A7A7A] font-medium">Success Rate</p>
          </div>
        </div>
      </motion.div>

      {/* 5. User Profile Card & Offline-First Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-sm">
            {settings.userName ? settings.userName.substring(0, 2).toUpperCase() : 'AS'}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-sm font-bold text-[#000000]">
                {settings.userName || 'Alex'}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-[#F0F0F0] text-[10px] font-semibold text-[#555555]">
                Level 4 Awakener
              </span>
            </div>
            <p className="text-[11px] text-[#7A7A7A] mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#000000]" />
              Offline-first • Stored securely on device
            </p>
          </div>
        </div>

        <button
          onClick={onQuickTestAlarm}
          className="p-2 rounded-full hover:bg-black/5 active:scale-95 text-[#000000] transition-transform"
          title="Test wake-up now"
        >
          <ArrowUpRight className="w-5 h-5 text-[#000000]" />
        </button>
      </motion.div>
    </div>
  );
};
