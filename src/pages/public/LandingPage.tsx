import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  School,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Flame,
  Layers,
  Activity
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Animated 3D Cinematic Particle Sphere & Holographic Core
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 460);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 460);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const numParticles = 850;
    const radius = Math.min(width, height) * 0.38;
    const particles: { theta: number; phi: number; baseSpeed: number; size: number; hue: number }[] = [];

    // Outer spherical galaxy particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(Math.random() * 2 - 1),
        baseSpeed: 0.0025 + Math.random() * 0.0035,
        size: 1.2 + Math.random() * 2.2,
        hue: 165 + Math.random() * 60 // Neon emerald, cyan & deep electric blue
      });
    }

    // Inner orbiting rings particles
    const ringParticles: { angle: number; r: number; speed: number; hue: number; size: number }[] = [];
    for (let i = 0; i < 180; i++) {
      ringParticles.push({
        angle: Math.random() * Math.PI * 2,
        r: radius * (0.55 + Math.random() * 0.3),
        speed: 0.008 + Math.random() * 0.006,
        hue: 180 + Math.random() * 40,
        size: 1 + Math.random() * 1.5
      });
    }

    let rotationX = 0;
    let rotationY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.8;
      targetRotX = -y * 0.8;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotationY += (targetRotY - rotationY) * 0.05 + 0.004;
      rotationX += (targetRotX - rotationX) * 0.05 + 0.002;
      pulse += 0.03;

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw central glowing hologram core
      const coreGlow = Math.sin(pulse) * 8 + 32;
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreGlow);
      coreGrad.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
      coreGrad.addColorStop(0.4, 'rgba(6, 182, 212, 0.3)');
      coreGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreGlow, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Render 3D Sphere Particles
      particles.forEach((p) => {
        p.theta += p.baseSpeed;

        const x = radius * Math.sin(p.phi) * Math.cos(p.theta);
        const y = radius * Math.cos(p.phi);
        const z = radius * Math.sin(p.phi) * Math.sin(p.theta);

        // 3D Matrix Rotation
        const rotX = x * Math.cos(rotationY) - z * Math.sin(rotationY);
        const rotZ = x * Math.sin(rotationY) + z * Math.cos(rotationY);

        const rotY = y * Math.cos(rotationX) - rotZ * Math.sin(rotationX);
        const finalZ = y * Math.sin(rotationX) + rotZ * Math.cos(rotationX);

        const scale = (finalZ + radius * 1.9) / (radius * 2.9);
        const alpha = Math.max(0.18, Math.min(1, (finalZ + radius) / (radius * 2)));

        const projX = centerX + rotX * (scale * 0.96);
        const projY = centerY + rotY * (scale * 0.96);

        ctx.beginPath();
        ctx.arc(projX, projY, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 68%, ${alpha})`;
        ctx.shadowBlur = 10 * scale;
        ctx.shadowColor = `hsla(${p.hue}, 95%, 62%, ${alpha * 0.9})`;
        ctx.fill();
      });

      // Render Equatorial Orbit Rings
      ringParticles.forEach((rp) => {
        rp.angle += rp.speed;
        const rx = rp.r * Math.cos(rp.angle);
        const rz = rp.r * Math.sin(rp.angle);
        const ry = Math.sin(rp.angle * 2 + pulse) * 12;

        const rotX = rx * Math.cos(rotationY) - rz * Math.sin(rotationY);
        const rotZ = rx * Math.sin(rotationY) + rz * Math.cos(rotationY);
        const rotY = ry * Math.cos(rotationX) - rotZ * Math.sin(rotationX);
        const finalZ = ry * Math.sin(rotationX) + rotZ * Math.cos(rotationX);

        const scale = (finalZ + radius * 1.9) / (radius * 2.9);
        const alpha = Math.max(0.2, Math.min(0.9, (finalZ + radius) / (radius * 2)));

        const projX = centerX + rotX * (scale * 0.96);
        const projY = centerY + rotY * (scale * 0.96);

        ctx.beginPath();
        ctx.arc(projX, projY, rp.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${rp.hue}, 100%, 75%, ${alpha})`;
        ctx.shadowBlur = 8 * scale;
        ctx.shadowColor = `hsla(${rp.hue}, 100%, 70%, ${alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#050811] text-white flex flex-col justify-between relative overflow-hidden selection:bg-cyan-400 selection:text-black font-sans"
    >
      {/* Dynamic Ambient Cinematic Glow Beams */}
      <div className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-lime-400/15 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/4 -left-28 w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[160px] pointer-events-none animate-pulse-glow" />

      {/* 1. CINEMATIC MOVIE HEADER INTRO */}
      <header className="pt-8 pb-4 flex flex-col items-center justify-center z-10 animate-movie-reveal px-4">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900/80 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl shadow-cyan-500/20 group cursor-default transition-all duration-300 hover:border-cyan-400">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/40">
            <School className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold tracking-widest uppercase bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              EduPrime ERP
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Enterprise
            </span>
          </div>
        </div>
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold text-cyan-400/80 mt-2 text-center">
          The Next-Generation Institutional Management Ecosystem
        </p>
      </header>

      {/* 2. MAIN 2-COLUMN MOVIE STAGE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-6 sm:py-10 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full">
          
          {/* Left Column: Glass Glow Card with 3D Holographic Particle Sphere */}
          <div className="lg:col-span-6 flex justify-center animate-float-slow">
            <div className="w-full max-w-lg aspect-square rounded-[44px] bg-gradient-to-br from-blue-950/40 via-slate-950/50 to-cyan-950/30 border border-cyan-500/30 shadow-[0_0_100px_-20px_rgba(6,182,212,0.35)] backdrop-blur-3xl relative flex items-center justify-center p-6 sm:p-8 overflow-hidden group">
              
              {/* Futuristic concentric ambient ring */}
              <div className="absolute inset-4 rounded-[36px] border border-cyan-400/15 pointer-events-none" />
              <div className="absolute inset-8 rounded-[30px] border border-cyan-400/10 pointer-events-none" />
              
              {/* Canvas 3D Interactive Sphere */}
              <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-auto cursor-grab active:cursor-grabbing z-0" />

              {/* Bottom Hologram HUD Badge */}
              <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between pointer-events-none backdrop-blur-md bg-black/40 px-4 py-2 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Active Ecosystem</span>
                </div>
                <span className="text-xs font-mono text-slate-300">Live Telemetry</span>
              </div>
            </div>
          </div>

          {/* Right Column: Giant Movie Headline & Role Selection Cards */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-8">
            
            {/* Giant Cinematic Headline */}
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
                CHOOSE <br />
                <span className="bg-gradient-to-r from-lime-300 via-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-text-shimmer drop-shadow-[0_0_35px_rgba(34,211,238,0.4)]">
                  YOUR PATH
                </span>
              </h1>
              <p className="text-base sm:text-lg font-medium text-slate-300 leading-relaxed max-w-xl">
                Select your designated institutional authority portal to initiate your workspace.
              </p>
            </div>

            {/* Exactly 3 High-Impact Separate Login Cards */}
            <div className="space-y-4 pt-2">
              
              {/* 1. Faculty Login */}
              <div
                onClick={() => navigate('/login/teacher')}
                className="group p-5 sm:p-6 rounded-3xl bg-[#0e1628]/80 hover:bg-[#16223d] border-2 border-slate-800/80 hover:border-cyan-400 shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer flex items-center justify-between transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/15 group-hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg shadow-cyan-500/10">
                    <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                      Faculty Portal Login
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                      Class roll call attendance, score entries & progress report cards
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-cyan-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 group-hover:translate-x-1.5 transition-all shadow-md">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>

              {/* 2. Head Master Login */}
              <div
                onClick={() => navigate('/login/headmaster')}
                className="group p-5 sm:p-6 rounded-3xl bg-[#0e1628]/80 hover:bg-[#16223d] border-2 border-slate-800/80 hover:border-emerald-400 shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer flex items-center justify-between transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/15 group-hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg shadow-emerald-500/10">
                    <UserCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                      Head Master Executive Login
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                      School-wide cohort supervision, admissions & faculty leave review
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 group-hover:translate-x-1.5 transition-all shadow-md">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>

              {/* 3. Master Admin Login */}
              <div
                onClick={() => navigate('/login/admin')}
                className="group p-5 sm:p-6 rounded-3xl bg-[#0e1628]/80 hover:bg-[#16223d] border-2 border-slate-800/80 hover:border-lime-400 shadow-xl hover:shadow-lime-400/20 transition-all duration-300 cursor-pointer flex items-center justify-between transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-lime-400/15 group-hover:bg-lime-400/25 text-lime-400 border border-lime-400/30 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg shadow-lime-400/10">
                    <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-lime-300 transition-colors">
                      Master Admin Login
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                      6-digit PIN authenticated system governance & ID card generator
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-lime-400 group-hover:text-slate-950 flex items-center justify-center text-slate-400 group-hover:translate-x-1.5 transition-all shadow-md">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* 3. CINEMATIC FOOTER */}
      <footer className="py-5 text-center text-xs text-slate-500 z-10 border-t border-white/5">
        <span className="font-bold text-slate-400">EduPrime School Management System</span> • Production-Grade Institutional ERP
      </footer>
    </div>
  );
};
