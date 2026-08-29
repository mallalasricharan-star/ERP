import React, { useState, useEffect } from 'react';

interface QuantumRevealProps {
  firstWord?: string;
  secondWord?: string;
  className?: string;
}

export const QuantumReveal: React.FC<QuantumRevealProps> = ({
  firstWord = 'QUANTUM',
  secondWord = 'CORE',
  className = ''
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 1300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative flex flex-col items-start select-none ${className}`}>
      <div className="absolute -top-10 left-8 w-80 h-24 rounded-full blur-3xl bg-cyan-500/40 pointer-events-none" />
      <div className="relative inline-flex items-center gap-x-4">
        <span className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]">
          {firstWord}
        </span>
        <div className={`overflow-hidden transition-all duration-1000 ease-out ${isRevealed ? 'max-w-[400px] opacity-100' : 'max-w-0 opacity-0'}`}>
          <span className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(6,182,212,0.5)]">
            {secondWord}
          </span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-48 bg-gradient-to-r from-cyan-400 via-emerald-400 to-transparent shadow-lg" />
    </div>
  );
};
