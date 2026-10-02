/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#141414',
        muted: '#6b6b6b',
        line: '#e7e5e2',
        accent: '#f6d9d6',
        'accent-dark': '#eab4ae'
      },
      maxWidth: {
        content: '1160px'
      }
    }
  },
  plugins: []
};
