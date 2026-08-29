export type AnimationThemeId =
  | 'quantum-core'
  | 'nexus-prime'
  | 'neural-pulse'
  | 'digital-matrix'
  | 'enterprise-core'
  | 'cyber-flux';

export interface AnimationThemeConfig {
  id: AnimationThemeId;
  name: string;
  category: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  badge: string;
  particleHue: number;
}

export const ANIMATION_THEMES: Record<AnimationThemeId, AnimationThemeConfig> = {
  'quantum-core': {
    id: 'quantum-core',
    name: 'Quantum Core',
    category: 'Quantum Dynamics',
    tagline: 'Gyroscopic laser orbits with central fusion core & glowing reactor HUD',
    primaryColor: '#06b6d4', // Cyan
    secondaryColor: '#10b981', // Emerald
    glowColor: 'rgba(6, 182, 212, 0.4)',
    badge: 'Quantum Grade',
    particleHue: 180
  },
  'nexus-prime': {
    id: 'nexus-prime',
    name: 'Nexus Prime',
    category: 'Nexus Architecture',
    tagline: 'Flowing connected data streams & neural communication bridges',
    primaryColor: '#3b82f6', // Blue
    secondaryColor: '#8b5cf6', // Purple
    glowColor: 'rgba(59, 130, 246, 0.4)',
    badge: 'Enterprise Nexus',
    particleHue: 220
  },
  'neural-pulse': {
    id: 'neural-pulse',
    name: 'Neural Pulse',
    category: 'Neural Networks',
    tagline: 'Constellation intelligence grid with interactive mouse node physics',
    primaryColor: '#10b981', // Emerald
    secondaryColor: '#06b6d4', // Cyan
    glowColor: 'rgba(16, 185, 129, 0.4)',
    badge: 'Neural Engine',
    particleHue: 155
  },
  'digital-matrix': {
    id: 'digital-matrix',
    name: 'Digital Matrix',
    category: 'Digital Stream',
    tagline: 'Geometric high-frequency data matrices and cyber coordinates',
    primaryColor: '#a855f7', // Purple
    secondaryColor: '#ec4899', // Pink
    glowColor: 'rgba(168, 85, 247, 0.4)',
    badge: 'Matrix Architecture',
    particleHue: 280
  },
  'enterprise-core': {
    id: 'enterprise-core',
    name: 'Enterprise Core',
    category: 'Institutional SaaS',
    tagline: 'Fintech-grade deep sapphire glow with smooth telemetry sweeps',
    primaryColor: '#2563eb', // Royal Blue
    secondaryColor: '#38bdf8', // Sky Blue
    glowColor: 'rgba(37, 99, 235, 0.4)',
    badge: 'Enterprise SaaS',
    particleHue: 210
  },
  'cyber-flux': {
    id: 'cyber-flux',
    name: 'Cyber Flux',
    category: 'High Velocity',
    tagline: 'Hyper-speed chromatic light streams with particle acceleration',
    primaryColor: '#f59e0b', // Amber
    secondaryColor: '#ef4444', // Red/Orange
    glowColor: 'rgba(245, 158, 11, 0.4)',
    badge: 'Cyber Stream',
    particleHue: 40
  }
};

const THEME_STORAGE_KEY = 'eduprime_active_animation_theme';

export const themeService = {
  getActiveTheme(): AnimationThemeConfig {
    try {
      const savedId = localStorage.getItem(THEME_STORAGE_KEY) as AnimationThemeId;
      if (savedId && ANIMATION_THEMES[savedId]) {
        return ANIMATION_THEMES[savedId];
      }
    } catch {}
    return ANIMATION_THEMES['quantum-core'];
  },

  setActiveTheme(themeId: AnimationThemeId): void {
    if (ANIMATION_THEMES[themeId]) {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
      // Dispatch storage event so open tabs update in real time
      window.dispatchEvent(new Event('theme-changed'));
    }
  },

  getAllThemes(): AnimationThemeConfig[] {
    return Object.values(ANIMATION_THEMES);
  }
};
