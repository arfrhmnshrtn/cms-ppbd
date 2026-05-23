/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        text: {
          main: '#0f172a',
          muted: '#64748b',
        },
        bg: {
          card: '#ffffff',
          soft: '#f8fafc',
        },
        border: '#e2e8f0',
        primary: '#3b82f6',
      }
    },
  },
  plugins: [],
}
