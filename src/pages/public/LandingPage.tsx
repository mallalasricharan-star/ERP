import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  School,
  ChevronRight
} from 'lucide-react';
import { FuturisticVisualizer } from '../../components/common/FuturisticVisualizer';
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
      
      {/* Ambient Glow Orbs */}
      <div
        className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000"
        style={{ background: activeTheme.glowColor }}
      />
      <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* 1. TOP MINIMAL HEADER */}
      <header className="pt-6 pb-2 flex items-center justify-center z-20">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform"
            style={{ background: `linear-gradient(135deg, ${activeTheme.primaryColor}, ${activeTheme.secondaryColor})` }}
          >
            <School className="w-4 h-4" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-white">EduPrime ERP</span>
        </div>
      </header>

      {/* 2. MAIN SINGLE-SCREEN 2-COLUMN VIEWPORT */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto z-10 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Glass Glow Card with Futuristic 3D Visualizer */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md aspect-square rounded-[36px] bg-gradient-to-br from-blue-950/40 via-slate-950/60 to-cyan-950/30 border border-cyan-500/20 shadow-[0_0_80px_-20px_rgba(6,182,212,0.3)] backdrop-blur-2xl relative flex items-center justify-center p-6 overflow-hidden group">
              <div className="absolute inset-4 rounded-[30px] border border-cyan-400/10 pointer-events-none" />
              <FuturisticVisualizer theme={activeTheme} className="w-full h-full" />
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
            <div className="space-y-4 pt-1">
              
              {/* 1. Faculty Login */}
              <div
                onClick={() => navigate('/login/teacher')}
                className="group p-4.5 rounded-2xl bg-[#0e1628]/85 hover:bg-[#16223d] border border-slate-800 hover:border-cyan-400 shadow-md hover:shadow-cyan-500/15 transition-all duration-200 cursor-pointer flex items-center justify-between"
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
                className="group p-4.5 rounded-2xl bg-[#0e1628]/85 hover:bg-[#16223d] border border-slate-800 hover:border-emerald-400 shadow-md hover:shadow-emerald-500/15 transition-all duration-200 cursor-pointer flex items-center justify-between"
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
                className="group p-4.5 rounded-2xl bg-[#0e1628]/85 hover:bg-[#16223d] border border-slate-800 hover:border-lime-400 shadow-md hover:shadow-lime-400/15 transition-all duration-200 cursor-pointer flex items-center justify-between"
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

      {/* 3. FOOTER */}
      <footer className="py-4 text-center text-xs text-slate-500 z-10 border-t border-white/5">
        EduPrime School Management System
      </footer>
    </div>
  );
};
