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
    extend: {
      // Figma UI-Kit palette (mirrors the CSS variables in styles/index.css)
      colors: {
        primary: '#407BFF',
        secondary: '#9EBBFF',
        text: '#2F2F2F',
        'bg-light': '#ECF2FF',
        divider: '#D7E3FF',
        accent: '#FF9D43',
        error: '#EF5050',
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        btn: '0px 4px 8px 0px rgba(64, 123, 255, 0.34)',
        'btn-hover': '0px 4px 14px 0px rgba(64, 123, 255, 0.54)',
      },
    },
  },
  plugins: [],
};
