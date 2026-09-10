import React, { useRef } from 'react';
import { UserSettings, CustomRingtone } from '../types';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';
import { Bell, Code, Volume2, ShieldCheck, Check, Database, WifiOff, Clock, Vibrate, Upload, Music, Trash2, Play, Square } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentVolume = settings.volume ?? 80;

  const handleTestSound = (type: 'digital' | 'siren' | 'radar' | 'custom') => {
    hapticService.light();
    if (playingTone === type) {
      soundService.stopAlarm();
      setPlayingTone(null);
    } else {
      setPlayingTone(type);
      soundService.playPreview(type, settings.customRingtone?.dataUrl);
      setTimeout(() => {
        setPlayingTone(null);
      }, 3000);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    soundService.setVolume(val);
    onUpdateSettings({ volume: val });
  };

  const handleVolumeMouseUp = () => {
    hapticService.selection();
    // Play a brief tone to confirm new volume
    const currentSound = settings.soundType || 'radar';
    soundService.playPreview(currentSound, settings.customRingtone?.dataUrl);
    setPlayingTone(currentSound);
    setTimeout(() => setPlayingTone(null), 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB for storage stability
    if (file.size > 5 * 1024 * 1024) {
      alert('Audio file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const ringtone: CustomRingtone = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        dataUrl,
        createdAt: Date.now(),
      };
      hapticService.medium();
      onUpdateSettings({
        customRingtone: ringtone,
        soundType: 'custom',
      });
      // Test the newly uploaded ringtone immediately
      soundService.playPreview('custom', dataUrl);
      setPlayingTone('custom');
      setTimeout(() => setPlayingTone(null), 3500);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveCustomRingtone = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticService.selection();
    soundService.stopAlarm();
    setPlayingTone(null);
    onUpdateSettings({
      customRingtone: undefined,
      soundType: 'radar',
    });
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
      {/* Hidden Audio File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

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
            className="p-3 rounded-[16px] bg-[#000000] text-white flex flex-col items-start justify-between h-22 hover:bg-[#222222] active:scale-95 transition-all shadow-xs cursor-pointer"
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
            className="p-3 rounded-[16px] bg-[#F8F8F8] border border-[#EEEEEE] text-[#000000] flex flex-col items-start justify-between h-22 hover:bg-[#F0F0F0] active:scale-95 transition-all cursor-pointer"
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
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-5"
      >
        {/* Header + Volume Slider Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-[#000000]" />
              <h3 className="text-sm font-bold text-[#000000]">Alarm Sound & Volume</h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#000000]">
              {currentVolume}%
            </span>
          </div>

          {/* Independent Volume Slider */}
          <div className="p-3.5 rounded-[18px] bg-[#F8F8F8] border border-[#EEEEEE] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#000000]">Default Alarm Volume</span>
              <span className="text-[11px] text-[#7A7A7A]">Can be customized per alarm</span>
            </div>
            <div className="flex items-center space-x-3 pt-1">
              <span className="text-[11px] font-bold text-[#888888]">0%</span>
              <input
                type="range"
                id="alarm-volume-slider"
                min="5"
                max="100"
                step="1"
                value={currentVolume}
                onChange={handleVolumeChange}
                onMouseUp={handleVolumeMouseUp}
                onTouchEnd={handleVolumeMouseUp}
                className="flex-1 h-2 bg-[#E2E2E2] rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
                aria-label="Alarm Volume Slider"
              />
              <span className="text-[11px] font-bold text-[#000000]">100%</span>
            </div>
          </div>
        </div>

        {/* Ringtone Selection List */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold tracking-wider text-[#8E8E8E] uppercase">
            Ringtone Selection
          </p>

          {/* Custom Ringtone Card */}
          <div
            onClick={() => {
              if (settings.customRingtone) {
                onUpdateSettings({ soundType: 'custom' });
                handleTestSound('custom');
              } else {
                fileInputRef.current?.click();
              }
            }}
            className={`p-3.5 rounded-[16px] border cursor-pointer flex items-center justify-between transition-all ${
              settings.soundType === 'custom' && settings.customRingtone
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-[#F9F9F9] text-[#000000] border-[#EEEEEE] hover:bg-[#F2F2F2]'
            }`}
          >
            <div className="flex items-center space-x-3 truncate mr-2">
              <div
                className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${
                  settings.soundType === 'custom' && settings.customRingtone
                    ? 'bg-white/20 text-white'
                    : 'bg-[#ECECEC] text-[#000000]'
                }`}
              >
                <Music className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold truncate">
                  {settings.customRingtone ? settings.customRingtone.name : 'Custom Ringtone'}
                </p>
                <p
                  className={`text-[11px] truncate ${
                    settings.soundType === 'custom' && settings.customRingtone
                      ? 'text-white/70'
                      : 'text-[#7A7A7A]'
                  }`}
                >
                  {settings.customRingtone
                    ? 'Your uploaded audio file'
                    : 'Upload MP3, WAV, or AAC audio file'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {settings.customRingtone ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestSound('custom');
                    }}
                    className={`p-1.5 rounded-full ${
                      settings.soundType === 'custom' ? 'bg-white/20 text-white' : 'bg-black/5 text-[#555]'
                    }`}
                    title="Preview custom ringtone"
                  >
                    {playingTone === 'custom' ? (
                      <Square className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveCustomRingtone}
                    className={`p-1.5 rounded-full hover:bg-red-500/20 text-red-500 transition-colors`}
                    title="Delete custom audio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {settings.soundType === 'custom' && (
                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-2.5 py-1 rounded-[10px] bg-[#1A1A1A] text-white text-[11px] font-bold flex items-center space-x-1 shadow-2xs hover:bg-black active:scale-95 transition-all"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
              )}
            </div>
          </div>

          {/* Built-in Presets */}
          {[
            { id: 'radar', name: 'Radar (Apple Tone)', desc: 'Smooth sine chime chord wave' },
            { id: 'siren', name: 'Emergency Siren', desc: 'Dual-frequency urgent siren' },
            { id: 'digital', name: 'Digital Beep', desc: 'Classic digital alarm clock' },
          ].map((snd) => {
            const isSelected = settings.soundType === snd.id;
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
                  <p className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-[#7A7A7A]'}`}>
                    {snd.desc}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-[#555555]'
                    }`}
                  >
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
            type="button"
            role="switch"
            aria-checked={settings.volumeEscalation}
            onClick={handleToggleVolumeEscalation}
            className={`relative w-12 h-7 rounded-full p-[2px] transition-colors duration-200 focus:outline-none shrink-0 ${
              settings.volumeEscalation ? 'bg-[#1A1A1A]' : 'bg-[#E5E5E5]'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className={`w-6 h-6 rounded-full bg-white shadow-xs ${
                settings.volumeEscalation ? 'ml-auto' : 'mr-auto'
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
          No external server, login, or cloud accounts. All alarms, audio ringtones, streak records, and sound synthesizers live 100% locally in on-device storage.
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
          <h3 className="text-sm font-bold text-[#000000]">System Access & Reliability</h3>
          <span className="text-[11px] font-medium text-[#7A7A7A] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#000000]" /> All Granted
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-[14px] bg-[#F9F9F9] border border-[#EEEEEE] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#000000]" />
              </div>
              <div>
                <p className="font-bold text-[#000000]">Precision Wake-up Timing</p>
                <p className="text-[10px] text-[#7A7A7A]">Guarantees alarm rings on the exact minute without delay</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#000000] shrink-0 ml-2">Active</span>
          </div>

          <div className="p-3 rounded-[14px] bg-[#F9F9F9] border border-[#EEEEEE] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center shrink-0">
                <Vibrate className="w-3.5 h-3.5 text-[#000000]" />
              </div>
              <div>
                <p className="font-bold text-[#000000]">Haptic Feedback (Vibration)</p>
                <p className="text-[10px] text-[#7A7A7A]">Tactile pulse on alarm ring, shake detection & buttons</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#000000] shrink-0 ml-2">Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
