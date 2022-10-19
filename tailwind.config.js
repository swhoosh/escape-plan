/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#282a36',
        darkgrey: '#3e4153',
        grey: '#44475a',
        white: '#f8f8f2',
        blue: '#6272a4',
        cyan: '#8be9fd',
        green: '#50fa7b',
        orange: '#ffb86c',
        pink: '#ff79c6',
        purple: '#bd93f9',
        red: '#ff5555',
        yellow: '#f1fa8c',
      },
      fontFamily: { comfy: 'Comfortaa' },
    },
  },
  plugins: [],
}
