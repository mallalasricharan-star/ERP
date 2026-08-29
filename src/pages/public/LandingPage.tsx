import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  School,
  ChevronRight,
  Sparkles,
  Zap,
  Activity,
  Atom,
  Globe
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation Style Mode: 'quantum' | 'constellation' | 'cosmos'
  const [animMode, setAnimMode] = useState<'quantum' | 'constellation' | 'cosmos'>('quantum');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates inside canvas
    let mouseX = width / 2;
    let mouseY = height / 2;
    let isHovered = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovered = true;
    };
    const handleMouseLeave = () => {
      isHovered = false;
      mouseX = width / 2;
      mouseY = height / 2;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 1. Quantum & Constellation Particle Systems
    const numNodes = 75;
    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseRadius: number;
      hue: number;
    }[] = [];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: 2 + Math.random() * 3,
        baseRadius: 2 + Math.random() * 3,
        hue: 165 + Math.random() * 55 // Cyan, Emerald, Electric Blue
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      const centerX = width / 2;
      const centerY = height / 2;

      // ==========================================
      // MODE 1: QUANTUM REACTOR GYRO CORE
      // ==========================================
      if (animMode === 'quantum') {
        // Deep reactor ambient background glow
        const bgGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 150);
        bgGlow.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
        bgGlow.addColorStop(0.5, 'rgba(16, 185, 129, 0.15)');
        bgGlow.addColorStop(1, 'rgba(5, 8, 17, 0)');
        ctx.fillStyle = bgGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
        ctx.fill();

        // 3D Rotating Gyroscopic Laser Rings
        const numRings = 4;
        for (let r = 0; r < numRings; r++) {
          const ringRadius = 55 + r * 28;
          const tilt = (r * Math.PI) / numRings + time * (r % 2 === 0 ? 0.7 : -0.7);
          const aspect = Math.abs(Math.sin(tilt));

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(time * 0.4 * (r % 2 === 0 ? 1 : -1) + (r * Math.PI) / 4);

          ctx.beginPath();
          ctx.ellipse(0, 0, ringRadius, ringRadius * (0.35 + aspect * 0.65), 0, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${170 + r * 25}, 90%, 65%, ${0.5 + Math.sin(time + r) * 0.3})`;
          ctx.lineWidth = 2 + (r === 1 ? 1 : 0);
          ctx.shadowBlur = 15;
          ctx.shadowColor = `hsla(${170 + r * 25}, 100%, 60%, 0.8)`;
          ctx.stroke();

          // Orbiting Laser Photons along each ring
          const photonAngle = time * (1.2 + r * 0.4);
          const px = Math.cos(photonAngle) * ringRadius;
          const py = Math.sin(photonAngle) * (ringRadius * (0.35 + aspect * 0.65));

          ctx.beginPath();
          ctx.arc(px, py, 4 + r, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#22d3ee';
          ctx.fill();

          ctx.restore();
        }

        // Central Super-Luminous Reactor Heart
        const pulse = Math.sin(time * 3) * 6;
        const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 32 + pulse);
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.3, '#22d3ee');
        coreGradient.addColorStop(0.7, '#059669');
        coreGradient.addColorStop(1, 'rgba(5, 150, 105, 0)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, 32 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#22d3ee';
        ctx.fill();

        // Radiating Energy Sparkles
        for (let s = 0; s < 12; s++) {
          const sAngle = time * 0.8 + (s * Math.PI * 2) / 12;
          const sDist = 38 + pulse + Math.sin(time * 4 + s) * 15;
          const sx = centerX + Math.cos(sAngle) * sDist;
          const sy = centerY + Math.sin(sAngle) * sDist;

          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#67e8f9';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#67e8f9';
          ctx.fill();
        }
      }

      // ==========================================
      // MODE 2: NEURAL CONSTELLATION MESH
      // ==========================================
      else if (animMode === 'constellation') {
        // Update nodes with mouse physics
        nodes.forEach((n) => {
          n.x += n.vx;
          n.y += n.vy;

          if (n.x <= 0 || n.x >= width) n.vx *= -1;
          if (n.y <= 0 || n.y >= height) n.vy *= -1;

          // Mouse attraction
          if (isHovered) {
            const dx = mouseX - n.x;
            const dy = mouseY - n.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              n.x += (dx / dist) * 1.5;
              n.y += (dy / dist) * 1.5;
            }
          }
        });

        // Draw connecting constellation lines
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 95) {
              const alpha = (1 - dist / 95) * 0.7;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        // Draw Nodes
        nodes.forEach((n) => {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${n.hue}, 100%, 70%)`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = `hsl(${n.hue}, 100%, 65%)`;
          ctx.fill();
        });

        // Mouse connection circle
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(mouseX, mouseY, 40, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(74, 222, 128, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ==========================================
      // MODE 3: COSMIC SOLAR SYSTEM & ENERGY RAYS
      // ==========================================
      else {
        // Solar Core
        const sunRadius = 36 + Math.sin(time * 2) * 4;
        const sunGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, sunRadius * 1.8);
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.3, '#38bdf8');
        sunGrad.addColorStop(0.7, '#1d4ed8');
        sunGrad.addColorStop(1, 'rgba(29, 78, 216, 0)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, sunRadius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = sunGrad;
        ctx.fill();

        // 3 Orbiting Celestial Bodies
        const orbits = [
          { r: 70, speed: 0.9, size: 7, color: '#34d399' },
          { r: 110, speed: 0.6, size: 10, color: '#38bdf8' },
          { r: 150, speed: 0.35, size: 8, color: '#a855f7' }
        ];

        orbits.forEach((o, index) => {
          // Orbit path line
          ctx.beginPath();
          ctx.arc(centerX, centerY, o.r, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Planet
          const angle = time * o.speed + index * 2;
          const px = centerX + Math.cos(angle) * o.r;
          const py = centerY + Math.sin(angle) * o.r;

          ctx.beginPath();
          ctx.arc(px, py, o.size, 0, Math.PI * 2);
          ctx.fillStyle = o.color;
          ctx.shadowBlur = 18;
          ctx.shadowColor = o.color;
          ctx.fill();

          // Mini moon
          const moonAngle = time * 3;
          const mx = px + Math.cos(moonAngle) * (o.size + 8);
          const my = py + Math.sin(moonAngle) * (o.size + 8);
          ctx.beginPath();
          ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [animMode]);

  return (
    <div className="min-h-screen lg:h-screen w-screen bg-[#050811] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans">
      
      {/* Ambient Lighting Rays */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar Header */}
      <header className="px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <School className="w-4 h-4" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
            EduPrime Institutional Ecosystem
          </span>
        </div>

        {/* Animation Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-full border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setAnimMode('quantum')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              animMode === 'quantum'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Quantum Core</span>
          </button>

          <button
            type="button"
            onClick={() => setAnimMode('constellation')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              animMode === 'constellation'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Neural Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setAnimMode('cosmos')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              animMode === 'cosmos'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Cosmic Orbit</span>
          </button>
        </div>
      </header>

      {/* Main Single-Screen Layout */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto z-10 py-2">
        
        {/* Cinema Headline */}
        <div className="text-center w-full mb-6 sm:mb-7 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Generation Enterprise Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none">
            EDUPRIME{' '}
            <span className="bg-gradient-to-r from-lime-300 via-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.5)]">
              SCHOOL ERP
            </span>
          </h1>

          <p className="text-xs sm:text-sm font-medium text-slate-400 max-w-lg mx-auto mt-2.5">
            Choose your institutional portal below to access your workspace
          </p>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full animate-fade-in">
          
          {/* Left Column: Interactive Futuristic Canvas Animation Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-xs sm:max-w-sm aspect-square rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-950/70 to-cyan-950/30 border border-cyan-500/30 shadow-[0_0_70px_-15px_rgba(6,182,212,0.35)] backdrop-blur-2xl relative flex items-center justify-center p-3 overflow-hidden group">
              <canvas ref={canvasRef} className="w-full h-full object-contain cursor-crosshair z-0" />
              
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-bold text-slate-400 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md">
                <span className="flex items-center gap-1.5 text-cyan-300 capitalize">
                  <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                  {animMode} Visualizer
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Interactive</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Dedicated Role Selection Cards */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3 sm:space-y-3.5">
            
            {/* 1. Faculty Login */}
            <div
              onClick={() => navigate('/login/teacher')}
              className="group p-4 sm:p-4.5 rounded-2xl bg-[#0e1628]/85 hover:bg-[#16223d] border border-slate-800 hover:border-cyan-400 shadow-lg hover:shadow-cyan-500/15 transition-all duration-200 cursor-pointer flex items-center justify-between transform hover:-translate-y-0.5"
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
                    Class roll call, daily attendance & subject marks
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
              className="group p-4 sm:p-4.5 rounded-2xl bg-[#0e1628]/85 hover:bg-[#16223d] border border-slate-800 hover:border-emerald-400 shadow-lg hover:shadow-emerald-500/15 transition-all duration-200 cursor-pointer flex items-center justify-between transform hover:-translate-y-0.5"
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
                    Cohort supervision, student admissions & faculty leave approvals
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
              className="group p-4 sm:p-4.5 rounded-2xl bg-[#0e1628]/85 hover:bg-[#16223d] border border-slate-800 hover:border-lime-400 shadow-lg hover:shadow-lime-400/15 transition-all duration-200 cursor-pointer flex items-center justify-between transform hover:-translate-y-0.5"
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
                    6-digit PIN authenticated system control, ID cards & settings
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
        EduPrime School Management System • Institutional Portal
      </footer>
    </div>
  );
};
