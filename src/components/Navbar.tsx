import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onAddAlarm: () => void;
  showAddButton?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onAddAlarm,
  showAddButton = true,
}) => {
  return (
    <header className="absolute top-4 sm:top-6 left-4 right-4 z-40 pointer-events-none flex justify-center select-none pt-safe">
      {/* Liquid Glass Floating Navbar Container */}
      <div
        id="floating-navbar"
        className="pointer-events-auto w-full max-w-[335px] h-14 px-4 rounded-[22px] bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex items-center justify-between transition-all"
        style={{
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          backdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {/* Left: Official Anti-Snooze Logo with clock hands */}
        <div className="flex items-center space-x-2">
          <BrandLogo className="w-9 h-7 text-[#000000]" />
          <span className="sr-only">Anti-Snooze</span>
        </div>

        {/* Right: Only the Add '+' Button */}
        {showAddButton ? (
          <motion.button
            id="btn-nav-add-alarm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={onAddAlarm}
            className="w-9 h-9 rounded-full bg-transparent hover:bg-black/5 active:bg-black/10 flex items-center justify-center text-[#000000] transition-colors"
            title="Add New Alarm"
            aria-label="Add New Alarm"
          >
            <Plus className="w-6 h-6 stroke-[2.2] text-[#000000]" />
          </motion.button>
        ) : (
          <div className="w-9 h-9" />
        )}
      </div>
    </header>
  );
};
