export interface LetterRevealConfig {
  id: string;
  name: string;
  firstWord: string;
  secondWord: string;
  category: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
}

export const LETTER_ANIMATION_STYLES: LetterRevealConfig[] = [
  {
    id: 'quantum-reveal',
    name: 'Quantum Reveal',
    firstWord: 'QUANTUM',
    secondWord: 'CORE',
    category: 'Quantum Dynamics',
    description: 'Blur-to-sharp focus with laser underline expansion and photonic backlight flare',
    primaryColor: '#06b6d4',
    secondaryColor: '#10b981',
    glowColor: 'rgba(6,182,212,0.45)'
  },
  {
    id: 'nexus-expand',
    name: 'Nexus Expand',
    firstWord: 'NEXUS',
    secondWord: 'FLOW',
    category: 'Nexus Architecture',
    description: 'Letter-by-letter horizontal expansion with energetic cyan and emerald gradient',
    primaryColor: '#38bdf8',
    secondaryColor: '#818cf8',
    glowColor: 'rgba(56,189,248,0.45)'
  },
  {
    id: 'core-fusion',
    name: 'Core Fusion',
    firstWord: 'CORE',
    secondWord: 'MATRIX',
    category: 'Core Dynamics',
    description: 'High-energy typography fusion with plasma purple and pink hues',
    primaryColor: '#a855f7',
    secondaryColor: '#ec4899',
    glowColor: 'rgba(168,85,247,0.45)'
  },
  {
    id: 'neural-pulse',
    name: 'Neural Pulse',
    firstWord: 'NEURAL',
    secondWord: 'PULSE',
    category: 'Neural AI',
    description: 'Synaptic letter spacing morph with emerald and cyan electric aura',
    primaryColor: '#10b981',
    secondaryColor: '#06b6d4',
    glowColor: 'rgba(16,185,129,0.45)'
  },
  {
    id: 'data-nexus',
    name: 'Data Nexus',
    firstWord: 'DATA',
    secondWord: 'NEXUS',
    category: 'Data Stream',
    description: 'Binary data beam split with deep sapphire blue laser highlights',
    primaryColor: '#0ea5e9',
    secondaryColor: '#3b82f6',
    glowColor: 'rgba(14,165,233,0.45)'
  },
  {
    id: 'digital-orbit',
    name: 'Digital Orbit',
    firstWord: 'DIGITAL',
    secondWord: 'ORBIT',
    category: 'Digital Matrix',
    description: 'Orbital letter assembly with violet and turquoise cosmic glow',
    primaryColor: '#8b5cf6',
    secondaryColor: '#06b6d4',
    glowColor: 'rgba(139,92,246,0.45)'
  },
  {
    id: 'nova-core',
    name: 'Nova Core',
    firstWord: 'NOVA',
    secondWord: 'CORE',
    category: 'Cosmic Flare',
    description: 'Light sweep stellar flare with solar amber and crimson spectrum',
    primaryColor: '#f59e0b',
    secondaryColor: '#ef4444',
    glowColor: 'rgba(245,158,11,0.45)'
  },
  {
    id: 'smart-nexus',
    name: 'Horizontal Unfold',
    firstWord: 'SMART',
    secondWord: 'NEXUS',
    category: 'Enterprise SaaS',
    description: 'Smooth sliding horizontal unveil with clean teal and mint tones',
    primaryColor: '#14b8a6',
    secondaryColor: '#10b981',
    glowColor: 'rgba(20,184,166,0.45)'
  },
  {
    id: 'future-grid',
    name: '3D Flip Reveal',
    firstWord: 'FUTURE',
    secondWord: 'GRID',
    category: 'High Velocity',
    description: '3D perspective flip with indigo and violet quantum resonance',
    primaryColor: '#6366f1',
    secondaryColor: '#a855f7',
    glowColor: 'rgba(99,102,241,0.45)'
  },
  {
    id: 'enterprise-nexus',
    name: 'Particle Form',
    firstWord: 'ENTERPRISE',
    secondWord: 'NEXUS',
    category: 'Enterprise SaaS',
    description: 'Particle matrix crystallization into high-impact bold typography',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    glowColor: 'rgba(59,130,246,0.45)'
  },
  {
    id: 'eduprime-erp',
    name: 'EduPrime Ecosystem',
    firstWord: 'EDUPRIME',
    secondWord: 'ERP',
    category: 'Institutional Core',
    description: 'The master institutional identity with lime, emerald, and cyan gradient flow',
    primaryColor: '#06b6d4',
    secondaryColor: '#10b981',
    glowColor: 'rgba(6,182,212,0.45)'
  }
];
