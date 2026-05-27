import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#07111d',
        surface: '#0f1d2c',
        primary: '#34d4ff',
        primaryDark: '#1d7faf',
        accent: '#f3a84d',
        muted: '#9fb6d6',
        border: 'rgba(255,255,255,0.12)',
      },
      boxShadow: {
        glow: '0 30px 70px rgba(52, 212, 255, 0.12)',
        panel: '0 20px 70px rgba(0, 0, 0, 0.18)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top left, rgba(52,212,255,0.18), transparent 26%), radial-gradient(circle at bottom right, rgba(123,214,255,0.12), transparent 22%)',
      },
      borderRadius: {
        xl2: '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
