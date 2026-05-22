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
      },
    },
  },
  plugins: [],
};
