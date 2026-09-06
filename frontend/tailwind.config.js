/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          white: '#FFFFFF',
          light: '#FAFAF7',
        },
        secondary: {
          pink: '#F7E8EA',
          sage: '#E8F0EA',
        },
        accent: {
          navy: '#172B49',
          sage: '#6F8F7A',
          rose: '#D98C9A',
          coral: '#D98C9A',
        },
        text: {
          dark: '#26364D',
          light: '#667085',
        },
        success: '#2F7D5A',
        error: '#C94C5A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(23, 43, 73, 0.08)',
        card: '0 6px 24px rgba(23, 43, 73, 0.07)',
      },
    },
  },
  plugins: [],
}
