/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        school: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38aaf7',
          500: '#0e8ee9',
          600: '#0270c7',
          700: '#0359a1',
          800: '#074c85',
          900: '#0c406e',
          950: '#08294a',
        },
        sidebar: {
          bg: '#0f172a',
          card: '#1e293b',
          hover: '#334155',
          active: '#2563eb',
          text: '#94a3b8',
          textHover: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 15px rgba(37, 99, 235, 0.3)',
      }
    },
  },
  plugins: [],
}
