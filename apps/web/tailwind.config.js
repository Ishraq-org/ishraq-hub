/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      bg: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
      },
      text: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
      },
      accent: {
        DEFAULT: 'var(--accent)',
        hover: 'var(--accent-hover)',
      },
      border: 'var(--border)',
      shadow: 'var(--shadow)',
      success: 'var(--success)',
      danger: 'var(--danger)',
      warning: 'var(--warning)',
      info: 'var(--info)',
      focus: {
        ring: 'var(--focus-ring)',
      },
    },
    extend: {
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        amharic: ['var(--font-amharic)'],
        arabic: ['var(--font-arabic)'],
      },
    },
  },
  plugins: [],
};
