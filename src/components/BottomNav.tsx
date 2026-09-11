import React from 'react';
import { NavTab } from '../types';
import { Clock, BarChart3, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { AppLanguage, t } from '../services/i18n';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language?: AppLanguage;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  language = 'en',
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'alarms', label: t('alarms', language), icon: Clock },
    { id: 'stats', label: t('stats', language), icon: BarChart3 },
    { id: 'settings', label: t('settings', language), icon: Settings },
  ];

  return (
    <div
      id="bottom-nav-container"
      className="fixed sm:absolute bottom-3 sm:bottom-6 inset-x-0 z-40 pointer-events-none flex justify-center select-none px-4 pb-[env(safe-area-inset-bottom,0px)]"
    >
      {/* Liquid Glass Floating Navigation Bar with 3 Evenly Spaced Tabs */}
      <nav
        id="bottom-floating-nav"
        className="pointer-events-auto w-full max-w-[340px] h-[58px] sm:h-16 px-1.5 py-1 rounded-[26px] sm:rounded-[28px] bg-white/90 backdrop-blur-2xl border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] grid grid-cols-3 gap-1 items-center"
        style={{
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          backdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        {tabs.map((tab) => {
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
              className={`relative flex items-center justify-center h-11 sm:h-12 w-full rounded-[20px] sm:rounded-[22px] transition-colors ${
                isActive ? 'text-white' : 'text-[#7A7A7A] hover:text-[#000000]'
              }`}
            >
              {/* Active animated pill background */}
              {isActive && (
                <motion.div
                  layoutId="active-bottom-nav-pill"
                  className="absolute inset-0 rounded-[20px] sm:rounded-[22px] bg-[#1A1A1A] shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex items-center justify-center space-x-1 sm:space-x-1.5 px-1">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-white stroke-[2.4] scale-105' : 'text-current stroke-[2]'
                  }`}
                />
                <span className="text-[11px] sm:text-[12px] font-semibold tracking-tight whitespace-nowrap">
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
