import React, { useState, useEffect, useRef } from 'react';
import { Alarm, UserSettings, NavTab, WakeUpStats } from './types';
import { storageService } from './services/storageService';
import { soundService } from './services/soundService';
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
import { BellOff, Wifi, Battery } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('9:41');

  // Clock status loop
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      const currentMinuteStr = `${hh}:${mm}`;

      const h12 = h % 12 === 0 ? 12 : h % 12;
      setCurrentTimeStr(`${h12}:${mm}`);

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
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [alarms, currentScreen]);

  // Trigger Alarm Flow
  const triggerAlarm = (alarm: Alarm) => {
    setRingingAlarm(alarm);
    setCurrentScreen('ringing');
    soundService.startAlarm();
  };

  // Quick Test Action
  const handleQuickTest = () => {
    const target = alarms[0] || {
      id: 'test-alarm',
      time: '06:30',
      label: 'School Time',
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
  const handleOnboardingComplete = () => {
    const newSettings: UserSettings = {
      ...settings,
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
    setRingingAlarm(null);
    setCurrentScreen('home');
    setSuccessInfo(null);
  };

  // Compute countdown to next active alarm matching Home.png "Next: 6h 30m"
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
    return `Next: ${hours}h ${mins}m`;
  };

  const activeAlarms = alarms.filter((a) => a.enabled);
  const inactiveAlarms = alarms.filter((a) => !a.enabled);
  const nextCountdownStr = getNextAlarmCountdown();

  return (
    <div className="min-h-screen bg-[#111111] sm:bg-[#EAEAEA] flex flex-col items-center justify-center p-0 sm:p-4 text-[#000000] font-sans antialiased select-none">
      {/* Mobile Device Frame (375x812 native iPhone dimensions on desktop, 100% full screen on mobile) */}
      <div
        id="app-container"
        className="w-full h-screen sm:h-[812px] sm:w-[375px] bg-[#FFFFFF] relative overflow-hidden flex flex-col sm:rounded-[46px] sm:border-[10px] sm:border-[#000000] sm:shadow-2xl"
      >
        {/* iOS Status Bar & Dynamic Island */}
        <div className="h-11 px-7 bg-[#FFFFFF] flex items-center justify-between text-[12px] font-bold text-[#000000] select-none shrink-0 border-b border-[#F5F5F5] z-30">
          <span>{currentTimeStr}</span>
          {/* Dynamic Island Speaker Pill */}
          <div className="w-24 h-5 bg-[#000000] rounded-full flex items-center justify-end pr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]" />
          </div>
          <div className="flex items-center space-x-1.5 text-[#000000]">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Sticky Floating Liquid Glass Navbar */}
        <Navbar
          onAddAlarm={() => {
            setEditingAlarm(null);
            setIsAlarmModalOpen(true);
          }}
          showAddButton={currentTab === 'alarms'}
        />

        {/* Scrollable Main Viewport (padding-top allows header breathing room; padding-bottom keeps items clear of floating bottom nav) */}
        <main className="flex-1 overflow-y-auto px-5 pt-2 pb-28 bg-[#FFFFFF] no-scrollbar">
          {/* 1. Alarms Tab */}
          {currentTab === 'alarms' && (
            <div className="space-y-5 pb-8">
              {/* Active Header */}
              <div className="flex items-center justify-between pt-1 px-1">
                <span className="text-[13px] font-bold text-[#666666]">
                  Active
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
                      No active alarms. Tap + above to create or toggle an alarm on.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Inactive Alarms Section */}
              {inactiveAlarms.length > 0 && (
                <div className="space-y-3 pt-3">
                  <div className="px-1">
                    <span className="text-[13px] font-bold text-[#8E8E8E]">
                      Inactive
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
                    No alarms scheduled
                  </h3>
                  <p className="text-xs text-[#5E5E5E] max-w-[220px] mt-1">
                    Tap the + button in the header to create your first anti-snooze alarm.
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
            />
          )}
        </main>

        {/* Sticky Floating Liquid Glass Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />

        {/* Add/Edit Alarm Modal with Spring Enter/Exit Animation & Snapped Time Wheel */}
        <AlarmModal
          isOpen={isAlarmModalOpen}
          onClose={() => setIsAlarmModalOpen(false)}
          onSave={handleSaveAlarm}
          onDelete={handleDeleteAlarm}
          initialAlarm={editingAlarm}
        />

        {/* Onboarding Permission Sheet */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onComplete={handleOnboardingComplete}
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
          />
        )}

        {/* Full-Screen Challenge Screen (Math or Shake) */}
        {currentScreen === 'challenge' && ringingAlarm && (
          <ChallengeScreen
            alarm={ringingAlarm}
            onSuccess={handleChallengeSuccess}
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
          />
        )}
      </div>
    </div>
  );
}
