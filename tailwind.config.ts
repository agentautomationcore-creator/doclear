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
        // Apple-like light premium theme
        bg: '#FFFFFF',
        card: '#F5F5F7',
        'card-hover': '#EDEDF0',
        surface: '#E8E8ED',
        primary: '#2A2A3E',
        danger: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
        muted: '#86868B',
        'text-primary': '#1D1D1F',
        'text-secondary': '#86868B',
        border: '#D2D2D7',
        // Category colors — vibrant on light
        'category-taxes': '#AF52DE',
        'category-insurance': '#5AC8FA',
        'category-bank': '#34C759',
        'category-fines': '#FF3B30',
        'category-housing': '#FF9500',
        'category-health': '#FF2D55',
        'category-employment': '#5856D6',
        'category-legal': '#2A2A3E',
        'category-other': '#8E8E93',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
