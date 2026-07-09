/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          dark: '#0b0f19',
          light: '#f8fafc'
        },
        steel: {
          dark: '#141a27',
          light: '#ffffff'
        },
        cobalt: {
          dark: '#3b82f6',
          light: '#2563eb'
        },
        amberOrange: {
          dark: '#f59e0b',
          light: '#ea580c'
        },
        amethyst: '#8b5cf6',
        emerald: '#10b981',
        coral: '#ef4444'
      },
      borderRadius: {
        'xl': '6px',
        'lg': '4px',
        'md': '4px',
        'sm': '2px'
      },
      boxShadow: {
        'none': 'none'
      }
    },
  },
  plugins: [],
}
