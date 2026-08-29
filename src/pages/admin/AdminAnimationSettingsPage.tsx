import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Eye,
  Zap,
  Atom,
  Activity,
  Globe,
  Layers,
  Search,
  Check,
  ShieldCheck,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { FuturisticVisualizer } from '../../components/common/FuturisticVisualizer';
import {
  themeService,
  ANIMATION_THEMES,
  AnimationThemeId,
  AnimationThemeConfig
} from '../../services/themeService';
import { useToast } from '../../context/ToastContext';

// 150 Animation Concept Names Library Categorized
const CONCEPT_LIBRARY = [
  'Quantum Core', 'Nexus Flow', 'Neural Pulse', 'Quantum Grid', 'Core Fusion',
  'Nexus Prime', 'Data Pulse', 'Quantum Flux', 'Nova Core', 'Neural Nexus',
  'Infinity Core', 'Digital Orbit', 'Data Nexus', 'Cyber Flux', 'Quantum Sphere',
  'Core Matrix', 'Nexus Wave', 'Neural Flow', 'Data Orbit', 'Quantum Wave',
  'Nova Nexus', 'Digital Pulse', 'Core Orbit', 'Future Grid', 'Quantum Nexus',
  'Neural Matrix', 'Infinity Grid', 'Data Fusion', 'Nova Pulse', 'Core Velocity',
  'Quantum Horizon', 'Nexus Spectrum', 'Digital Fusion', 'Neural Orbit', 'Quantum Stream',
  'Data Velocity', 'Nova Matrix', 'Core Spectrum', 'Cyber Nexus', 'Quantum Rise',
  'Neural Spectrum', 'Infinity Nexus', 'Digital Horizon', 'Data Matrix', 'Quantum Vision',
  'Nova Flux', 'Core Nexus', 'Neural Horizon', 'Quantum Infinity', 'Nexus Evolution',
  'Quantum Axis', 'Quantum Vector', 'Quantum Engine', 'Quantum Link', 'Quantum Bridge',
  'Quantum Network', 'Quantum Drive', 'Quantum Pulse', 'Quantum Vision', 'Quantum Matrix',
  'Nexus Axis', 'Nexus Vector', 'Nexus Engine', 'Nexus Link', 'Nexus Bridge',
  'Nexus Core', 'Nexus Network', 'Nexus Drive', 'Nexus Vision', 'Nexus Fusion',
  'Neural Core', 'Neural Drive', 'Neural Link', 'Neural Bridge', 'Neural Engine',
  'Neural Vector', 'Neural Grid', 'Neural Sphere', 'Neural Fusion', 'Neural Matrix',
  'Data Core', 'Data Engine', 'Data Vector', 'Data Bridge', 'Data Network',
  'Data Stream', 'Data Pulse', 'Data Horizon', 'Data Fusion', 'Data Spectrum',
  'Digital Core', 'Digital Nexus', 'Digital Vector', 'Digital Engine', 'Digital Bridge',
  'Digital Matrix', 'Digital Sphere', 'Digital Flow', 'Digital Pulse', 'Digital Horizon',
  'Nova Vector', 'Nova Engine', 'Nova Grid', 'Nova Sphere', 'Nova Horizon',
  'Nova Network', 'Nova Bridge', 'Nova Vision', 'Nova Drive', 'Nova Fusion',
  'Core Engine', 'Core Vector', 'Core Network', 'Core Bridge', 'Core Vision',
  'Core Pulse', 'Core Horizon', 'Core Fusion', 'Core Drive', 'Core Flow',
  'Future Nexus', 'Future Core', 'Future Pulse', 'Future Matrix', 'Future Sphere',
  'Future Vector', 'Future Flow', 'Future Fusion', 'Future Horizon', 'Future Network',
  'Enterprise Nexus', 'Enterprise Core', 'Enterprise Flow', 'Enterprise Pulse', 'Enterprise Matrix',
  'Enterprise Fusion', 'Enterprise Horizon', 'Enterprise Grid', 'Enterprise Sphere', 'Enterprise Vector',
  'Smart Nexus', 'Smart Core', 'Smart Matrix', 'Smart Flow', 'Smart Pulse',
  'Smart Fusion', 'Smart Grid', 'Smart Horizon', 'Smart Sphere', 'Smart Vector'
];

export const AdminAnimationSettingsPage: React.FC = () => {
  const toast = useToast();
  const [selectedThemeId, setSelectedThemeId] = useState<AnimationThemeId>(
    themeService.getActiveTheme().id
  );
  const [searchConcept, setSearchConcept] = useState('');

  const themes = themeService.getAllThemes();
  const currentPreviewTheme = ANIMATION_THEMES[selectedThemeId] || themes[0];

  const handleApplyTheme = () => {
    themeService.setActiveTheme(selectedThemeId);
    toast.success(`Published "${currentPreviewTheme.name}" as the active Landing Page animation!`);
  };

  const filteredConcepts = CONCEPT_LIBRARY.filter(c =>
    c.toLowerCase().includes(searchConcept.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Admin Visual Experience Manager</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Landing Page Futuristic Animation Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose and customize the active 3D particle visualizer rendered on the public landing page
          </p>
        </div>

        <button
          type="button"
          onClick={handleApplyTheme}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Publish Active Animation</span>
        </button>
      </div>

      {/* 2-Column: Live Preview (Left) + Theme Selection Engine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Interactive Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Visualizer Preview</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Interactive Canvas
              </span>
            </div>

            {/* Dark Visualizer Frame */}
            <div className="w-full aspect-square rounded-2xl bg-[#050811] border border-slate-800 p-3 relative overflow-hidden shadow-inner flex items-center justify-center">
              <FuturisticVisualizer theme={currentPreviewTheme} className="w-full h-full" />
            </div>

            {/* Theme Details Metadata */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Selected System:</span>
                <span className="font-bold text-slate-900">{currentPreviewTheme.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-semibold text-blue-600">{currentPreviewTheme.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Particle Hue:</span>
                <span className="font-mono text-slate-700">{currentPreviewTheme.particleHue}°</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-200">
                {currentPreviewTheme.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Theme Selector Cards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Animation Architecture</h3>
                <p className="text-xs text-slate-500">Click to preview in the live canvas on the left</p>
              </div>
              <Sliders className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {themes.map(t => {
                const isSelected = selectedThemeId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedThemeId(t.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-600 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: t.primaryColor }}
                          />
                          <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        {t.category}
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">{t.tagline}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">{t.badge}</span>
                      <span className={`font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                        {isSelected ? 'Previewing' : 'Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Publish Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Ready to Deploy?</span>
                <p className="text-xs text-slate-300 mt-0.5">
                  Publishing updates the public landing page immediately for all users.
                </p>
              </div>
              <button
                type="button"
                onClick={handleApplyTheme}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md transition-all cursor-pointer whitespace-nowrap ml-4"
              >
                Apply Live
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. 150 ANIMATION CONCEPT NAME LIBRARY REFERENCE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">150 Animation Concept Library</h3>
            <p className="text-xs text-slate-500">Enterprise visual style inspiration catalog</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchConcept}
              onChange={e => setSearchConcept(e.target.value)}
              placeholder="Search concepts..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredConcepts.map((name, index) => (
            <div
              key={index}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors flex items-center gap-2"
            >
              <span className="text-[10px] font-mono text-slate-400">#{index + 1}</span>
              <span className="truncate">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
