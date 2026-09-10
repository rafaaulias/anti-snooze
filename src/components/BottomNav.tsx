import React from 'react';
import { NavTab } from '../types';
import { Clock, BarChart3, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

interface TabItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: 'alarms', label: 'Alarms', icon: Clock },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  return (
    <div className="absolute bottom-4 sm:bottom-6 left-4 right-4 z-40 pointer-events-none flex justify-center select-none pb-safe">
      {/* Liquid Glass Floating Navigation Bar with 3 Evenly Spaced Tabs */}
      <nav
        id="bottom-floating-nav"
        className="pointer-events-auto w-full max-w-[335px] h-16 p-1.5 rounded-[28px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] grid grid-cols-3 gap-1 items-center"
        style={{
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          backdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 450, damping: 26 }}
              className={`relative flex items-center justify-center h-12 w-full rounded-[22px] transition-colors ${
                isActive ? 'text-white' : 'text-[#7A7A7A] hover:text-[#000000]'
              }`}
            >
              {/* Active animated pill background */}
              {isActive && (
                <motion.div
                  layoutId="active-bottom-nav-pill"
                  className="absolute inset-0 rounded-[22px] bg-[#1A1A1A] shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex items-center space-x-1.5 px-2">
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-white stroke-[2.4] scale-105' : 'text-current stroke-[2]'
                  }`}
                />
                <span className="text-[12px] font-semibold tracking-tight whitespace-nowrap">
                  {tab.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};
