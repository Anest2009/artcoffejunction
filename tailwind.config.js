/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF8E9',
          100: '#F7F0D4',
          200: '#F0E2A9',
          300: '#E9D47F',
          400: '#E2C654',
          500: '#D4AF37', // Main gold color
          600: '#B89220',
          700: '#9C7619',
          800: '#805A12',
          900: '#644E0B',
        },
        brown: {
          50: '#F5F0EF',
          100: '#EBE1DF',
          200: '#D7C3BF',
          300: '#C3A59F',
          400: '#AF877F',
          500: '#8C6159',
          600: '#6E4C45',
          700: '#5A3D38',
          800: '#4B2E2B', // Main brown color
          900: '#3C1F1D',
        },
        cream: {
          50: '#FFFDF7',
          100: '#FFF9E9',
          200: '#FFF3D3',
          300: '#FFEDC2',
          400: '#FFE7B0',
          500: '#FFE19F',
          600: '#FFD97D',
          700: '#FFD15B',
          800: '#FFC939',
          900: '#FFC117',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neumorphic': '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
        'neumorphic-inset': 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}
