import React, { useState } from 'react';
import { ShieldCheck, Bell, Zap, Clock, User, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, t } from '../services/i18n';
import { hapticService } from '../services/hapticService';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (nickname: string) => void;
  language?: AppLanguage;
  initialName?: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  language = 'en',
  initialName = '',
}) => {
  const [step, setStep] = useState<'name' | 'permissions'>('name');
  const [nickname, setNickname] = useState(initialName);

  if (!isOpen) return null;

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    hapticService.selection();
    setStep('permissions');
  };

  const handleFinish = () => {
    hapticService.medium();
    onComplete(nickname.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <div
        id="onboarding-modal"
        className="w-full max-w-[390px] bg-[#FFFFFF] rounded-[28px] shadow-2xl p-6 sm:p-7 border border-[#E5E5E5] flex flex-col justify-between my-auto"
      >
        <AnimatePresence mode="wait">
          {step === 'name' ? (
            <motion.div
              key="step-name"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[14px] bg-[#000000] text-white flex items-center justify-center shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-[#8E8E8E] uppercase tracking-wider">
                  Step 1 of 2
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-[#000000] tracking-tight">
                  {t('stepNameTitle', language)}
                </h2>
                <p className="text-xs text-[#666666] mt-2 leading-relaxed">
                  {t('stepNameDesc', language)}
                </p>
              </div>

              <form onSubmit={handleNextStep} className="space-y-4 pt-2">
                <div>
                  <label
                    htmlFor="onboarding-name-input"
                    className="block text-[11px] font-bold text-[#8E8E8E] uppercase tracking-wider mb-2"
                  >
                    {t('nicknameTitle', language)}
                  </label>
                  <input
                    id="onboarding-name-input"
                    type="text"
                    maxLength={24}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t('nicknameInputPlaceholder', language)}
                    autoFocus
                    className="w-full h-12 px-4 rounded-[14px] bg-[#F7F7F7] border border-[#E2E2E2] text-sm font-semibold text-[#000000] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#000000] focus:bg-[#FFFFFF] transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="submit"
                    id="btn-onboarding-next"
                    className="flex-1 h-12 rounded-[14px] bg-[#000000] text-white font-bold text-sm tracking-wide flex items-center justify-center space-x-2 hover:bg-[#222222] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                  >
                    <span>{t('nextBtn', language)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <p className="text-center text-[11px] text-[#8E8E8E] pt-1">
                {t('offlineBadge', language)}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="step-perms"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[14px] bg-[#000000] text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-[#8E8E8E] uppercase tracking-wider">
                  Step 2 of 2
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-[#000000] tracking-tight">
                  {t('stepPermTitle', language)}
                </h2>
                <p className="text-xs text-[#666666] mt-2 leading-relaxed">
                  {t('stepPermDesc', language)}
                </p>
              </div>

              {/* Permissions list */}
              <div className="space-y-3">
                {/* 1. Exact Alarm */}
                <div className="flex items-start space-x-3 p-3 rounded-[14px] bg-[#F9F9F9] border border-[#EBEBEB]">
                  <div className="w-8 h-8 rounded-[10px] bg-[#000000] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#000000]">
                      {t('exactAlarmTitle', language)}
                    </h4>
                    <p className="text-[11px] text-[#666666] leading-tight mt-0.5">
                      {t('exactAlarmDesc', language)}
                    </p>
                  </div>
                </div>

                {/* 2. Notification */}
                <div className="flex items-start space-x-3 p-3 rounded-[14px] bg-[#F9F9F9] border border-[#EBEBEB]">
                  <div className="w-8 h-8 rounded-[10px] bg-[#000000] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#000000]">
                      {t('fullScreenTitle', language)}
                    </h4>
                    <p className="text-[11px] text-[#666666] leading-tight mt-0.5">
                      {t('fullScreenDesc', language)}
                    </p>
                  </div>
                </div>

                {/* 3. Battery Exemption */}
                <div className="flex items-start space-x-3 p-3 rounded-[14px] bg-[#F9F9F9] border border-[#EBEBEB]">
                  <div className="w-8 h-8 rounded-[10px] bg-[#000000] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#000000]">
                      {t('batteryTitle', language)}
                    </h4>
                    <p className="text-[11px] text-[#666666] leading-tight mt-0.5">
                      {t('batteryDesc', language)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  id="btn-grant-access"
                  className="w-full h-12 rounded-[14px] bg-[#000000] text-white font-bold text-sm tracking-wide flex items-center justify-center space-x-2 hover:bg-[#222222] active:scale-[0.98] transition-all shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 text-white stroke-[2.5]" />
                  <span>{t('grantAccessBtn', language)}</span>
                </button>
                <p className="text-center text-[10px] text-[#8E8E8E] mt-2.5 font-medium">
                  {t('offlineBadge', language)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
