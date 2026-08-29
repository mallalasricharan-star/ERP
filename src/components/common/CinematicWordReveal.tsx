import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';

interface CinematicWordRevealProps {
  fullName: string; // e.g. "QUANTUM CORE", "NEXUS FLOW", "EDUPRIME ERP"
  primaryColor?: string;
  secondaryColor?: string;
  glowColor?: string;
  className?: string;
  replayKey?: number;
  onReplay?: () => void;
}

export const CinematicWordReveal: React.FC<CinematicWordRevealProps> = ({
  fullName,
  primaryColor = '#06b6d4',
  secondaryColor = '#10b981',
  glowColor = 'rgba(6, 182, 212, 0.4)',
  className = '',
  replayKey = 0,
  onReplay
}) => {
  const parts = fullName.trim().split(' ');
  const firstWord = parts[0] || 'EDUPRIME';
  const secondWord = parts.slice(1).join(' ') || 'ERP';

  // Animation phase: 0 = initial word 1, 1 = expansion to full name
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    setPhase(0);
    const timer = setTimeout(() => {
      setPhase(1);
    }, 1400); // 1.4s smooth pause on the first powerful word

    return () => clearTimeout(timer);
  }, [fullName, replayKey]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      
      {/* Dynamic Ambient Backlight Flare */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-24 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000"
        style={{
          background: glowColor,
          opacity: phase === 1 ? 0.8 : 0.4
        }}
      />

      {/* Main Morphing Typography Container */}
      <div className="relative inline-flex items-center justify-center flex-wrap gap-x-4 gap-y-1 transition-all duration-700">
        
        {/* WORD 1: Animated from Blur-to-Sharp with Glow & Letter Spacing */}
        <span
          className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white transition-all duration-700 drop-shadow-[0_0_35px_rgba(255,255,255,0.3)]"
          style={{
            letterSpacing: phase === 0 ? '0.08em' : 'normal'
          }}
        >
          {firstWord}
        </span>

        {/* WORD 2: Smooth Horizontal Unfold & Gradient Shimmer Reveal */}
        <div
          className={`overflow-hidden transition-all duration-1000 ease-out flex items-center ${
            phase === 1
              ? 'max-w-[600px] opacity-100 translate-x-0'
              : 'max-w-0 opacity-0 -translate-x-6 pointer-events-none'
          }`}
        >
          <span
            className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight whitespace-nowrap bg-gradient-to-r from-lime-300 via-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.5)]"
          >
            {secondWord}
          </span>
        </div>

      </div>

      {/* Subtle Underline Laser Beam */}
      <div
        className="h-1 rounded-full mt-3 transition-all duration-1000 ease-out shadow-lg"
        style={{
          width: phase === 1 ? '100%' : '50%',
          maxWidth: '380px',
          background: `linear-gradient(90deg, transparent, ${primaryColor}, ${secondaryColor}, transparent)`
        }}
      />

    </div>
  );
};
