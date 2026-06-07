import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background:   '#0a0a0b',
        surface:      '#131316',
        surfaceHover: '#1a1a1f',
        border:       '#2a2a32',
        accent: {
          DEFAULT: '#7c6cfc',
          light:   '#9d90fd',
          muted:   '#3d3570',
        },
        text: {
          primary:   '#f0f0f5',
          secondary: '#8888a0',
          muted:     '#555560',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error:   '#ef4444',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 16px 40px rgba(0,0,0,0.3)',
        glow:       '0 0 20px rgba(124, 108, 252, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
