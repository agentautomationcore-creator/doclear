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
        primary: '#2563EB',
        danger: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
        muted: '#6B7280',
        'category-taxes': '#4A90D9',
        'category-insurance': '#7B68EE',
        'category-bank': '#2ECC71',
        'category-fines': '#E74C3C',
        'category-housing': '#F39C12',
        'category-health': '#E91E63',
        'category-employment': '#9B59B6',
        'category-legal': '#34495E',
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
