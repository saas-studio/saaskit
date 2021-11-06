const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./components/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      animation: {
       'spin-slow': 'spin 10s linear infinite',
      },
      colors: {
        primary: colors.indigo,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
