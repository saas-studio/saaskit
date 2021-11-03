const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: ['./saaskit.config.js','./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
      }},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
