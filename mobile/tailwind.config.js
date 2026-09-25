/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        amber: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
