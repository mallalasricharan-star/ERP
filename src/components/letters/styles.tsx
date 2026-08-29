import React, { useState, useEffect } from 'react';

// 1. Quantum Reveal (Blur-to-Sharp Focus + Laser Line)
export const QuantumReveal: React.FC<{ first?: string; second?: string }> = ({ first = 'QUANTUM', second = 'CORE' }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOpen(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">{first}</span>
        <div className={`overflow-hidden transition-all duration-1000 ${open ? 'max-w-[400px] opacity-100 blur-0' : 'max-w-0 opacity-0 blur-md'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-40 bg-gradient-to-r from-cyan-400 to-transparent shadow-lg" />
    </div>
  );
};

// 2. Nexus Expand (Letter-by-Letter Horizontal Expansion)
export const NexusExpand: React.FC<{ first?: string; second?: string }> = ({ first = 'NEXUS', second = 'FLOW' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let c = 0;
      const iv = setInterval(() => { c++; setCount(c); if (c >= second.length) clearInterval(iv); }, 120);
    }, 1200);
    return () => clearTimeout(t);
  }, [second]);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {second.slice(0, count)}
          {count < second.length && <span className="inline-block w-1 h-12 bg-emerald-400 animate-pulse ml-1 align-middle" />}
        </span>
      </div>
      <div className="h-1 rounded-full mt-3 w-44 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg" />
    </div>
  );
};

// 3. Core Fusion (Plasma Fusion Merge)
export const CoreFusion: React.FC<{ first?: string; second?: string }> = ({ first = 'CORE', second = 'FUSION' }) => {
  const [fused, setFused] = useState(false);
  useEffect(() => { const t = setTimeout(() => setFused(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className={`text-5xl sm:text-6xl font-black uppercase text-white transition-all duration-700 ${fused ? 'tracking-normal' : 'tracking-widest'}`}>{first}</span>
        <div className={`overflow-hidden transition-all duration-1000 ${fused ? 'max-w-[400px] opacity-100 scale-100' : 'max-w-0 opacity-0 scale-50'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(236,72,153,0.6)]">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-40 bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg" />
    </div>
  );
};

// 4. Word Morph (Smooth Letter Spacing Morph)
export const WordMorph: React.FC<{ first?: string; second?: string }> = ({ first = 'WORD', second = 'MORPH' }) => {
  const [morph, setMorph] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMorph(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className={`text-5xl sm:text-6xl font-black uppercase text-white transition-all duration-1000 ${morph ? 'tracking-normal' : 'tracking-[0.15em]'}`}>{first}</span>
        <div className={`overflow-hidden transition-all duration-1000 ${morph ? 'max-w-[400px] opacity-100 translate-y-0' : 'max-w-0 opacity-0 translate-y-4'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-36 bg-gradient-to-r from-teal-400 to-transparent" />
    </div>
  );
};

// 5. Split Name (Horizontal Split Unveil)
export const SplitName: React.FC<{ first?: string; second?: string }> = ({ first = 'SPLIT', second = 'NAME' }) => {
  const [split, setSplit] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSplit(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className={`overflow-hidden transition-all duration-1000 ${split ? 'max-w-[400px] opacity-100 translate-x-0' : 'max-w-0 opacity-0 -translate-x-8'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-40 bg-gradient-to-r from-blue-400 to-indigo-500" />
    </div>
  );
};

// 6. Letter Assemble (Scattered Letters Assembly)
export const LetterAssemble: React.FC<{ first?: string; second?: string }> = ({ first = 'LETTER', second = 'ASSEMBLE' }) => {
  const [assemble, setAssemble] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAssemble(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className="flex">
          {second.split('').map((char, i) => (
            <span
              key={i}
              style={{ transitionDelay: `${i * 90}ms` }}
              className={`text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent inline-block transition-all duration-500 ${
                assemble ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 -translate-y-8 rotate-12'
              }`}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-48 bg-gradient-to-r from-violet-500 to-transparent" />
    </div>
  );
};

// 7. Word Stretch (Elastic Snap)
export const WordStretch: React.FC<{ first?: string; second?: string }> = ({ first = 'WORD', second = 'STRETCH' }) => {
  const [stretched, setStretched] = useState(false);
  useEffect(() => { const t = setTimeout(() => setStretched(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className={`overflow-hidden transition-all duration-700 ease-out ${stretched ? 'max-w-[400px] opacity-100 scale-x-100' : 'max-w-0 opacity-0 scale-x-150'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-40 bg-gradient-to-r from-amber-400 to-orange-500" />
    </div>
  );
};

// 8. Type Expand (Typewriter Beam)
export const TypeExpand: React.FC<{ first?: string; second?: string }> = ({ first = 'TYPE', second = 'EXPAND' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let c = 0;
      const iv = setInterval(() => { c++; setCount(c); if (c >= second.length) clearInterval(iv); }, 130);
    }, 1200);
    return () => clearTimeout(t);
  }, [second]);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <span className="text-5xl sm:text-6xl font-black uppercase font-mono bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
          {second.slice(0, count)}
          <span className="inline-block w-2 h-10 bg-lime-400 animate-pulse ml-1 align-middle" />
        </span>
      </div>
      <div className="h-1 rounded-full mt-3 w-44 bg-gradient-to-r from-lime-400 to-emerald-500" />
    </div>
  );
};

// 9. Glitch Reveal (RGB Split Chromatic Glitch)
export const GlitchReveal: React.FC<{ first?: string; second?: string }> = ({ first = 'GLITCH', second = 'REVEAL' }) => {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGlitch(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className={`overflow-hidden transition-all duration-500 ${glitch ? 'max-w-[400px] opacity-100' : 'max-w-0 opacity-0'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-cyan-400 via-rose-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[2px_2px_0_rgba(244,63,94,0.7)]">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-40 bg-gradient-to-r from-cyan-400 to-rose-400" />
    </div>
  );
};

// 10. Particle Form (Matrix Crystallization)
export const ParticleForm: React.FC<{ first?: string; second?: string }> = ({ first = 'PARTICLE', second = 'FORM' }) => {
  const [formed, setFormed] = useState(false);
  useEffect(() => { const t = setTimeout(() => setFormed(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className={`overflow-hidden transition-all duration-1000 ${formed ? 'max-w-[400px] opacity-100 blur-0' : 'max-w-0 opacity-0 blur-lg'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(59,130,246,0.6)]">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-48 bg-gradient-to-r from-blue-500 to-cyan-400" />
    </div>
  );
};

// 11. Blur Transform
export const BlurTransform: React.FC<{ first?: string; second?: string }> = ({ first = 'BLUR', second = 'TRANSFORM' }) => {
  const [sharp, setSharp] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSharp(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className={`overflow-hidden transition-all duration-1000 ${sharp ? 'max-w-[400px] opacity-100 blur-0' : 'max-w-0 opacity-0 blur-xl'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-cyan-300 to-teal-400 bg-clip-text text-transparent">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-40 bg-gradient-to-r from-teal-400 to-transparent" />
    </div>
  );
};

// 12. Scale Reveal (Depth Zoom-In)
export const ScaleReveal: React.FC<{ first?: string; second?: string }> = ({ first = 'SCALE', second = 'REVEAL' }) => {
  const [scaled, setScaled] = useState(false);
  useEffect(() => { const t = setTimeout(() => setScaled(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className={`overflow-hidden transition-all duration-800 ${scaled ? 'max-w-[400px] opacity-100 scale-100' : 'max-w-0 opacity-0 scale-150'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-40 bg-gradient-to-r from-indigo-400 to-purple-500" />
    </div>
  );
};

// 13. Horizontal Unfold (Accordion Shutter)
export const HorizontalUnfold: React.FC<{ first?: string; second?: string }> = ({ first = 'HORIZONTAL', second = 'UNFOLD' }) => {
  const [unfolded, setUnfolded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setUnfolded(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className={`overflow-hidden transition-all duration-1000 ease-out ${unfolded ? 'max-w-[500px] opacity-100' : 'max-w-0 opacity-0'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-48 bg-gradient-to-r from-emerald-400 to-cyan-400" />
    </div>
  );
};

// 14. Vertical Reveal (Curtain Drop)
export const VerticalReveal: React.FC<{ first?: string; second?: string }> = ({ first = 'VERTICAL', second = 'REVEAL' }) => {
  const [dropped, setDropped] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDropped(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className={`overflow-hidden transition-all duration-800 ${dropped ? 'max-h-24 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-8'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-40 bg-gradient-to-r from-blue-400 to-transparent" />
    </div>
  );
};

// 15. Circular Reveal (Radial Expansion)
export const CircularReveal: React.FC<{ first?: string; second?: string }> = ({ first = 'CIRCULAR', second = 'REVEAL' }) => {
  const [radial, setRadial] = useState(false);
  useEffect(() => { const t = setTimeout(() => setRadial(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className={`overflow-hidden transition-all duration-1000 ${radial ? 'max-w-[400px] opacity-100' : 'max-w-0 opacity-0'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-fuchsia-400 to-pink-500 bg-clip-text text-transparent">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-44 bg-gradient-to-r from-fuchsia-400 to-pink-500" />
    </div>
  );
};

// 16. Wave Reveal (Sine Wave Ripple)
export const WaveReveal: React.FC<{ first?: string; second?: string }> = ({ first = 'WAVE', second = 'REVEAL' }) => {
  const [wave, setWave] = useState(false);
  useEffect(() => { const t = setTimeout(() => setWave(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className="flex">
          {second.split('').map((char, i) => (
            <span
              key={i}
              style={{ transitionDelay: `${i * 80}ms` }}
              className={`text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent inline-block transition-all duration-600 ${
                wave ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-75'
              }`}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-36 bg-gradient-to-r from-cyan-400 to-blue-500" />
    </div>
  );
};

// 17. Cursor Reveal (Glowing Beam Cursor)
export const CursorReveal: React.FC<{ first?: string; second?: string }> = ({ first = 'CURSOR', second = 'REVEAL' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let c = 0;
      const iv = setInterval(() => { c++; setCount(c); if (c >= second.length) clearInterval(iv); }, 110);
    }, 1200);
    return () => clearTimeout(t);
  }, [second]);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
          {second.slice(0, count)}
          <span className="inline-block w-1.5 h-12 bg-amber-400 animate-pulse ml-1 align-middle shadow-[0_0_15px_#f59e0b]" />
        </span>
      </div>
      <div className="h-1 rounded-full mt-3 w-40 bg-gradient-to-r from-amber-400 to-transparent" />
    </div>
  );
};

// 18. Light Sweep (Diagonal Sheen)
export const LightSweep: React.FC<{ first?: string; second?: string }> = ({ first = 'LIGHT', second = 'SWEEP' }) => {
  const [sweep, setSweep] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSweep(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className={`overflow-hidden transition-all duration-1000 ${sweep ? 'max-w-[400px] opacity-100' : 'max-w-0 opacity-0'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-yellow-300 via-white to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-40 bg-gradient-to-r from-amber-400 to-yellow-200" />
    </div>
  );
};

// 19. 3D Flip Reveal (Perspective Flip)
export const ThreeDFlipReveal: React.FC<{ first?: string; second?: string }> = ({ first = '3D FLIP', second = 'REVEAL' }) => {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { const t = setTimeout(() => setFlipped(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4 [perspective:1000px]">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className={`overflow-hidden transition-all duration-1000 [transform-style:preserve-3d] ${flipped ? 'max-w-[400px] opacity-100 [transform:rotateX(0deg)]' : 'max-w-0 opacity-0 [transform:rotateX(90deg)]'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-40 bg-gradient-to-r from-indigo-500 to-purple-500" />
    </div>
  );
};

// 20. Orbit Reveal (Planetary Ring Glow)
export const OrbitReveal: React.FC<{ first?: string; second?: string }> = ({ first = 'ORBIT', second = 'REVEAL' }) => {
  const [orbit, setOrbit] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOrbit(true), 1200); return () => clearTimeout(t); }, []);
  return (
    <div className="flex flex-col items-start select-none">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl font-black uppercase text-white">{first}</span>
        <div className={`overflow-hidden transition-all duration-1000 ${orbit ? 'max-w-[400px] opacity-100' : 'max-w-0 opacity-0'}`}>
          <span className="text-5xl sm:text-6xl font-black uppercase bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]">{second}</span>
        </div>
      </div>
      <div className="h-1 rounded-full mt-3 w-44 bg-gradient-to-r from-cyan-400 to-blue-500" />
    </div>
  );
};
