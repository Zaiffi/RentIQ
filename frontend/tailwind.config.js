/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        coral: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#ff5a5f',
          600: '#e0484d',
          700: '#c7383d',
        }
      }
    },
  },
  plugins: [],
}