/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#3D2519',
        clay: '#B85C3A',
        sand: '#E8D5B7',
        sage: '#9CAB87',
        dusk: '#6B4E6B',
        cream: '#F4ECDA',
        bark: '#8B6F47',
        gold: '#D4A437',
        night: '#0A0A18',
        background: '#F4ECDA',
        surface: '#FFFFFF',
        text: '#3D2519',
        textDim: '#8B6F47',
        primary: '#B85C3A',
        secondary: '#9CAB87',
        border: '#E8D5B7',
      },
    },
  },
  plugins: [],
};
