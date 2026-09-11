/**
 * XEVYRA Design Tokens
 * Athletic, dark-mode first, electric lime accents, obsidian surfaces.
 * Tagline: TRAIN. FUEL. EVOLVE.
 */

export const tokens = {
  colors: {
    // Core Obsidian & Carbon Surfaces
    background: {
      deep: '#070A0F',     // Deep Obsidian base
      carbon: '#0E131F',   // Main carbon surface
      elevated: '#141C2E', // Elevated cards & interactive panels
      muted: '#1A243B',    // Subdued backgrounds
    },
    // Athletic Accents
    primary: {
      DEFAULT: '#D4FF00',  // Electric Lime (active states, primary CTAs, PRs)
      hover: '#BCE600',
      muted: 'rgba(212, 255, 0, 0.15)',
      glow: 'rgba(212, 255, 0, 0.25)',
    },
    secondary: {
      DEFAULT: '#00E599',  // Performance Emerald Green
      hover: '#00C885',
      muted: 'rgba(0, 229, 153, 0.15)',
    },
    // High-Contrast Athletic Typography
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8', // Cool Slate Gray
      tertiary: '#64748B',  // Subdued Slate
      muted: '#475569',
      accent: '#D4FF00',
    },
    // Borders & Glass
    border: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      default: '#1F293D',
      light: '#2A3752',
      focus: '#D4FF00',
    },
    // Semantic Nutrition & Performance
    macro: {
      protein: '#3B82F6',   // Cyber Blue
      proteinGlow: 'rgba(59, 130, 246, 0.25)',
      carbs: '#F59E0B',     // Warm Amber
      carbsGlow: 'rgba(245, 158, 11, 0.25)',
      fat: '#A855F7',       // Performance Violet
      fatGlow: 'rgba(168, 85, 247, 0.25)',
      calories: '#FF5722',  // Radiant Coral/Orange
      caloriesGlow: 'rgba(255, 87, 34, 0.25)',
    },
    // Semantic Feedback
    feedback: {
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
    },
  },
  typography: {
    fontFamily: {
      sans: "var(--font-inter), 'Inter', system-ui, -apple-system, sans-serif",
      display: "var(--font-outfit), 'Outfit', system-ui, sans-serif",
    },
    fontSize: {
      display: ['2.25rem', { lineHeight: '2.5rem', fontWeight: '800', letterSpacing: '-0.03em' }],
      h1: ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700', letterSpacing: '-0.02em' }],
      h2: ['1.5rem', { lineHeight: '1.875rem', fontWeight: '700', letterSpacing: '-0.02em' }],
      h3: ['1.25rem', { lineHeight: '1.625rem', fontWeight: '600', letterSpacing: '-0.01em' }],
      body: ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
      bodySmall: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
      label: ['0.75rem', { lineHeight: '1rem', fontWeight: '600', letterSpacing: '0.05em' }],
      caption: ['0.6875rem', { lineHeight: '0.875rem', fontWeight: '500' }],
      metric: ['1.5rem', { lineHeight: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }],
      metricLarge: ['2.5rem', { lineHeight: '2.75rem', fontWeight: '800', letterSpacing: '-0.03em' }],
    },
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '22px',
    pill: '9999px',
  },
  shadows: {
    glowPrimary: '0 0 20px rgba(212, 255, 0, 0.25)',
    glowEmerald: '0 0 20px rgba(0, 229, 153, 0.25)',
    glowProtein: '0 0 20px rgba(59, 130, 246, 0.25)',
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
    cardElevated: '0 10px 30px -4px rgba(0, 0, 0, 0.7)',
  },
  breakpoints: {
    xs: '375px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1440px',
  },
  zIndex: {
    base: 0,
    card: 1,
    header: 40,
    nav: 50,
    modal: 100,
    toast: 200,
  },
} as const;

export type DesignTokens = typeof tokens;
