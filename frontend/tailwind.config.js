/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          blue: "#1e3a8a",
          dark: "#0f172a",
          light: "#f8fafc",
          accent: "#2563eb",
          gold: "#d97706",
          green: "#16a34a",
          red: "#dc2626"
        }
      }
    },
  },
  plugins: [],
}
