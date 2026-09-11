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
        background: '#090D16',
        'background-elevated': '#0D1322',
        surface: '#111827',
        'surface-elevated': '#161F33',
        'surface-card': '#121A2B',
        'surface-card-hover': '#18233A',
        border: '#1F293D',
        'border-light': '#2A3752',
        brand: {
          DEFAULT: '#00E599',
          hover: '#00C885',
          light: '#5CF2B8',
          glow: 'rgba(0, 229, 153, 0.25)',
        },
        primary: {
          DEFAULT: '#00E599',
          hover: '#00C885',
          light: '#5CF2B8',
        },
        macro: {
          protein: '#3B82F6',
          'protein-glow': 'rgba(59, 130, 246, 0.25)',
          carbs: '#F59E0B',
          'carbs-glow': 'rgba(245, 158, 11, 0.25)',
          fats: '#A855F7',
          'fats-glow': 'rgba(168, 85, 247, 0.25)',
          calories: '#FF5722',
          'calories-glow': 'rgba(255, 87, 34, 0.25)',
        },
        accent: {
          DEFAULT: '#00E599',
          hover: '#00C885',
        },
        warning: '#F59E0B',
        danger: '#EF4444',
        text: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          muted: '#64748B',
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
      boxShadow: {
        'glow-brand': '0 0 20px rgba(0, 229, 153, 0.25)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.25)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.25)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.25)',
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
      },
      animation: {
        shimmer: 'shimmer 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        fadeIn: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
