/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Agency-specific colors
        nserc: {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
          dark: '#1e40af',
        },
        sshrc: {
          DEFAULT: '#16a34a',
          light: '#4ade80',
          dark: '#15803d',
        },
        cihr: {
          DEFAULT: '#dc2626',
          light: '#f87171',
          dark: '#991b1b',
        },
      },
    },
  },
  plugins: [],
}