import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  School,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated Glowing Particle Sphere Effect on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 420);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const numParticles = 650;
    const radius = Math.min(width, height) * 0.36;
    const particles: { theta: number; phi: number; baseSpeed: number; size: number; hue: number }[] = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(Math.random() * 2 - 1),
        baseSpeed: 0.003 + Math.random() * 0.004,
        size: 1 + Math.random() * 1.8,
        hue: 175 + Math.random() * 45 // Cyan to vibrant electric blue
      });
    }

    let rotationX = 0;
    let rotationY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotationY += 0.005;
      rotationX += 0.002;

      const centerX = width / 2;
      const centerY = height / 2;

      particles.forEach((p) => {
        p.theta += p.baseSpeed;

        // 3D Spherical Coordinates
        const x = radius * Math.sin(p.phi) * Math.cos(p.theta);
        const y = radius * Math.cos(p.phi);
        const z = radius * Math.sin(p.phi) * Math.sin(p.theta);

        // Rotate in 3D
        const rotX = x * Math.cos(rotationY) - z * Math.sin(rotationY);
        const rotZ = x * Math.sin(rotationY) + z * Math.cos(rotationY);

        const rotY = y * Math.cos(rotationX) - rotZ * Math.sin(rotationX);
        const finalZ = y * Math.sin(rotationX) + rotZ * Math.cos(rotationX);

        // Perspective projection
        const scale = (finalZ + radius * 1.8) / (radius * 2.8);
        const alpha = Math.max(0.15, Math.min(1, (finalZ + radius) / (radius * 2)));

        const projX = centerX + rotX * (scale * 0.95);
        const projY = centerY + rotY * (scale * 0.95);

        ctx.beginPath();
        ctx.arc(projX, projY, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${alpha})`;
        ctx.shadowBlur = 8 * scale;
        ctx.shadowColor = `hsla(${p.hue}, 95%, 60%, ${alpha * 0.8})`;
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
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Ambient background glow orbs matching reference */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-lime-400/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-blue-600/25 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header Logo */}
      <header className="pt-8 pb-4 flex justify-center items-center z-10">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg shadow-black/40">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
            <School className="w-4 h-4" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-white">EduPrime ERP</span>
        </div>
      </header>

      {/* Main Content Area: 2 Columns */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Glass Glow Card with 3D Canvas Sphere */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md aspect-square rounded-[36px] bg-gradient-to-br from-blue-900/40 via-cyan-950/20 to-slate-950/60 border border-cyan-500/20 shadow-[0_0_80px_-20px_rgba(6,182,212,0.3)] backdrop-blur-2xl relative flex items-center justify-center p-6 overflow-hidden group">
              {/* Inner ambient ring */}
              <div className="absolute inset-4 rounded-[30px] border border-cyan-400/10 pointer-events-none" />
              {/* Canvas Particle Sphere */}
              <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none z-0" />
            </div>
          </div>

          {/* Right Column: Exactly 3 Dedicated Path Selection Cards */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                Choose <span className="bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">Your Path</span>
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Select your designated institutional role to open your portal
              </p>
            </div>

            {/* Exactly 3 Separate Login Cards */}
            <div className="space-y-4 pt-2">
              
              {/* 1. Faculty Login */}
              <div
                onClick={() => navigate('/login/teacher')}
                className="group p-4.5 rounded-2xl bg-[#0f172a]/70 hover:bg-[#1e293b]/90 border border-slate-800 hover:border-cyan-500/50 shadow-md hover:shadow-cyan-500/10 transition-all duration-200 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 group-hover:bg-cyan-500/20 text-slate-300 group-hover:text-cyan-400 border border-slate-700/50 group-hover:border-cyan-500/30 flex items-center justify-center transition-colors">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">Faculty Login</h3>
                    <p className="text-xs text-slate-400">Class roll call, attendance & academic scores</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              {/* 2. Head Master Login */}
              <div
                onClick={() => navigate('/login/headmaster')}
                className="group p-4.5 rounded-2xl bg-[#0f172a]/70 hover:bg-[#1e293b]/90 border border-slate-800 hover:border-emerald-500/50 shadow-md hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 group-hover:bg-emerald-500/20 text-slate-300 group-hover:text-emerald-400 border border-slate-700/50 group-hover:border-emerald-500/30 flex items-center justify-center transition-colors">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Head Master Login</h3>
                    <p className="text-xs text-slate-400">School-wide cohort supervision & admissions</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              {/* 3. Master Admin PIN Login */}
              <div
                onClick={() => navigate('/login/admin')}
                className="group p-4.5 rounded-2xl bg-[#0f172a]/70 hover:bg-[#1e293b]/90 border border-slate-800 hover:border-lime-400/50 shadow-md hover:shadow-lime-400/10 transition-all duration-200 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 group-hover:bg-lime-400/20 text-slate-300 group-hover:text-lime-300 border border-slate-700/50 group-hover:border-lime-400/30 flex items-center justify-center transition-colors">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-lime-300 transition-colors">Master Admin Login</h3>
                    <p className="text-xs text-slate-400">6-digit PIN authenticated system control</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 group-hover:text-lime-300 group-hover:translate-x-1 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 z-10 border-t border-white/5">
        EduPrime School Management System
      </footer>
    </div>
  );
};
