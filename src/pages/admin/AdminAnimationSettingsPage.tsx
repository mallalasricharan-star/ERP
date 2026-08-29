import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Eye,
  Search,
  Check,
  Zap,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FuturisticVisualizer } from '../../components/common/FuturisticVisualizer';
import {
  themeService,
  AnimationThemeConfig
} from '../../services/themeService';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  'All (150)',
  'Quantum Dynamics',
  'Nexus Architecture',
  'Neural Intelligence',
  'Data Stream',
  'Digital Matrix',
  'Core Reactor',
  'High Velocity',
  'Enterprise SaaS',
  'Smart Ecosystem'
];

export const AdminAnimationSettingsPage: React.FC = () => {
  const toast = useToast();
  const all150Themes = themeService.getAll150Themes();
  const currentActiveTheme = themeService.getActiveTheme();

  const [previewTheme, setPreviewTheme] = useState<AnimationThemeConfig>(currentActiveTheme);
  const [activePublishedId, setActivePublishedId] = useState<string>(currentActiveTheme.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All (150)');

  const handleSelectThemeForPreview = (theme: AnimationThemeConfig) => {
    setPreviewTheme(theme);
  };

  const handlePublishTheme = () => {
    const published = themeService.setActiveTheme(previewTheme.id);
    setActivePublishedId(published.id);
    toast.success(`Published "${published.name}" (#${all150Themes.findIndex(t => t.id === published.id) + 1}) to the live Landing Page!`);
  };

  // Filter 150 items by Search and Category
  const filteredThemes = all150Themes.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.badge.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All (150)' || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>150-Theme Visual Engine Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Landing Page 150 Animation Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Click any of the 150 styles below to preview in real-time and deploy to the public landing page
          </p>
        </div>

        <button
          type="button"
          onClick={handlePublishTheme}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Publish "{previewTheme.name}" Live</span>
        </button>
      </div>

      {/* 2-Column: Fixed Live Preview Panel (Left) + Interactive 150 Library (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Real-time Canvas Preview & Active Metadata */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Visualizer Preview</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  activePublishedId === previewTheme.id
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}
              >
                {activePublishedId === previewTheme.id ? '● Active on Landing Page' : '○ Previewing'}
              </span>
            </div>

            {/* Dark 3D Visualizer Canvas */}
            <div className="w-full aspect-square rounded-2xl bg-[#050811] border border-slate-800 p-4 relative overflow-hidden shadow-inner flex items-center justify-center">
              <FuturisticVisualizer theme={previewTheme} className="w-full h-full" />
            </div>

            {/* Selected Theme Details */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Selected Animation:</span>
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: previewTheme.primaryColor }} />
                  {previewTheme.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Architecture Category:</span>
                <span className="font-semibold text-blue-600">{previewTheme.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Color Spectrum Hue:</span>
                <span className="font-mono text-slate-700">{previewTheme.particleHue}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Library Index:</span>
                <span className="font-mono text-slate-700">{previewTheme.badge}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                {previewTheme.tagline}
              </p>
            </div>

            {/* 1-Click Publish Action */}
            <button
              type="button"
              onClick={handlePublishTheme}
              className="w-full mt-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Set as Active Landing Page Animation</span>
            </button>
          </div>
        </div>

        {/* Right Column: Full 150 Animation Library Grid with Filter & Search */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-card space-y-5">
            
            {/* Search & Category Filter Header */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    150 Animation Style Library ({filteredThemes.length})
                  </h3>
                  <p className="text-xs text-slate-500">Click any card to load live in the preview visualizer</p>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search 150 styles..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 150 Cards Interactive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[650px] overflow-y-auto pr-1">
              {filteredThemes.map((theme, index) => {
                const isSelectedForPreview = previewTheme.id === theme.id;
                const isCurrentlyActive = activePublishedId === theme.id;

                return (
                  <div
                    key={theme.id + index}
                    onClick={() => handleSelectThemeForPreview(theme)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelectedForPreview
                        ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                        : isCurrentlyActive
                        ? 'bg-emerald-50/60 border-emerald-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {theme.name}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {theme.badge}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 block">
                        {theme.category}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-500">{theme.particleHue}° Spectrum</span>
                      <span
                        className={`font-extrabold ${
                          isCurrentlyActive
                            ? 'text-emerald-600'
                            : isSelectedForPreview
                            ? 'text-blue-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {isCurrentlyActive
                          ? '● Active'
                          : isSelectedForPreview
                          ? 'Previewing'
                          : 'Click to Preview'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
