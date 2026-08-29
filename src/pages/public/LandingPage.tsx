import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  School,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { FuturisticVisualizer } from '../../components/common/FuturisticVisualizer';
import { CinematicWordReveal } from '../../components/letters';
import { themeService, AnimationThemeConfig } from '../../services/themeService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = useState<AnimationThemeConfig>(themeService.getActiveTheme());

  // Listen to live Admin theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(themeService.getActiveTheme());
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  return (
    <div className="min-h-screen lg:h-screen w-screen bg-[#050811] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans">
      
      {/* Ambient Glow Lighting */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-colors duration-1000"
        style={{ background: activeTheme.glowColor }}
      />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* 1. TOP MINIMAL HEADER */}
      <header className="pt-6 pb-2 flex items-center justify-center z-20">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform"
            style={{ background: `linear-gradient(135deg, ${activeTheme.primaryColor}, ${activeTheme.secondaryColor})` }}
          >
            <School className="w-5 h-5" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-white">EduPrime ERP</span>
        </div>
      </header>

      {/* 2. MAIN SINGLE-SCREEN 2-COLUMN VIEWPORT */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto z-10 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full">
          
          {/* Left Column: Glass Glow Card with Futuristic 3D Visualizer */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md aspect-square rounded-[40px] bg-gradient-to-br from-blue-950/40 via-slate-950/60 to-cyan-950/30 border border-cyan-500/25 shadow-[0_0_90px_-20px_rgba(6,182,212,0.35)] backdrop-blur-2xl relative flex items-center justify-center p-6 overflow-hidden group">
              <div className="absolute inset-4 rounded-[32px] border border-cyan-400/10 pointer-events-none" />
              <FuturisticVisualizer theme={activeTheme} className="w-full h-full" />
            </div>
          </div>

          {/* Right Column: Cinematic Word Reveal Hero + 3 Dedicated Path Cards */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            
            {/* 🎬 Cinematic Word-to-Full-Name Reveal Animation */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next-Gen Enterprise Platform</span>
              </div>

              {/* Dynamic Word-to-Full-Name Morph Sequence */}
              <div className="pt-1">
                <CinematicWordReveal />
              </div>

              <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed pt-1">
                Select your designated institutional authority portal to open your workspace
              </p>
            </div>

            {/* Exactly 3 Separate Large Font Login Cards */}
            <div className="space-y-3.5 pt-1">
              
              {/* 1. Faculty Login */}
              <div
                onClick={() => navigate('/login/teacher')}
                className="group p-5 sm:p-5.5 rounded-3xl bg-[#0e1628]/90 hover:bg-[#16243f] border-2 border-slate-800 hover:border-cyan-400 shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer flex items-center justify-between transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/15 group-hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm flex-shrink-0">
                    <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                      Faculty / Teacher Login
                    </h3>
                    <p className="text-sm sm:text-base font-semibold text-slate-300 mt-0.5">
                      Class roll call, attendance & academic score cards
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-cyan-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 group-hover:translate-x-1.5 transition-all flex-shrink-0 ml-3">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>

              {/* 2. Head Master Login */}
              <div
                onClick={() => navigate('/login/headmaster')}
                className="group p-5 sm:p-5.5 rounded-3xl bg-[#0e1628]/90 hover:bg-[#16243f] border-2 border-slate-800 hover:border-emerald-400 shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer flex items-center justify-between transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/15 group-hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm flex-shrink-0">
                    <UserCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-300 transition-colors">
                      Head Master Executive Login
                    </h3>
                    <p className="text-sm sm:text-base font-semibold text-slate-300 mt-0.5">
                      School-wide cohort supervision, admissions & leave approvals
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 group-hover:translate-x-1.5 transition-all flex-shrink-0 ml-3">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>

              {/* 3. Master Admin PIN Login */}
              <div
                onClick={() => navigate('/login/admin')}
                className="group p-5 sm:p-5.5 rounded-3xl bg-[#0e1628]/90 hover:bg-[#16243f] border-2 border-slate-800 hover:border-lime-400 shadow-xl hover:shadow-lime-400/20 transition-all duration-300 cursor-pointer flex items-center justify-between transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-lime-400/15 group-hover:bg-lime-400/25 text-lime-400 border border-lime-400/30 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm flex-shrink-0">
                    <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-lime-300 transition-colors">
                      Master Admin Control Login
                    </h3>
                    <p className="text-sm sm:text-base font-semibold text-slate-300 mt-0.5">
                      6-digit PIN authenticated system governance & ID cards
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-lime-400 group-hover:text-slate-950 flex items-center justify-center text-slate-400 group-hover:translate-x-1.5 transition-all flex-shrink-0 ml-3">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="py-4 text-center text-xs text-slate-500 z-10 border-t border-white/5">
        EduPrime School Management System • Enterprise Portal
      </footer>
    </div>
  );
};
