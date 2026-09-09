import React from 'react';
import { UserSettings } from '../types';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';
import { Bell, Code, Volume2, ShieldCheck, Smartphone, RotateCcw, Check, Sparkles, Database, WifiOff, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onQuickTestAlarm: () => void;
  onOpenExpoExport: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onQuickTestAlarm,
  onOpenExpoExport,
}) => {
  const [playingTone, setPlayingTone] = React.useState<string | null>(null);

  const handleTestSound = (type: 'digital' | 'siren' | 'radar') => {
    hapticService.light();
    if (playingTone === type) {
      soundService.stopAlarm();
      setPlayingTone(null);
    } else {
      setPlayingTone(type);
      if (type === 'digital') {
        soundService.playTone(880, 0.4, 'square', 0.25);
      } else if (type === 'radar') {
        soundService.playTone(587, 0.35, 'sine', 0.3);
      } else {
        soundService.playTone(950, 0.4, 'sawtooth', 0.25);
      }
      setTimeout(() => setPlayingTone(null), 600);
    }
  };

  const handleToggleVolumeEscalation = () => {
    const nextVal = !settings.volumeEscalation;
    if (nextVal) {
      hapticService.medium();
    } else {
      hapticService.selection();
    }
    onUpdateSettings({ volumeEscalation: nextVal });
  };

  return (
    <div className="space-y-4 pb-28 pt-2 select-none">
      {/* 1. Quick Actions Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-3"
      >
        <h3 className="text-sm font-bold text-[#000000]">Alarm Testing & Code</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="btn-settings-test-alarm"
            onClick={() => {
              hapticService.medium();
              onQuickTestAlarm();
            }}
            className="p-3 rounded-[16px] bg-[#000000] text-white flex flex-col items-start justify-between h-22 hover:bg-[#222222] active:scale-95 transition-all shadow-xs"
          >
            <Bell className="w-4 h-4 text-white" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">Test Alarm</p>
              <p className="text-[10px] text-white/70">Trigger ring & challenge</p>
            </div>
          </button>

          <button
            id="btn-settings-expo-code"
            onClick={() => {
              hapticService.selection();
              onOpenExpoExport();
            }}
            className="p-3 rounded-[16px] bg-[#F8F8F8] border border-[#EEEEEE] text-[#000000] flex flex-col items-start justify-between h-22 hover:bg-[#F0F0F0] active:scale-95 transition-all"
          >
            <Code className="w-4 h-4 text-[#000000]" />
            <div>
              <p className="text-xs font-bold text-[#000000] leading-tight">Expo Go Code</p>
              <p className="text-[10px] text-[#7A7A7A]">React Native source</p>
            </div>
          </button>
        </div>
      </motion.div>

      {/* 2. Audio & Ringing Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-4"
      >
        <h3 className="text-sm font-bold text-[#000000]">Alarm Sound</h3>
        
        <div className="space-y-2">
          {[
            { id: 'radar', name: 'Radar (Apple Tone)', desc: 'Smooth sine chime wave' },
            { id: 'siren', name: 'Emergency Siren', desc: 'Dual-frequency urgent siren' },
            { id: 'digital', name: 'Digital Beep', desc: 'Classic digital alarm clock' },
          ].map((snd) => {
            const isSelected = (settings.soundType || 'radar') === snd.id;
            return (
              <div
                key={snd.id}
                onClick={() => {
                  onUpdateSettings({ soundType: snd.id as any });
                  handleTestSound(snd.id as any);
                }}
                className={`p-3.5 rounded-[16px] border cursor-pointer flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-[#F9F9F9] text-[#000000] border-[#EEEEEE] hover:bg-[#F2F2F2]'
                }`}
              >
                <div>
                  <p className="text-xs font-bold">{snd.name}</p>
                  <p className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-[#7A7A7A]'}`}>{snd.desc}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-[#555555]'}`}>
                    {playingTone === snd.id ? 'Playing...' : 'Tap to test'}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Volume Escalation Toggle */}
        <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#000000]">Volume Escalation</p>
            <p className="text-[11px] text-[#7A7A7A]">Ramp volume up to 100% until challenge is solved</p>
          </div>
          <button
            onClick={handleToggleVolumeEscalation}
            className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
              settings.volumeEscalation ? 'bg-[#000000]' : 'bg-[#E5E5E5]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.volumeEscalation ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* 3. 100% Offline & Data Privacy Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#000000] flex items-center gap-1.5">
            <WifiOff className="w-4 h-4 text-[#000000]" />
            <span>100% Offline-First</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#000000]">
            Zero Cloud
          </span>
        </div>

        <p className="text-xs text-[#555555] leading-relaxed">
          No external server, login, or cloud accounts. All alarms, streak records, and audio synthesizers live 100% locally in on-device storage. Works perfectly in Airplane Mode.
        </p>

        <div className="pt-1 flex items-center justify-between text-xs text-[#7A7A7A] border-t border-[#F0F0F0]">
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-[#000000]" /> On-device Storage
          </span>
          <span className="font-bold text-[#000000]">Active (Encrypted)</span>
        </div>
      </motion.div>

      {/* 4. Permissions Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#000000]">Device Permissions</h3>
          <span className="text-[11px] font-medium text-[#7A7A7A] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#000000]" /> All Granted
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-[14px] bg-[#F9F9F9] border border-[#EEEEEE] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#000000]">SCHEDULE_EXACT_ALARM</p>
              <p className="text-[10px] text-[#7A7A7A]">Fires at exact millisecond without OS delays</p>
            </div>
            <span className="text-[11px] font-bold text-[#000000]">Active</span>
          </div>

          <div className="p-3 rounded-[14px] bg-[#F9F9F9] border border-[#EEEEEE] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#000000]">Haptic Feedback (Vibration)</p>
              <p className="text-[10px] text-[#7A7A7A]">Physical tactile confirmation on toggle & dismissal</p>
            </div>
            <span className="text-[11px] font-bold text-[#000000]">Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
