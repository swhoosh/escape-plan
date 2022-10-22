/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        drac_black: '#282a36',
        drac_darkgrey: '#3e4153',
        drac_grey: '#44475a',
        drac_lightgrey: '#7C7E8B',
        drac_white: '#f8f8f2',
        drac_blue: '#6272a4',
        drac_cyan: '#8be9fd',
        drac_darkgreen: '#48e16e',
        drac_green: '#50fa7b',
        drac_success: '#22c55e',
        drac_orange: '#ffb86c',
        drac_pink: '#ff79c6',
        drac_purple: '#bd93f9',
        drac_red: '#ff5555',
        drac_lightred: '#FFAAAA',
        drac_yellow: '#f1fa8c',
      },
      fontFamily: { comfy: 'Comfortaa' },
    },
  },
  plugins: [],
}
