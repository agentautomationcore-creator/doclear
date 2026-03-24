import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark premium theme
        bg: '#1A1A2E',
        card: '#16213E',
        'card-hover': '#1C2A4A',
        surface: '#0F3460',
        primary: '#0066FF',
        danger: '#FF4757',
        success: '#2ED573',
        warning: '#FFA502',
        muted: '#7F8C9B',
        'text-primary': '#E8E8E8',
        'text-secondary': '#A0A0B0',
        border: '#2A2A4A',
        // Category colors — bright on dark
        'category-taxes': '#FFD700',
        'category-insurance': '#45AAF2',
        'category-bank': '#2ED573',
        'category-fines': '#FF4757',
        'category-housing': '#FFA502',
        'category-health': '#FF6B81',
        'category-employment': '#A55EEA',
        'category-legal': '#FFFFFF',
        'category-other': '#95A5A6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
