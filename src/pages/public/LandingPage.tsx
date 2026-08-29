import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  School,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Film
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Key to force re-trigger of movie animation sequence on demand
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [showSecondWord, setShowSecondWord] = useState<boolean>(false);
  const [showPortals, setShowPortals] = useState<boolean>(false);

  useEffect(() => {
    setShowSecondWord(false);
    setShowPortals(false);

    // Sequence timing:
    // 0ms: First Word "EDUPRIME" zooms in with glowing light sweep
    // 1200ms: "SCHOOL ERP" flies in and snaps into place
    // 2000ms: Portal cards and 3D globe smoothly slide in
    const t1 = setTimeout(() => setShowSecondWord(true), 1200);
    const t2 = setTimeout(() => setShowPortals(true), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [animationKey]);

  const handleReplay = () => {
    setAnimationKey(prev => prev + 1);
  };

  // 3D Canvas Particle Sphere
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 360);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const numParticles = 600;
    const radius = Math.min(width, height) * 0.36;
    const particles: { theta: number; phi: number; speed: number; size: number; hue: number }[] = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(Math.random() * 2 - 1),
        speed: 0.003 + Math.random() * 0.003,
        size: 1.2 + Math.random() * 1.8,
        hue: 170 + Math.random() * 50
      });
    }

    let rotY = 0;
    let rotX = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      rotY += 0.005;
      rotX += 0.002;

      const centerX = width / 2;
      const centerY = height / 2;

      // Center glowing core
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 22);
      coreGrad.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
      coreGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.25)');
      coreGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.beginPath();
      ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      particles.forEach((p) => {
        p.theta += p.speed;

        const x = radius * Math.sin(p.phi) * Math.cos(p.theta);
        const y = radius * Math.cos(p.phi);
        const z = radius * Math.sin(p.phi) * Math.sin(p.theta);

        const rX = x * Math.cos(rotY) - z * Math.sin(rotY);
        const rZ = x * Math.sin(rotY) + z * Math.cos(rotY);

        const rY = y * Math.cos(rotX) - rZ * Math.sin(rotX);
        const fZ = y * Math.sin(rotX) + rZ * Math.cos(rotX);

        const scale = (fZ + radius * 1.8) / (radius * 2.8);
        const alpha = Math.max(0.18, Math.min(1, (fZ + radius) / (radius * 2)));

        const projX = centerX + rX * (scale * 0.95);
        const projY = centerY + rY * (scale * 0.95);

        ctx.beginPath();
        ctx.arc(projX, projY, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 68%, ${alpha})`;
        ctx.shadowBlur = 8 * scale;
        ctx.shadowColor = `hsla(${p.hue}, 95%, 60%, ${alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      key={animationKey}
      className="min-h-screen lg:h-screen w-screen bg-[#050811] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans"
    >
      {/* Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <School className="w-4 h-4" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
            Institutional Ecosystem
          </span>
        </div>

        <button
          type="button"
          onClick={handleReplay}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-cyan-300 text-xs font-bold border border-white/10 transition-all cursor-pointer backdrop-blur-md"
          title="Replay Movie Title Intro"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Replay Movie Intro</span>
        </button>
      </header>

      {/* Main Single-Screen Cinematic Stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto z-10 py-2">
        
        {/* 🎬 1. MOVIE TITLE INTRO (Word by Word Reveal) */}
        <div className="text-center w-full mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-2 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official Institutional Release</span>
          </div>

          {/* Cinematic Title Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 leading-none">
            {/* Word 1: EDUPRIME (Zooms in with glowing movie light flare) */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-wider animate-movie-zoom animate-light-sweep drop-shadow-[0_0_40px_rgba(34,211,238,0.7)]">
              EDUPRIME
            </h1>

            {/* Word 2 & 3: SCHOOL ERP (Glides in seamlessly next to it) */}
            {showSecondWord && (
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-wider bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent animate-fly-in drop-shadow-[0_0_40px_rgba(74,222,128,0.6)]">
                SCHOOL ERP
              </h1>
            )}
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-400 max-w-lg mx-auto mt-3 animate-fade-in">
            Next-Generation Enterprise Management & Academic Intelligence
          </p>
        </div>

        {/* 🚀 2. 2-COLUMN VIEWPORT (3D GLOBE + 3 ROLE CARDS) */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full transition-opacity duration-700 ${
            showPortals ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Left Column: 3D Hologram Particle Sphere */}
          <div className="lg:col-span-5 flex justify-center animate-float-infinite">
            <div className="w-full max-w-xs sm:max-w-sm aspect-square rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-950/60 to-cyan-950/30 border border-cyan-500/30 shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)] backdrop-blur-2xl relative flex items-center justify-center p-4 overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none z-0" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-bold text-slate-400 px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
                </span>
                <span className="font-mono text-cyan-300">2026-27</span>
              </div>
            </div>
          </div>

          {/* Right Column: Exactly 3 Dedicated Role Selection Cards */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3 sm:space-y-3.5">
            
            {/* 1. Faculty Login */}
            <div
              onClick={() => navigate('/login/teacher')}
              className="animate-card-1 group p-4 sm:p-4.5 rounded-2xl bg-[#0e1628]/85 hover:bg-[#16223d] border border-slate-800 hover:border-cyan-400 shadow-lg hover:shadow-cyan-500/15 transition-all duration-200 cursor-pointer flex items-center justify-between transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 group-hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    Faculty / Teacher Portal
                  </h3>
                  <p className="text-xs text-slate-400">
                    Class roll call, attendance & academic scores
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-cyan-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 group-hover:translate-x-1 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

            {/* 2. Head Master Login */}
            <div
              onClick={() => navigate('/login/headmaster')}
              className="animate-card-2 group p-4 sm:p-4.5 rounded-2xl bg-[#0e1628]/85 hover:bg-[#16223d] border border-slate-800 hover:border-emerald-400 shadow-lg hover:shadow-emerald-500/15 transition-all duration-200 cursor-pointer flex items-center justify-between transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 group-hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                    Head Master Executive Portal
                  </h3>
                  <p className="text-xs text-slate-400">
                    School cohorts, admissions & faculty leave review
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 group-hover:translate-x-1 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

            {/* 3. Master Admin Login */}
            <div
              onClick={() => navigate('/login/admin')}
              className="animate-card-3 group p-4 sm:p-4.5 rounded-2xl bg-[#0e1628]/85 hover:bg-[#16223d] border border-slate-800 hover:border-lime-400 shadow-lg hover:shadow-lime-400/15 transition-all duration-200 cursor-pointer flex items-center justify-between transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="w-12 h-12 rounded-xl bg-lime-400/15 group-hover:bg-lime-400/25 text-lime-400 border border-lime-400/30 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-lime-300 transition-colors">
                    Master Admin Control
                  </h3>
                  <p className="text-xs text-slate-400">
                    6-digit PIN authenticated system governance & ID cards
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-lime-400 group-hover:text-slate-950 flex items-center justify-center text-slate-400 group-hover:translate-x-1 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-slate-500 z-10 border-t border-white/5">
        EduPrime School Management System
      </footer>
    </div>
  );
};
