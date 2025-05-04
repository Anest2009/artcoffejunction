/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fff7e6',
          100: '#fff3d9',
          200: '#f5f1e6',
          300: '#e8e3d9',
          400: '#d4af37',
          500: '#C08A2D',
          600: '#A47420',
        },
        brown: {
          500: '#4B2E2B',
          600: '#3B2624',
          700: '#2B1E1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
