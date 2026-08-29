import React, { useState, useEffect } from 'react';
import { LETTER_ANIMATION_STYLES, LetterRevealConfig } from './types';

interface CinematicWordRevealProps {
  className?: string;
  activeConfig?: LetterRevealConfig;
  autoCycle?: boolean;
}

export const CinematicWordReveal: React.FC<CinematicWordRevealProps> = ({
  className = '',
  activeConfig,
  autoCycle = true
}) => {
  const [index, setIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [lettersVisible, setLettersVisible] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  const current: LetterRevealConfig = activeConfig || LETTER_ANIMATION_STYLES[index];

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let letterInterval: ReturnType<typeof setInterval>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;

    // Step 1: Start fresh on Word 1
    setIsFadingOut(false);
    setIsExpanded(false);
    setLettersVisible(0);

    // Step 2: Smooth pause on Word 1 (1.3s), then trigger horizontal letter-by-letter expansion
    t1 = setTimeout(() => {
      setIsExpanded(true);

      let count = 0;
      const total = current.secondWord.length;
      letterInterval = setInterval(() => {
        count++;
        setLettersVisible(count);
        if (count >= total) {
          clearInterval(letterInterval);

          // Step 3: Keep full name on screen for 4.2 seconds
          t2 = setTimeout(() => {
            if (autoCycle && !activeConfig) {
              setIsFadingOut(true);
              t3 = setTimeout(() => {
                setIndex(prev => (prev + 1) % LETTER_ANIMATION_STYLES.length);
              }, 600);
            }
          }, 4200);
        }
      }, 110);
    }, 1300);

    return () => {
      clearTimeout(t1);
      clearInterval(letterInterval);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [index, activeConfig, autoCycle]);

  return (
    <div className={`relative flex flex-col items-start select-none ${className}`}>
      
      {/* Dynamic Ambient Glow Backdrop */}
      <div
        className="absolute -top-12 left-10 w-96 h-28 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
        style={{
          background: current.glowColor,
          opacity: isExpanded ? 0.8 : 0.35
        }}
      />

      {/* Main Morphing Typography Container */}
      <div
        className={`relative inline-flex items-center flex-wrap gap-x-4 gap-y-1 transition-all duration-500 ${
          isFadingOut ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
        }`}
      >
        
        {/* WORD 1: e.g. QUANTUM, NEXUS, EDUPRIME */}
        <span
          className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white transition-all duration-700 drop-shadow-[0_0_35px_rgba(255,255,255,0.35)]"
          style={{
            letterSpacing: isExpanded ? 'normal' : '0.06em'
          }}
        >
          {current.firstWord}
        </span>

        {/* WORD 2: e.g. CORE, FLOW, ERP (Horizontal Expansion & Light Sweep Reveal) */}
        <div
          className={`overflow-hidden transition-all duration-700 ease-out flex items-center ${
            isExpanded ? 'max-w-[500px] opacity-100' : 'max-w-0 opacity-0 pointer-events-none'
          }`}
        >
          <span
            className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight whitespace-nowrap bg-gradient-to-r from-lime-300 via-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(34,211,238,0.5)]"
          >
            {current.secondWord.slice(0, lettersVisible)}
            {isExpanded && lettersVisible < current.secondWord.length && (
              <span className="inline-block w-1 h-12 sm:h-14 bg-cyan-400 animate-pulse ml-1 align-middle" />
            )}
          </span>
        </div>

      </div>

      {/* Laser Underline Beam */}
      <div
        className="h-1 rounded-full mt-3.5 transition-all duration-1000 ease-out shadow-lg"
        style={{
          width: isExpanded ? '280px' : '140px',
          background: `linear-gradient(90deg, ${current.primaryColor}, ${current.secondaryColor}, transparent)`
        }}
      />

      {/* Subtle Animation Style Indicator Badge */}
      <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>{current.name}</span>
      </div>

    </div>
  );
};
