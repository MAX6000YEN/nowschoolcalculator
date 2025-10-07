/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3A2AF5',
        secondary: '#FFBE98',
      },
      fontFamily: {
        sans: ['Nexa', 'sans-serif'],
      },
    },
  },
  plugins: [],
}