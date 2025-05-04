/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f1f5ee',
          100: '#e3ebdd',
          200: '#c7d6bc',
          300: '#a3b18a', // Main green
          400: '#899e71',
          500: '#6e8356',
          600: '#536543',
          700: '#3c4930',
          800: '#232b1c',
          900: '#121610',
        },
        cream: {
          50: '#ffffff',
          100: '#fffff9',
          200: '#fffff3',
          300: '#fff5e1', // Main cream
          400: '#f5e9d2',
          500: '#e9d4b8',
          600: '#d2b89e',
          700: '#b89e83',
          800: '#9e8367',
          900: '#83694d',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'neumorphic': '12px 12px 24px #d1d9c1, -12px -12px 24px #ebf3db',
        'neumorphic-inset': 'inset 8px 8px 16px #d1d9c1, inset -8px -8px 16px #ebf3db',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
      },
    },
  },
  plugins: [],
};