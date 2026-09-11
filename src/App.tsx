import React, { useState, useEffect, useRef } from 'react';
import { Alarm, UserSettings, NavTab, WakeUpStats } from './types';
import { storageService } from './services/storageService';
import { soundService } from './services/soundService';
import { backgroundService } from './services/backgroundService';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AlarmCard } from './components/AlarmCard';
import { AlarmModal } from './components/AlarmModal';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { OnboardingModal } from './components/OnboardingModal';
import { RingingScreen } from './components/RingingScreen';
import { ChallengeScreen } from './components/ChallengeScreen';
import { SuccessScreen } from './components/SuccessScreen';
import { ExpoExportModal } from './components/ExpoExportModal';
import { BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { t } from './services/i18n';

export default function App() {
  const [alarms, setAlarms] = useState<Alarm[]>(() => storageService.getAlarms());
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());
  const [stats, setStats] = useState<WakeUpStats>(() => storageService.getStats());

  // 3-tab navigation: 'alarms' | 'stats' | 'settings'
  const [currentTab, setCurrentTab] = useState<NavTab>('alarms');

  // Modal states
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!settings.onboardingCompleted);
  const [isExpoExportOpen, setIsExpoExportOpen] = useState(false);

  // Active Ringing Lifecycle
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'ringing' | 'challenge' | 'success'>('home');
  const [successInfo, setSuccessInfo] = useState<{
    timeDismissed: string;
    durationSeconds: number;
    challengeType: 'math' | 'shake';
    alarmLabel: string;
  } | null>(null);

  const lastTriggeredMinuteRef = useRef<string>('');

  const lang = settings.language || 'en';

  // Sync soundService base volume with user settings
  useEffect(() => {
    if (settings.volume !== undefined) {
      soundService.setVolume(settings.volume);
    }
  }, [settings.volume]);

  // Synchronize Screen Wake Lock based on user settings
  useEffect(() => {
    backgroundService.setKeepAwake(settings.keepScreenAwake !== false);
  }, [settings.keepScreenAwake]);

  // Clock status loop to trigger scheduled alarms with Web Worker unthrottled ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      const currentMinuteStr = `${hh}:${mm}`;

      if (currentScreen === 'home' && lastTriggeredMinuteRef.current !== currentMinuteStr) {
        const daysMap: Record<number, string> = {
          0: 'sun',
          1: 'mon',
          2: 'tue',
          3: 'wed',
          4: 'thu',
          5: 'fri',
          6: 'sat',
        };
        const currentDayKey = daysMap[now.getDay()];

        const matchedAlarm = alarms.find(
          (a) => a.enabled && a.time === currentMinuteStr && a.days.includes(currentDayKey as any)
        );

        if (matchedAlarm) {
          lastTriggeredMinuteRef.current = currentMinuteStr;
          triggerAlarm(matchedAlarm);
        }
      }
    };

    updateTime();
    backgroundService.registerTick(updateTime);
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [alarms, currentScreen]);

  // Trigger Alarm Flow
  const triggerAlarm = (alarm: Alarm) => {
    setRingingAlarm(alarm);
    setCurrentScreen('ringing');
    const effectiveSoundType = alarm.soundType || settings.soundType || 'radar';
    const effectiveVolume = alarm.volume !== undefined ? alarm.volume : (settings.volume ?? 80);
    soundService.startAlarm({
      soundType: effectiveSoundType,
      customDataUrl: settings.customRingtone?.dataUrl,
      volume: effectiveVolume,
      volumeEscalation: settings.volumeEscalation,
    });

    // If tab is in background or minimized, trigger rich notification and title flash
    if (document.hidden) {
      backgroundService.sendAlarmNotification(alarm.label, () => {
        window.focus();
      });
    }
  };

  // Quick Test Action
  const handleQuickTest = () => {
    const target = alarms[0] || {
      id: 'test-alarm',
      time: '06:30',
      label: lang === 'id' ? 'Alarm Pagi' : 'Morning Alarm',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      enabled: true,
      challengeType: 'math',
      mathDifficulty: 'medium',
      mathProblemCount: 1,
      shakeCountTarget: 15,
      createdAt: Date.now(),
    };
    triggerAlarm(target);
  };

  // Toggle Alarm Active/Inactive
  const handleToggleAlarm = (id: string, enabled: boolean) => {
    const updated = alarms.map((a) => (a.id === id ? { ...a, enabled } : a));
    setAlarms(updated);
    storageService.saveAlarms(updated);
  };

  // Edit Alarm
  const handleEditAlarm = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setIsAlarmModalOpen(true);
  };

  // Delete Alarm
  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter((a) => a.id !== id);
    setAlarms(updated);
    storageService.saveAlarms(updated);
  };

  // Save or Update Alarm
  const handleSaveAlarm = (
    alarmData: Omit<Alarm, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: Alarm[];
    if (existingId) {
      updated = alarms.map((a) =>
        a.id === existingId ? { ...a, ...alarmData } : a
      );
    } else {
      const newAlarm: Alarm = {
        ...alarmData,
        id: 'alarm-' + Date.now(),
        createdAt: Date.now(),
      };
      updated = [newAlarm, ...alarms];
    }
    setAlarms(updated);
    storageService.saveAlarms(updated);
    setEditingAlarm(null);
  };

  // Onboarding Complete
  const handleOnboardingComplete = (nickname: string) => {
    const newSettings: UserSettings = {
      ...settings,
      userName: nickname || settings.userName || '',
      onboardingCompleted: true,
      exactAlarmGranted: true,
      notificationGranted: true,
      batteryOptimExemptGranted: true,
    };
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    setIsOnboardingOpen(false);
  };

  // Update Settings
  const handleUpdateSettings = (newPartial: Partial<UserSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  // Reset all data
  const handleResetAllData = () => {
    storageService.resetAllData();
    setAlarms([]);
    const freshSettings = storageService.getSettings();
    setSettings(freshSettings);
    setStats(storageService.getStats());
    setIsOnboardingOpen(true);
    setCurrentTab('alarms');
  };

  // Start Challenge from Ringing Screen
  const handleStartChallenge = () => {
    setCurrentScreen('challenge');
  };

  // Challenge Completed Successfully
  const handleChallengeSuccess = (durationSeconds: number) => {
    if (!ringingAlarm) return;
    const { streak: updatedStreak, timeFormatted } = storageService.recordWakeUp(
      ringingAlarm.id,
      ringingAlarm.label,
      ringingAlarm.challengeType,
      durationSeconds
    );
    setSettings((s) => ({ ...s, streak: updatedStreak }));
    setStats(storageService.getStats());
    setSuccessInfo({
      timeDismissed: timeFormatted,
      durationSeconds,
      challengeType: ringingAlarm.challengeType,
      alarmLabel: ringingAlarm.label,
    });
    setCurrentScreen('success');
  };

  // Finish Success Screen
  const handleSuccessDone = () => {
    backgroundService.stopTitleFlashing();
    setRingingAlarm(null);
    setCurrentScreen('home');
    setSuccessInfo(null);
  };

  // Compute countdown to next active alarm
  const getNextAlarmCountdown = (): string => {
    const activeList = alarms.filter((a) => a.enabled);
    if (activeList.length === 0) return '';
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let minDiff = Infinity;
    for (const a of activeList) {
      const [h, m] = a.time.split(':').map(Number);
      const alarmMin = h * 60 + m;
      let diff = alarmMin - currentMinutes;
      if (diff <= 0) diff += 24 * 60;
      if (diff < minDiff) {
        minDiff = diff;
      }
    }

    if (minDiff === Infinity) return '';
    const hours = Math.floor(minDiff / 60);
    const mins = minDiff % 60;
    const prefix = lang === 'id' ? 'Berikutnya' : 'Next';
    const hUnit = lang === 'id' ? 'j' : 'h';
    const mUnit = lang === 'id' ? 'm' : 'm';
    return `${prefix}: ${hours}${hUnit} ${mins}${mUnit}`;
  };

  const activeAlarms = alarms.filter((a) => a.enabled);
  const inactiveAlarms = alarms.filter((a) => !a.enabled);
  const nextCountdownStr = getNextAlarmCountdown();

  return (
    <div className="h-screen h-[100dvh] w-full bg-[#FFFFFF] sm:bg-[#EAEAEA] flex flex-col items-center justify-center p-0 sm:p-4 text-[#000000] font-sans antialiased select-none overflow-hidden">
      {/* Mobile App Container: 100% full viewport height on mobile devices, framed on larger desktop screens */}
      <div
        id="app-container"
        className="w-full h-full sm:h-[812px] sm:max-h-[100dvh] sm:w-[375px] bg-[#FFFFFF] relative overflow-hidden flex flex-col sm:rounded-[44px] sm:border-[8px] sm:border-[#000000] sm:shadow-2xl"
      >
        {/* Sticky Floating Liquid Glass Navbar */}
        <Navbar
          onAddAlarm={() => {
            setEditingAlarm(null);
            setIsAlarmModalOpen(true);
          }}
          showAddButton={currentTab === 'alarms'}
        />

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto px-5 pt-22 sm:pt-24 pb-28 bg-[#FFFFFF] no-scrollbar">
          {/* 1. Alarms Tab */}
          {currentTab === 'alarms' && (
            <div className="space-y-5 pb-8">
              {/* Active Header */}
              <div className="flex items-center justify-between pt-1 px-1">
                <span className="text-[13px] font-bold text-[#666666]">
                  {t('active', lang)}
                </span>
                {nextCountdownStr && (
                  <span className="text-[12px] font-medium text-[#8E8E8E]">
                    {nextCountdownStr}
                  </span>
                )}
              </div>

              {/* Active Alarms List with Fluid Layout Animation */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {activeAlarms.length > 0 ? (
                    activeAlarms.map((alarm) => (
                      <AlarmCard
                        key={alarm.id}
                        alarm={alarm}
                        onToggle={handleToggleAlarm}
                        onEdit={handleEditAlarm}
                        onDelete={handleDeleteAlarm}
                        onTestThisAlarm={triggerAlarm}
                        use24HourFormat={settings.use24HourFormat}
                        language={lang}
                      />
                    ))
                  ) : (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-6 text-center text-[#8E8E8E] text-xs bg-[#FAFAFA] rounded-[20px] border border-[#F0F0F0]"
                    >
                      {lang === 'id'
                        ? 'Tidak ada alarm aktif. Tekan + di atas untuk menambah atau aktifkan alarm.'
                        : 'No active alarms. Tap + above to create or toggle an alarm on.'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Inactive Alarms Section */}
              {inactiveAlarms.length > 0 && (
                <div className="space-y-3 pt-3">
                  <div className="px-1">
                    <span className="text-[13px] font-bold text-[#8E8E8E]">
                      {t('inactive', lang)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {inactiveAlarms.map((alarm) => (
                        <AlarmCard
                          key={alarm.id}
                          alarm={alarm}
                          onToggle={handleToggleAlarm}
                          onEdit={handleEditAlarm}
                          onDelete={handleDeleteAlarm}
                          onTestThisAlarm={triggerAlarm}
                          use24HourFormat={settings.use24HourFormat}
                          language={lang}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Zero Alarms Empty State */}
              {alarms.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center mb-4 text-[#5E5E5E] shadow-2xs">
                    <BellOff className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-[#000000]">
                    {t('noAlarmsScheduled', lang)}
                  </h3>
                  <p className="text-xs text-[#5E5E5E] max-w-[220px] mt-1">
                    {t('noAlarmsDesc', lang)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 2. Stats Tab */}
          {currentTab === 'stats' && (
            <StatsView
              stats={stats}
              settings={settings}
              onQuickTestAlarm={handleQuickTest}
            />
          )}

          {/* 3. Settings Tab */}
          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onQuickTestAlarm={handleQuickTest}
              onOpenExpoExport={() => setIsExpoExportOpen(true)}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>

        {/* Sticky Floating Liquid Glass Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          language={lang}
        />

        {/* Add/Edit Alarm Modal */}
        <AlarmModal
          isOpen={isAlarmModalOpen}
          onClose={() => setIsAlarmModalOpen(false)}
          onSave={handleSaveAlarm}
          onDelete={handleDeleteAlarm}
          initialAlarm={editingAlarm}
          customRingtone={settings.customRingtone || null}
          use24HourFormat={settings.use24HourFormat}
          language={lang}
        />

        {/* Onboarding Permission Sheet */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onComplete={handleOnboardingComplete}
          language={lang}
          initialName={settings.userName}
        />

        {/* React Native Expo Export Modal */}
        <ExpoExportModal
          isOpen={isExpoExportOpen}
          onClose={() => setIsExpoExportOpen(false)}
        />

        {/* Full-Screen Ringing Screen */}
        {currentScreen === 'ringing' && ringingAlarm && (
          <RingingScreen
            alarm={ringingAlarm}
            onStartChallenge={handleStartChallenge}
            use24HourFormat={settings.use24HourFormat}
            language={lang}
          />
        )}

        {/* Full-Screen Challenge Screen (Math or Shake) */}
        {currentScreen === 'challenge' && ringingAlarm && (
          <ChallengeScreen
            alarm={ringingAlarm}
            onSuccess={handleChallengeSuccess}
            language={lang}
          />
        )}

        {/* Full-Screen Success Screen */}
        {currentScreen === 'success' && successInfo && (
          <SuccessScreen
            timeDismissed={successInfo.timeDismissed}
            streak={settings.streak}
            durationSeconds={successInfo.durationSeconds}
            challengeType={successInfo.challengeType}
            alarmLabel={successInfo.alarmLabel}
            onDone={handleSuccessDone}
            language={lang}
          />
        )}
      </div>
    </div>
  );
}
