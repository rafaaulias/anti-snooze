import React, { useState, useEffect, useRef } from 'react';
import { Alarm, MathProblem } from '../types';
import { storageService } from '../services/storageService';
import { soundService } from '../services/soundService';
import { motionService } from '../services/motionService';
import { hapticService } from '../services/hapticService';
import { Calculator, Smartphone, Delete, RotateCcw, Zap } from 'lucide-react';
import { AppLanguage, t } from '../services/i18n';

interface ChallengeScreenProps {
  alarm: Alarm;
  onSuccess: (durationSeconds: number) => void;
  language?: AppLanguage;
}

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({
  alarm,
  onSuccess,
  language = 'en',
}) => {
  const startTimeRef = useRef<number>(Date.now());

  // Math State
  const [problemIndex, setProblemIndex] = useState(0);
  const totalProblems = alarm.mathProblemCount || 2;
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() =>
    storageService.generateMathProblem(alarm.mathDifficulty || 'medium')
  );
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isMathError, setIsMathError] = useState(false);

  // Shake State
  const targetShakes = alarm.shakeCountTarget || 30;
  const [shakeCount, setShakeCount] = useState(0);
  const [isShakingAnim, setIsShakingAnim] = useState(false);

  // Setup Shake sensor listener if challenge is shake
  useEffect(() => {
    if (alarm.challengeType === 'shake') {
      motionService.requestPermission().then(() => {
        motionService.startListening((count) => {
          setShakeCount((prev) => {
            const nextCount = Math.min(targetShakes, count);
            if (nextCount >= targetShakes) {
              handleChallengeComplete();
            }
            return nextCount;
          });
          setIsShakingAnim(true);
          setTimeout(() => setIsShakingAnim(false), 200);
        });
      });

      return () => {
        motionService.stopListening();
      };
    }
  }, [alarm.challengeType, targetShakes]);

  const handleChallengeComplete = () => {
    soundService.stopAlarm();
    soundService.playSuccess();
    hapticService.dismissSuccess();
    const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    onSuccess(duration);
  };

  // Math Keypad Click Handlers
  const handleDigitPress = (digit: string) => {
    soundService.playKeyClick();
    hapticService.light();
    if (userAnswer.length < 5) {
      setUserAnswer((prev) => prev + digit);
      setIsMathError(false);
    }
  };

  const handleDeletePress = () => {
    soundService.playKeyClick();
    hapticService.light();
    setUserAnswer((prev) => prev.slice(0, -1));
    setIsMathError(false);
  };

  const handleClearPress = () => {
    soundService.playKeyClick();
    hapticService.selection();
    setUserAnswer('');
    setIsMathError(false);
  };

  const handleMathSubmit = () => {
    if (!userAnswer) return;
    const parsed = parseInt(userAnswer, 10);
    if (parsed === currentProblem.answer) {
      // Correct!
      soundService.playCorrect();
      hapticService.medium();
      if (problemIndex + 1 < totalProblems) {
        setProblemIndex((prev) => prev + 1);
        setCurrentProblem(storageService.generateMathProblem(alarm.mathDifficulty || 'medium'));
        setUserAnswer('');
      } else {
        // All math problems solved!
        handleChallengeComplete();
      }
    } else {
      // Incorrect!
      soundService.playError();
      hapticService.error();
      setIsMathError(true);
      setUserAnswer('');
    }
  };

  // Shake manual trigger (for testing on desktop / laptop or physical tap)
  const handleManualShake = () => {
    soundService.playTone(400, 0.04, 'sine', 0.15);
    motionService.manualShake(1);
    hapticService.shakeTick();
    setShakeCount((prev) => {
      const next = prev + 1;
      if (next >= targetShakes) {
        handleChallengeComplete();
      }
      return next;
    });
    setIsShakingAnim(true);
    setTimeout(() => setIsShakingAnim(false), 150);
  };

  // Keyboard listener for desktop testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (alarm.challengeType === 'math') {
        if (/^[0-9]$/.test(e.key)) {
          handleDigitPress(e.key);
        } else if (e.key === 'Backspace') {
          handleDeletePress();
        } else if (e.key === 'Enter') {
          handleMathSubmit();
        } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
          handleClearPress();
        }
      } else if (alarm.challengeType === 'shake') {
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          handleManualShake();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alarm.challengeType, userAnswer, currentProblem, problemIndex]);

  return (
    <div
      id="screen-challenge"
      className="fixed inset-0 z-50 bg-[#FFFFFF] text-[#000000] flex flex-col justify-between p-5 select-none"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pt-3 pb-2 border-b border-[#F0F0F0]">
        <div className="flex items-center space-x-2">
          {alarm.challengeType === 'math' ? (
            <Calculator className="w-5 h-5 text-[#000000]" />
          ) : (
            <Smartphone className="w-5 h-5 text-[#000000]" />
          )}
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#000000]">
            {alarm.challengeType === 'math' ? t('mathPuzzle', language) : t('shakePhone', language)}
          </h2>
        </div>
        <div className="px-3 py-1 rounded-full bg-[#F9F9F9] border border-[#E5E5E5] text-xs font-bold font-mono">
          {alarm.challengeType === 'math'
            ? t('problemCounter', language, { current: problemIndex + 1, total: totalProblems })
            : t('shakeProgress', language, { current: shakeCount, target: targetShakes })}
        </div>
      </div>

      {/* Challenge Body */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        {alarm.challengeType === 'math' ? (
          /* ============ MATH VARIANT ============ */
          <div className="w-full max-w-[340px] flex flex-col items-center">
            {/* Math Question Display */}
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-[#5E5E5E] tracking-wider uppercase mb-1 block">
                {t('solveToDismiss', language)}
              </span>
              <div className="text-5xl font-black tracking-tight text-[#000000] font-mono py-2">
                {currentProblem.question}
              </div>
            </div>

            {/* Answer Box */}
            <div
              className={`w-full h-14 rounded-[12px] flex items-center justify-center border-2 transition-all font-mono text-3xl font-extrabold ${
                isMathError
                  ? 'border-red-500 bg-red-50 text-red-600 animate-shake'
                  : userAnswer
                  ? 'border-[#000000] bg-[#F9F9F9] text-[#000000]'
                  : 'border-[#E5E5E5] bg-[#F9F9F9] text-[#8E8E8E]'
              }`}
            >
              {userAnswer ? (
                <span>{userAnswer}</span>
              ) : (
                <span className="text-sm font-sans font-medium text-[#8E8E8E]">
                  {isMathError ? t('incorrectTryAgain', language) : '...'}
                </span>
              )}
            </div>

            {/* Numeric Keypad */}
            <div className="w-full grid grid-cols-3 gap-2.5 mt-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigitPress(digit)}
                  className="h-13 rounded-[12px] bg-[#F9F9F9] hover:bg-[#EBEBEB] active:bg-[#000000] active:text-white border border-[#E5E5E5] text-xl font-bold font-mono transition-all flex items-center justify-center shadow-xs cursor-pointer"
                >
                  {digit}
                </button>
              ))}

              {/* Clear */}
              <button
                onClick={handleClearPress}
                className="h-13 rounded-[12px] bg-[#F9F9F9] hover:bg-[#EBEBEB] active:scale-95 border border-[#E5E5E5] text-xs font-bold tracking-wider uppercase text-[#5E5E5E] transition-all flex items-center justify-center cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                C
              </button>

              {/* 0 */}
              <button
                onClick={() => handleDigitPress('0')}
                className="h-13 rounded-[12px] bg-[#F9F9F9] hover:bg-[#EBEBEB] active:bg-[#000000] active:text-white border border-[#E5E5E5] text-xl font-bold font-mono transition-all flex items-center justify-center shadow-xs cursor-pointer"
              >
                0
              </button>

              {/* Backspace */}
              <button
                onClick={handleDeletePress}
                className="h-13 rounded-[12px] bg-[#F9F9F9] hover:bg-[#EBEBEB] active:scale-95 border border-[#E5E5E5] text-[#5E5E5E] transition-all flex items-center justify-center cursor-pointer"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleMathSubmit}
              disabled={!userAnswer}
              id="btn-submit-math"
              className={`w-full h-13 mt-4 rounded-[12px] font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer ${
                userAnswer
                  ? 'bg-[#000000] text-white hover:bg-[#222222] active:scale-[0.98]'
                  : 'bg-[#E5E5E5] text-[#8E8E8E] cursor-not-allowed'
              }`}
            >
              {t('submit', language)}
            </button>
          </div>
        ) : (
          /* ============ SHAKE VARIANT ============ */
          <div className="w-full max-w-[340px] flex flex-col items-center text-center">
            {/* Circular Progress Ring */}
            <div className="relative w-52 h-52 flex items-center justify-center my-4">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-[#EFEFEF]"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Active Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-[#000000] transition-all duration-150"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={
                    2 * Math.PI * 42 * (1 - Math.min(1, shakeCount / targetShakes))
                  }
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>

              {/* Center Shake Count & Animated Device */}
              <div
                className={`absolute flex flex-col items-center justify-center transition-transform ${
                  isShakingAnim ? 'scale-110 rotate-6' : 'scale-100'
                }`}
              >
                <Smartphone className="w-10 h-10 text-[#000000] mb-1" />
                <span className="text-3xl font-extrabold font-mono text-[#000000]">
                  {Math.round((shakeCount / targetShakes) * 100)}%
                </span>
                <span className="text-[11px] font-semibold text-[#5E5E5E]">
                  {shakeCount} / {targetShakes}
                </span>
              </div>
            </div>

            {/* Instruction */}
            <h3 className="text-xl font-extrabold text-[#000000] mt-3">
              {t('shakeToUnlock', language)}
            </h3>
            <p className="text-xs text-[#5E5E5E] max-w-xs mt-1 leading-relaxed">
              {t('keepShaking', language)}
            </p>

            {/* Interactive Shake Trigger */}
            <div className="mt-8 w-full space-y-2">
              <button
                onClick={handleManualShake}
                id="btn-manual-shake"
                className="w-full h-14 rounded-[16px] bg-[#000000] text-white font-extrabold text-sm tracking-wide flex items-center justify-center space-x-2 hover:bg-[#222222] active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>{t('shakePhone', language)} (Tap / Shake)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Bottom Note */}
      <div className="py-2 text-center border-t border-[#F0F0F0]">
        <span className="text-[11px] font-semibold text-[#8E8E8E]">
          {t('solveToDismiss', language)}
        </span>
      </div>
    </div>
  );
};
