import React, { useRef, useState } from 'react';
import { UserSettings, CustomRingtone } from '../types';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';
import {
  Bell,
  Code,
  Volume2,
  ShieldCheck,
  Check,
  Database,
  WifiOff,
  Clock,
  Vibrate,
  Upload,
  Music,
  Trash2,
  Play,
  Square,
  Globe,
  RotateCcw,
  User,
  Sun,
  BellRing,
} from 'lucide-react';
import { motion } from 'motion/react';
import { t, AppLanguage } from '../services/i18n';
import { backgroundService } from '../services/backgroundService';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onQuickTestAlarm: () => void;
  onOpenExpoExport: () => void;
  onResetAllData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onQuickTestAlarm,
  onOpenExpoExport,
  onResetAllData,
}) => {
  const [playingTone, setPlayingTone] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState(settings.userName || '');
  const [isSavedNickname, setIsSavedNickname] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    backgroundService.getNotificationPermissionStatus()
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lang: AppLanguage = settings.language || 'en';
  const currentVolume = settings.volume ?? 80;

  const handleRequestNotif = async () => {
    hapticService.selection();
    const granted = await backgroundService.requestNotificationPermission();
    setNotifPermission(backgroundService.getNotificationPermissionStatus());
    onUpdateSettings({ notificationGranted: granted });
  };

  const handleToggleKeepAwake = () => {
    hapticService.selection();
    const nextVal = !(settings.keepScreenAwake !== false);
    onUpdateSettings({ keepScreenAwake: nextVal });
    backgroundService.setKeepAwake(nextVal);
  };

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
    const currentSound = settings.soundType || 'radar';
    soundService.playPreview(currentSound, settings.customRingtone?.dataUrl);
    setPlayingTone(currentSound);
    setTimeout(() => setPlayingTone(null), 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    hapticService.selection();
    onUpdateSettings({ userName: nicknameInput.trim() });
    setIsSavedNickname(true);
    setTimeout(() => setIsSavedNickname(false), 2000);
  };

  const handleResetDataClick = () => {
    hapticService.medium();
    const confirmed = window.confirm(t('resetConfirm', lang));
    if (confirmed && onResetAllData) {
      onResetAllData();
    }
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

      {/* 1. App Preferences (Language & Time Format) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-4"
      >
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-[#000000]" />
          <h3 className="text-sm font-bold text-[#000000]">
            {t('preferencesTitle', lang)}
          </h3>
        </div>

        {/* Language Selection Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#000000]">{t('languageLabel', lang)}</span>
            <span className="text-[11px] text-[#7A7A7A]">{t('languageDesc', lang)}</span>
          </div>

          <div className="grid grid-cols-2 p-1 rounded-[16px] bg-[#F5F5F5] border border-[#ECECEC] gap-1">
            <button
              type="button"
              id="lang-btn-en"
              onClick={() => {
                hapticService.selection();
                onUpdateSettings({ language: 'en' });
              }}
              className={`h-10 rounded-[12px] text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#555555] hover:text-[#000000]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              id="lang-btn-id"
              onClick={() => {
                hapticService.selection();
                onUpdateSettings({ language: 'id' });
              }}
              className={`h-10 rounded-[12px] text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                lang === 'id'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#555555] hover:text-[#000000]'
              }`}
            >
              Bahasa Indonesia
            </button>
          </div>
        </div>

        {/* Time Format Selection Toggle */}
        <div className="space-y-2 pt-2 border-t border-[#F0F0F0]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#000000]">{t('timeFormatLabel', lang)}</span>
            <span className="text-[11px] text-[#7A7A7A]">{t('timeFormatDesc', lang)}</span>
          </div>

          <div className="grid grid-cols-2 p-1 rounded-[16px] bg-[#F5F5F5] border border-[#ECECEC] gap-1">
            <button
              type="button"
              id="timeformat-btn-12"
              onClick={() => {
                hapticService.selection();
                onUpdateSettings({ use24HourFormat: false });
              }}
              className={`h-10 rounded-[12px] text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                !settings.use24HourFormat
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#555555] hover:text-[#000000]'
              }`}
            >
              {t('timeFormat12', lang)}
            </button>
            <button
              type="button"
              id="timeformat-btn-24"
              onClick={() => {
                hapticService.selection();
                onUpdateSettings({ use24HourFormat: true });
              }}
              className={`h-10 rounded-[12px] text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                settings.use24HourFormat
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#555555] hover:text-[#000000]'
              }`}
            >
              {t('timeFormat24', lang)}
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Nickname Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-3"
      >
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-[#000000]" />
          <h3 className="text-sm font-bold text-[#000000]">{t('nicknameTitle', lang)}</h3>
        </div>
        <p className="text-[11px] text-[#7A7A7A] leading-relaxed">
          {t('nicknameDesc', lang)}
        </p>

        <form onSubmit={handleSaveNickname} className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            id="nickname-input"
            maxLength={24}
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder={t('nicknamePlaceholder', lang)}
            className="flex-1 h-11 px-3.5 rounded-[14px] bg-[#F7F7F7] border border-[#E2E2E2] text-xs font-semibold text-[#000000] placeholder:text-[#999999] focus:outline-none focus:border-[#000000] focus:bg-[#FFFFFF] transition-all"
          />
          <button
            type="submit"
            id="btn-save-nickname"
            className="h-11 px-4 rounded-[14px] bg-[#1A1A1A] text-white font-bold text-xs flex items-center space-x-1.5 hover:bg-[#000000] active:scale-95 transition-all cursor-pointer shrink-0"
          >
            {isSavedNickname ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Saved</span>
              </>
            ) : (
              <span>{t('saveNickname', lang)}</span>
            )}
          </button>
        </form>
      </motion.div>

      {/* 3. Quick Actions Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-3"
      >
        <h3 className="text-sm font-bold text-[#000000]">{t('alarmTestingCode', lang)}</h3>
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
              <p className="text-xs font-bold text-white leading-tight">{t('testAlarmBtn', lang)}</p>
              <p className="text-[10px] text-white/70">{t('testAlarmDesc', lang)}</p>
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
              <p className="text-xs font-bold text-[#000000] leading-tight">{t('expoCodeBtn', lang)}</p>
              <p className="text-[10px] text-[#7A7A7A]">{t('expoCodeDesc', lang)}</p>
            </div>
          </button>
        </div>
      </motion.div>

      {/* 4. Audio & Ringing Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-5"
      >
        {/* Header + Volume Slider Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-[#000000]" />
              <h3 className="text-sm font-bold text-[#000000]">{t('soundVolumeTitle', lang)}</h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#000000]">
              {currentVolume}%
            </span>
          </div>

          {/* Independent Volume Slider */}
          <div className="p-3.5 rounded-[18px] bg-[#F8F8F8] border border-[#EEEEEE] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#000000]">{t('alarmVolume', lang)}</span>
              <span className="text-[11px] text-[#7A7A7A]">0% - 100%</span>
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
            {t('ringtoneSelection', lang)}
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
                  {settings.customRingtone ? settings.customRingtone.name : t('customTone', lang)}
                </p>
                <p
                  className={`text-[11px] truncate ${
                    settings.soundType === 'custom' && settings.customRingtone
                      ? 'text-white/70'
                      : 'text-[#7A7A7A]'
                  }`}
                >
                  {settings.customRingtone
                    ? t('customAudioActive', lang)
                    : t('customAudioDesc', lang)}
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
                    className="p-1.5 rounded-full hover:bg-red-500/20 text-red-500 transition-colors"
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
                  <span>{t('uploadBtn', lang)}</span>
                </button>
              )}
            </div>
          </div>

          {/* Built-in Presets */}
          {[
            { id: 'radar', name: t('radarTone', lang), desc: 'Smooth sine chime chord wave' },
            { id: 'siren', name: t('sirenTone', lang), desc: 'Dual-frequency urgent siren' },
            { id: 'digital', name: t('digitalTone', lang), desc: 'Classic digital alarm clock' },
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
                    {playingTone === snd.id ? 'Playing...' : 'Test'}
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
            <p className="text-xs font-bold text-[#000000]">{t('volumeEscalation', lang)}</p>
            <p className="text-[11px] text-[#7A7A7A]">{t('volumeEscalationDesc', lang)}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.volumeEscalation}
            onClick={handleToggleVolumeEscalation}
            className={`relative w-12 h-7 rounded-full p-[2px] transition-colors duration-200 focus:outline-none shrink-0 cursor-pointer ${
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

      {/* 5. 100% Offline & Data Privacy Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#000000] flex items-center gap-1.5">
            <WifiOff className="w-4 h-4 text-[#000000]" />
            <span>{t('offlineTitle', lang)}</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#000000]">
            {t('zeroCloud', lang)}
          </span>
        </div>

        <p className="text-xs text-[#555555] leading-relaxed">
          {t('offlineDesc', lang)}
        </p>

        <div className="pt-1 flex items-center justify-between text-xs text-[#7A7A7A] border-t border-[#F0F0F0]">
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-[#000000]" /> {t('onDeviceStorage', lang)}
          </span>
          <span className="font-bold text-[#000000]">{t('activeEncrypted', lang)}</span>
        </div>
      </motion.div>

      {/* 6. System Permissions Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#000000]">{t('systemAccessTitle', lang)}</h3>
          <span className="text-[11px] font-medium text-[#7A7A7A] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#000000]" /> {t('allGranted', lang)}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-[14px] bg-[#F9F9F9] border border-[#EEEEEE] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#000000]" />
              </div>
              <div>
                <p className="font-bold text-[#000000]">{t('precisionTiming', lang)}</p>
                <p className="text-[10px] text-[#7A7A7A]">{t('precisionDesc', lang)}</p>
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
                <p className="font-bold text-[#000000]">{t('hapticFeedback', lang)}</p>
                <p className="text-[10px] text-[#7A7A7A]">{t('hapticDesc', lang)}</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#000000] shrink-0 ml-2">Active</span>
          </div>
        </div>
      </motion.div>

      {/* Background Reliability & Nightstand Mode */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.11 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-[#F0F0F0] shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#000000] flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-[#000000]" />
            <span>{t('keepAwakeTitle', lang)}</span>
          </h3>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#000000]">
            {backgroundService.isWakeLockSupported() ? t('wakeLockSupported', lang) : 'Web Mode'}
          </span>
        </div>

        <p className="text-[11px] text-[#7A7A7A] leading-relaxed">
          {t('keepAwakeDesc', lang)}
        </p>

        {/* Keep Screen Awake Switch */}
        <div className="p-3.5 rounded-[16px] bg-[#F9F9F9] border border-[#EEEEEE] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#000000]">Nightstand Screen Keep-Awake</p>
            <p className="text-[10px] text-[#7A7A7A]">Prevents screen sleep so alarm never throttles</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.keepScreenAwake !== false}
            onClick={handleToggleKeepAwake}
            className={`relative w-12 h-7 rounded-full p-[2px] transition-colors duration-200 focus:outline-none shrink-0 cursor-pointer ${
              settings.keepScreenAwake !== false ? 'bg-[#1A1A1A]' : 'bg-[#E5E5E5]'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className={`w-6 h-6 rounded-full bg-white shadow-xs ${
                settings.keepScreenAwake !== false ? 'ml-auto' : 'mr-auto'
              }`}
            />
          </button>
        </div>

        {/* Background Web Notifications */}
        <div className="p-3.5 rounded-[16px] bg-[#F9F9F9] border border-[#EEEEEE] flex items-center justify-between">
          <div className="flex items-center space-x-3 mr-2">
            <div className="w-7 h-7 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center shrink-0">
              <BellRing className="w-3.5 h-3.5 text-[#000000]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#000000]">{t('bgNotificationsTitle', lang)}</p>
              <p className="text-[10px] text-[#7A7A7A]">{t('bgNotificationsDesc', lang)}</p>
            </div>
          </div>

          {notifPermission === 'granted' ? (
            <span className="text-[11px] font-bold text-[#000000] shrink-0 px-2.5 py-1 bg-black/5 rounded-full">
              {t('notificationActive', lang)}
            </span>
          ) : notifPermission === 'denied' ? (
            <span className="text-[10px] font-bold text-red-500 shrink-0">
              {t('notificationDenied', lang)}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleRequestNotif}
              className="h-8 px-3 rounded-[10px] bg-[#1A1A1A] text-white font-bold text-[11px] hover:bg-[#000000] shrink-0 cursor-pointer"
            >
              {t('enableNotificationsBtn', lang)}
            </button>
          )}
        </div>
      </motion.div>

      {/* 7. Danger Zone: Reset App Data */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="p-5 rounded-[24px] bg-[#FFFFFF] border border-red-100 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-red-600" />
            <span>{t('resetDataTitle', lang)}</span>
          </h3>
        </div>
        <p className="text-[11px] text-[#7A7A7A] leading-relaxed">
          {t('resetDataDesc', lang)}
        </p>

        <button
          type="button"
          id="btn-reset-all-data"
          onClick={handleResetDataClick}
          className="w-full h-11 rounded-[14px] bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center space-x-2 border border-red-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('resetDataBtn', lang)}</span>
        </button>
      </motion.div>
    </div>
  );
};
