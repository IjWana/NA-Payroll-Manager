/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        army: {
          green: '#3A5F0B',
          accent: '#C5A300',
        },
      },
    },
  },
  plugins: [],
};
