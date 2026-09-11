import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          deep: '#070A0F',
          DEFAULT: '#070A0F',
          carbon: '#0E131F',
          elevated: '#141C2E',
          muted: '#1A243B',
        },
        surface: {
          DEFAULT: '#0E131F',
          elevated: '#141C2E',
          card: '#0E131F',
          'card-hover': '#162035',
          muted: '#1A243B',
        },
        border: {
          DEFAULT: '#1F293D',
          subtle: 'rgba(255, 255, 255, 0.08)',
          light: '#2A3752',
          focus: '#D4FF00',
        },
        primary: {
          DEFAULT: '#D4FF00', // Electric Lime
          hover: '#BCE600',
          light: '#E2FF4D',
          muted: 'rgba(212, 255, 0, 0.15)',
          glow: 'rgba(212, 255, 0, 0.25)',
        },
        brand: {
          DEFAULT: '#D4FF00',
          hover: '#BCE600',
          emerald: '#00E599',
          glow: 'rgba(212, 255, 0, 0.25)',
        },
        macro: {
          protein: '#3B82F6',
          'protein-glow': 'rgba(59, 130, 246, 0.25)',
          carbs: '#F59E0B',
          'carbs-glow': 'rgba(245, 158, 11, 0.25)',
          fat: '#A855F7',
          'fats-glow': 'rgba(168, 85, 247, 0.25)',
          calories: '#FF5722',
          'calories-glow': 'rgba(255, 87, 34, 0.25)',
        },
        feedback: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          muted: '#475569',
          accent: '#D4FF00',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'Outfit', 'sans-serif'],
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '22px',
        pill: '9999px',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(212, 255, 0, 0.25)',
        'glow-emerald': '0 0 20px rgba(0, 229, 153, 0.25)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.25)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.25)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.25)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        fadeIn: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pulseSubtle: 'pulseSubtle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
