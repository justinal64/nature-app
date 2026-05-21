/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0F1A0B',
        card: '#1A2E14',
        primary: '#56AB2F',
        secondary: '#A8E063',
        text: '#F0F7EE',
        textDim: '#92B896',
        border: '#2A4225',
        success: '#00C853',
      },
    },
  },
  plugins: [],
};
