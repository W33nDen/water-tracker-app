/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'mobile': '320px',
      'tablet': '768px',
      'desktop': '1440px',
    },
    extend: {},
  },
  plugins: [],
};
