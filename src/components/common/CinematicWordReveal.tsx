import React, { useState, useEffect } from 'react';

interface CinematicWordRevealProps {
  firstWord?: string;
  secondWord?: string;
  primaryColor?: string;
  secondaryColor?: string;
  glowColor?: string;
  className?: string;
}

export const CinematicWordReveal: React.FC<CinematicWordRevealProps> = ({
  firstWord = 'EDUPRIME',
  secondWord = 'ERP',
  primaryColor = '#06b6d4',
  secondaryColor = '#10b981',
  glowColor = 'rgba(6, 182, 212, 0.4)',
  className = ''
}) => {
  // Stages:
  // 0: Word 1 appears alone ("EDUPRIME") with blur-to-sharp + letter spacing
  // 1: Word 2 unfolds horizontally letter-by-letter ("EDUPRIME ERP") + light sweep
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [lettersVisible, setLettersVisible] = useState<number>(0);

  useEffect(() => {
    let timeout1: ReturnType<typeof setTimeout>;
    let letterInterval: ReturnType<typeof setInterval>;
    let loopTimeout: ReturnType<typeof setTimeout>;

    const startSequence = () => {
      setIsExpanded(false);
      setLettersVisible(0);

      // 1. Initial 1.2s smooth pause on Word 1 ("EDUPRIME")
      timeout1 = setTimeout(() => {
        setIsExpanded(true);

        // 2. Letter-by-letter reveal for Word 2 ("E - R - P")
        let count = 0;
        const totalLetters = secondWord.length;
        letterInterval = setInterval(() => {
          count++;
          setLettersVisible(count);
          if (count >= totalLetters) {
            clearInterval(letterInterval);

            // 3. Keep complete name visible for 5 seconds, then smoothly loop
            loopTimeout = setTimeout(() => {
              startSequence();
            }, 5000);
          }
        }, 120); // 120ms per letter reveal
      }, 1400);
    };

    startSequence();

    return () => {
      clearTimeout(timeout1);
      clearInterval(letterInterval);
      clearTimeout(loopTimeout);
    };
  }, [firstWord, secondWord]);

  return (
    <div className={`relative flex flex-col items-start select-none ${className}`}>
      
      {/* Dynamic Ambient Backlight Flare */}
      <div
        className="absolute -top-12 left-1/4 w-80 h-28 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
        style={{
          background: glowColor,
          opacity: isExpanded ? 0.75 : 0.35
        }}
      />

      {/* Main Morphing Typography Container */}
      <div className="relative inline-flex items-center flex-wrap gap-x-4 gap-y-1">
        
        {/* WORD 1: e.g. "EDUPRIME" (Blur-to-Sharp, Letter-spacing transition, Chromatic Glow) */}
        <span
          className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white transition-all duration-700 drop-shadow-[0_0_35px_rgba(255,255,255,0.35)]"
          style={{
            letterSpacing: isExpanded ? 'normal' : '0.06em'
          }}
        >
          {firstWord}
        </span>

        {/* WORD 2: e.g. "ERP" (Letter-by-letter Horizontal Expansion with Gradient Shimmer) */}
        <div
          className={`overflow-hidden transition-all duration-700 ease-out flex items-center ${
            isExpanded ? 'max-w-[400px] opacity-100' : 'max-w-0 opacity-0 pointer-events-none'
          }`}
        >
          <span className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight whitespace-nowrap bg-gradient-to-r from-lime-300 via-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(34,211,238,0.5)]">
            {secondWord.slice(0, lettersVisible)}
            {isExpanded && lettersVisible < secondWord.length && (
              <span className="inline-block w-1 h-12 sm:h-14 bg-cyan-400 animate-pulse ml-1 align-middle" />
            )}
          </span>
        </div>

      </div>

      {/* Subtle Laser Underline Beam */}
      <div
        className="h-1 rounded-full mt-3.5 transition-all duration-1000 ease-out shadow-lg"
        style={{
          width: isExpanded ? '280px' : '140px',
          background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, transparent)`
        }}
      />

    </div>
  );
};
