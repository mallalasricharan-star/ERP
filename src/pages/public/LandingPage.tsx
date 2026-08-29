import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  School,
  ChevronRight,
  Sparkles,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Award,
  Layers,
  Activity,
  CreditCard,
  Package,
  CalendarClock,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Users,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { FuturisticVisualizer } from '../../components/common/FuturisticVisualizer';
import { themeService, AnimationThemeConfig } from '../../services/themeService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = useState<AnimationThemeConfig>(themeService.getActiveTheme());

  // Listen to Admin live theme updates
  useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(themeService.getActiveTheme());
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#050811] text-white selection:bg-cyan-400 selection:text-black font-sans antialiased overflow-x-hidden">
      
      {/* Dynamic Background Glow Lighting */}
      <div
        className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-colors duration-1000 -z-10"
        style={{ background: activeTheme.glowColor }}
      />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* 1. STICKY MODERN NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#050811]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${activeTheme.primaryColor}, ${activeTheme.secondaryColor})` }}
            >
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-wide uppercase bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                EduPrime ERP
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                Enterprise Ecosystem
              </span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#portals" className="hover:text-cyan-300 transition-colors">Access Portals</a>
            <a href="#data-flow" className="hover:text-cyan-300 transition-colors">Data Matrix</a>
            <a href="#modules" className="hover:text-cyan-300 transition-colors">ERP Modules</a>
            <a href="#analytics" className="hover:text-cyan-300 transition-colors">Telemetry</a>
          </div>

          {/* Admin Fast Access Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login/admin')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin PIN</span>
            </button>
          </div>

        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Top Intelligence Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-xl">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeTheme.primaryColor }} />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Active Animation Architecture: <strong className="text-cyan-300">{activeTheme.name}</strong>
            </span>
          </div>
        </div>

        {/* Giant Hero Title & Tagline */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none">
            Next-Gen School <br />
            <span
              className="bg-gradient-to-r from-lime-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.4)]"
            >
              Enterprise ERP
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Unified student demographics, automated attendance roll calls, academic grading, curriculum book stock, ID cards, and hierarchical leave governance.
          </p>
        </div>

        {/* 2-Column Hero Stage: 3D Holographic Visualizer (Left) + 3 Role Access Cards (Right) */}
        <div id="portals" className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Interactive Visualizer Canvas in Glassmorphic Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md aspect-square rounded-[36px] bg-gradient-to-br from-slate-950/80 via-blue-950/40 to-cyan-950/30 border border-white/15 shadow-[0_0_80px_-20px_rgba(6,182,212,0.3)] backdrop-blur-3xl p-4 relative flex items-center justify-center overflow-hidden">
              <FuturisticVisualizer theme={activeTheme} className="w-full h-full" showHUD={true} />
            </div>
          </div>

          {/* Right Column: 3 Dedicated Role Access Cards */}
          <div className="lg:col-span-7 space-y-4">
            
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Institutional Access</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Choose Your Workspace</h2>
            </div>

            {/* 1. Faculty Login */}
            <div
              onClick={() => navigate('/login/teacher')}
              className="group p-5 rounded-3xl bg-[#0e1628]/90 hover:bg-[#15233e] border border-slate-800 hover:border-cyan-400 shadow-xl hover:shadow-cyan-500/15 transition-all duration-300 cursor-pointer flex items-center justify-between transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 group-hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 flex items-center justify-center transition-transform group-hover:scale-110">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    Faculty / Teacher Portal
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Class roll call, attendance records, exam scoring & student progress cards
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-cyan-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 group-hover:translate-x-1.5 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

            {/* 2. Head Master Login */}
            <div
              onClick={() => navigate('/login/headmaster')}
              className="group p-5 rounded-3xl bg-[#0e1628]/90 hover:bg-[#15233e] border border-slate-800 hover:border-emerald-400 shadow-xl hover:shadow-emerald-500/15 transition-all duration-300 cursor-pointer flex items-center justify-between transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 group-hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-transform group-hover:scale-110">
                  <UserCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                    Head Master Executive Portal
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    School-wide cohort supervision, student admissions & faculty leave review
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 group-hover:translate-x-1.5 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

            {/* 3. Master Admin Login */}
            <div
              onClick={() => navigate('/login/admin')}
              className="group p-5 rounded-3xl bg-[#0e1628]/90 hover:bg-[#15233e] border border-slate-800 hover:border-lime-400 shadow-xl hover:shadow-lime-400/15 transition-all duration-300 cursor-pointer flex items-center justify-between transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-lime-400/15 group-hover:bg-lime-400/25 text-lime-400 border border-lime-400/30 flex items-center justify-center transition-transform group-hover:scale-110">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white group-hover:text-lime-300 transition-colors">
                    Master Admin Control
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    6-digit PIN authenticated system governance, book inventory & ID cards
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-lime-400 group-hover:text-slate-950 flex items-center justify-center text-slate-400 group-hover:translate-x-1.5 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 3. CONNECTED DEPARTMENT DATA FLOW MATRIX */}
      <section id="data-flow" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Integrated Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Connected Department Data Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Real-time data synchronization between students, faculty roll calls, academic assessments, and administration.
          </p>
        </div>

        {/* Data Flow Line Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {[
            { step: '01', title: 'Admissions', desc: 'Class 1–6 Roster', icon: Users, color: 'text-blue-400' },
            { step: '02', title: 'Attendance', desc: 'Live Roll Call', icon: CalendarCheck, color: 'text-emerald-400' },
            { step: '03', title: 'Curriculum', desc: 'Subject Marks', icon: Award, color: 'text-indigo-400' },
            { step: '04', title: 'Textbooks', desc: 'Stock Inventory', icon: Package, color: 'text-amber-400' },
            { step: '05', title: 'ID Cards', desc: 'Batch A4 Print', icon: CreditCard, color: 'text-purple-400' },
            { step: '06', title: 'Leaves', desc: 'Hierarchy Approvals', icon: CalendarClock, color: 'text-rose-400' },
            { step: '07', title: 'Governance', desc: 'Audit Logs', icon: Database, color: 'text-cyan-400' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col justify-between hover:border-cyan-400 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500">{item.step}</span>
                  <Icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. KEY ERP MODULES GRID */}
      <section id="modules" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Enterprise Modules</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Comprehensive Management System
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Every administrative, academic, and security tool needed to run a production institution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { title: 'Student Management', desc: 'Class 1 to 6 enrollment profiles with parent contacts & roll numbers.', icon: GraduationCap, path: '/login/teacher' },
            { title: 'Faculty & Head Master', desc: 'Role-based credentials, assigned grade tiers, and institutional permissions.', icon: Users, path: '/login/headmaster' },
            { title: 'Daily Attendance', desc: 'Fast 1-click roll calls, absent student flags, and percentage analytics.', icon: CalendarCheck, path: '/login/teacher' },
            { title: 'Academic Scoring', desc: 'Subject marks evaluation with automated grading and progress cards.', icon: Award, path: '/login/teacher' },
            { title: 'Book Stock & Inventory', desc: 'Textbook inventory tracking, print stock sheets, and Excel exports.', icon: Package, path: '/login/admin' },
            { title: 'Student ID Cards', desc: 'High-resolution student identity card batch generation with A4 print layout.', icon: CreditCard, path: '/login/admin' },
            { title: 'Hierarchical Leaves', desc: 'Teacher-to-Headmaster and Headmaster-to-Admin approval workflows.', icon: CalendarClock, path: '/login/teacher' },
            { title: 'Security & Audit Logs', desc: 'Cryptographic 6-digit PIN authentication and timestamped audit trails.', icon: ShieldCheck, path: '/login/admin' }
          ].map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(m.path)}
                className="p-5 rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-cyan-400/60 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-cyan-500/20 text-slate-300 group-hover:text-cyan-400 flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">{m.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 group-hover:text-cyan-400 font-bold">
                  <span>Access Module</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. LIVE TELEMETRY STATISTICS */}
      <section id="analytics" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Grades</span>
              <p className="text-4xl font-extrabold text-white mt-1">Class 1–6</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Full Primary Cohorts</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Master Auth</span>
              <p className="text-4xl font-extrabold text-cyan-400 mt-1">6-Digit PIN</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Cryptographic Security</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cloud Database</span>
              <p className="text-4xl font-extrabold text-emerald-400 mt-1">PostgreSQL</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Direct Supabase Sync</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Export Engine</span>
              <p className="text-4xl font-extrabold text-purple-400 mt-1">Excel & Print</p>
              <span className="text-[11px] text-slate-500 mt-1 block">1-Click Reporting</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-8 text-center text-xs text-slate-500 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-400">EduPrime School Management System</span>
          </div>
          <p className="text-slate-500">
            Engineered for Production Institutional Excellence • 2026-2027
          </p>
        </div>
      </footer>

    </div>
  );
};
