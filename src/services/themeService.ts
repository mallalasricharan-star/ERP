export type VisualAnimationType =
  | 'quantum-gyro'
  | 'neural-mesh'
  | 'cosmic-orbit'
  | 'waveform-pulse'
  | 'cyber-tunnel'
  | 'warp-hyperspace'
  | 'polygon-crystal'
  | 'plasma-vortex';

export interface AnimationThemeConfig {
  id: string;
  name: string;
  category: string;
  visualType: VisualAnimationType;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  badge: string;
  particleHue: number;
  ringSpeed: number;
  pulseRate: number;
}

export const CONCEPT_150_NAMES: string[] = [
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

function determineVisualType(name: string): VisualAnimationType {
  const n = name.toLowerCase();
  if (n.includes('orbit') || n.includes('sphere')) return 'cosmic-orbit';
  if (n.includes('pulse') || n.includes('wave') || n.includes('frequency')) return 'waveform-pulse';
  if (n.includes('matrix') || n.includes('grid') || n.includes('digital')) return 'cyber-tunnel';
  if (n.includes('velocity') || n.includes('nova') || n.includes('flux') || n.includes('drive')) return 'warp-hyperspace';
  if (n.includes('vector') || n.includes('axis') || n.includes('enterprise')) return 'polygon-crystal';
  if (n.includes('flow') || n.includes('stream') || n.includes('fusion')) return 'plasma-vortex';
  if (n.includes('neural') || n.includes('nexus') || n.includes('network') || n.includes('bridge') || n.includes('link')) return 'neural-mesh';
  return 'quantum-gyro';
}

function generateThemeConfig(name: string, index: number): AnimationThemeConfig {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const visualType = determineVisualType(name);
  
  // Category detection
  let category = 'Quantum Dynamics';
  let hue = 180; // default cyan
  let pri = '#06b6d4';
  let sec = '#10b981';

  if (name.includes('Nexus')) {
    category = 'Nexus Architecture';
    hue = 220; // Electric Blue
    pri = '#3b82f6';
    sec = '#8b5cf6';
  } else if (name.includes('Neural')) {
    category = 'Neural Intelligence';
    hue = 155; // Emerald / Mint
    pri = '#10b981';
    sec = '#06b6d4';
  } else if (name.includes('Data')) {
    category = 'Data Stream';
    hue = 195; // Ice Blue
    pri = '#0ea5e9';
    sec = '#6366f1';
  } else if (name.includes('Digital')) {
    category = 'Digital Matrix';
    hue = 270; // Purple
    pri = '#a855f7';
    sec = '#ec4899';
  } else if (name.includes('Nova') || name.includes('Cyber') || name.includes('Velocity')) {
    category = 'High Velocity';
    hue = 35; // Amber / Coral
    pri = '#f59e0b';
    sec = '#ef4444';
  } else if (name.includes('Infinity') || name.includes('Horizon')) {
    category = 'Infinity Horizon';
    hue = 310; // Magenta / Neon
    pri = '#d946ef';
    sec = '#3b82f6';
  } else if (name.includes('Enterprise')) {
    category = 'Enterprise SaaS';
    hue = 210; // Deep Sapphire
    pri = '#2563eb';
    sec = '#38bdf8';
  } else if (name.includes('Smart')) {
    category = 'Smart Ecosystem';
    hue = 165; // Mint Green
    pri = '#059669';
    sec = '#3b82f6';
  } else if (name.includes('Core')) {
    category = 'Core Reactor';
    hue = 185; // Cyan / Aqua
    pri = '#0891b2';
    sec = '#10b981';
  }

  const adjustedHue = (hue + (index * 3)) % 360;

  return {
    id: slug,
    name,
    category,
    visualType,
    tagline: `Engineered with ${visualType.replace('-', ' ').toUpperCase()} geometry, live particle dynamics & spectrum physics.`,
    primaryColor: pri,
    secondaryColor: sec,
    glowColor: `hsla(${adjustedHue}, 85%, 55%, 0.35)`,
    badge: `Concept #${index + 1}`,
    particleHue: adjustedHue,
    ringSpeed: 0.005 + ((index % 5) * 0.003),
    pulseRate: 2 + ((index % 4) * 0.8)
  };
}

// Build 150 Themes Map
export const ALL_150_THEMES: Record<string, AnimationThemeConfig> = {};
CONCEPT_150_NAMES.forEach((name, idx) => {
  const config = generateThemeConfig(name, idx);
  ALL_150_THEMES[config.id] = config;
  ALL_150_THEMES[name] = config;
});

const THEME_STORAGE_KEY = 'eduprime_active_animation_theme_id';

export const themeService = {
  getActiveTheme(): AnimationThemeConfig {
    try {
      const savedKey = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedKey && ALL_150_THEMES[savedKey]) {
        return ALL_150_THEMES[savedKey];
      }
    } catch {}
    return ALL_150_THEMES['quantum-core'] || generateThemeConfig('Quantum Core', 0);
  },

  setActiveTheme(themeIdOrName: string): AnimationThemeConfig {
    const target = ALL_150_THEMES[themeIdOrName] || ALL_150_THEMES[themeIdOrName.toLowerCase().replace(/\s+/g, '-')];
    if (target) {
      localStorage.setItem(THEME_STORAGE_KEY, target.id);
      window.dispatchEvent(new Event('theme-changed'));
      return target;
    }
    return this.getActiveTheme();
  },

  getAll150Themes(): AnimationThemeConfig[] {
    return CONCEPT_150_NAMES.map((name, idx) => generateThemeConfig(name, idx));
  }
};
