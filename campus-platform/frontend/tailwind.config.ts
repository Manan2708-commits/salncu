import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6366f1', dark: '#4f46e5' },
        accent: '#8b5cf6',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};

export default config;
